const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_WORKSPACE_URL = process.env.SLACK_WORKSPACE_URL || ''

async function slackApi(method: string, body: Record<string, unknown>) {
  if (!SLACK_BOT_TOKEN) {
    console.warn('[Slack] No SLACK_BOT_TOKEN set, skipping:', method)
    return null
  }

  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!data.ok) {
    console.error(`[Slack] ${method} failed:`, data.error, data)
  }
  return data
}

/**
 * Create a private Slack channel for a Glow Girl's downline pod ("Glow Babes").
 * Returns the channel ID or null on failure.
 */
export async function createPodChannel(brandName: string, slug: string): Promise<string | null> {
  const channelName = `glow-babes-${slug}`.slice(0, 80).toLowerCase()

  const result = await slackApi('conversations.create', {
    name: channelName,
    is_private: true,
  })

  if (!result?.ok) {
    // Channel might already exist
    if (result?.error === 'name_taken') {
      const existing = await findChannelByName(channelName)
      return existing
    }
    return null
  }

  const channelId = result.channel.id

  // Set channel topic & purpose
  await slackApi('conversations.setTopic', {
    channel: channelId,
    topic: `${brandName}'s Glow Babes pod`,
  })

  await slackApi('conversations.setPurpose', {
    channel: channelId,
    purpose: `Private pod channel for ${brandName} and her direct recruits`,
  })

  // Post welcome message
  await slackApi('chat.postMessage', {
    channel: channelId,
    text: `Welcome to *${brandName}'s Glow Babes* pod! This is your private space to connect, share tips, and support each other. Let's glow together!`,
  })

  return channelId
}

/**
 * Invite a user to a Slack channel by their email.
 * First looks up the Slack user by email, then invites them.
 */
export async function inviteToChannel(channelId: string, email: string): Promise<boolean> {
  // Look up user by email
  const userResult = await slackApi('users.lookupByEmail', { email })

  if (!userResult?.ok) {
    console.warn(`[Slack] Could not find user by email: ${email}`, userResult?.error)
    return false
  }

  const slackUserId = userResult.user.id

  const inviteResult = await slackApi('conversations.invite', {
    channel: channelId,
    users: slackUserId,
  })

  if (!inviteResult?.ok) {
    // Already in channel is fine
    if (inviteResult?.error === 'already_in_channel') return true
    console.warn(`[Slack] invite failed for ${email}:`, inviteResult?.error)
    return false
  }

  return true
}

/**
 * Find a private channel by name.
 */
async function findChannelByName(name: string): Promise<string | null> {
  const result = await slackApi('conversations.list', {
    types: 'private_channel',
    limit: 200,
  })

  if (!result?.ok) return null

  const channel = result.channels?.find((c: { name: string }) => c.name === name)
  return channel?.id || null
}

/**
 * Build a deep link to open a Slack channel.
 */
export function getSlackChannelLink(channelId: string): string {
  return `https://${SLACK_WORKSPACE_URL}/archives/${channelId}`
}

/**
 * Send a Slack notification when a new order is placed.
 */
export async function notifyNewOrder({
  productNames,
  amountCents,
  shippingName,
  shippingAddress,
  glowGirlName,
  orderId,
}: {
  productNames: string[]
  amountCents: number
  shippingName: string
  shippingAddress: { email: string; street: string; city: string; state: string; zip: string }
  glowGirlName?: string | null
  orderId: string
}) {
  const channel = process.env.SLACK_ORDERS_CHANNEL || '#orders'
  const amount = `$${(amountCents / 100).toFixed(2)}`
  const items = productNames.join(', ')
  const address = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`
  await slackApi('chat.postMessage', {
    channel,
    text: `New order! ${items} — ${amount}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Order', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Products:*\n${items}` },
          { type: 'mrkdwn', text: `*Amount:*\n${amount}` },
          { type: 'mrkdwn', text: `*Customer:*\n${shippingName}` },
          { type: 'mrkdwn', text: `*Email:*\n${shippingAddress.email}` },
          { type: 'mrkdwn', text: `*Ship to:*\n${address}` },
          { type: 'mrkdwn', text: `*Sold by:*\n${glowGirlName || 'Direct'}` },
        ],
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Order ID: \`${orderId}\`` },
        ],
      },
    ],
  })
}

/**
 * Invite a user to the Slack workspace by email.
 * Requires admin.users.invite scope (Business+ or Enterprise plan).
 * Falls back silently if not available.
 */
async function inviteToWorkspace(email: string): Promise<boolean> {
  // Try the standard admin invite (Business+ plans)
  const result = await slackApi('admin.users.invite', {
    team_id: process.env.SLACK_TEAM_ID || '',
    email,
    channel_ids: process.env.SLACK_DEFAULT_CHANNEL_ID || '',
  })

  if (result?.ok) return true
  if (result?.error === 'already_invited' || result?.error === 'already_in_team') return true

  // Try legacy invite (works on free/pro plans)
  const legacyResult = await slackApi('users.admin.invite', {
    email,
    set_active: true,
  })

  if (legacyResult?.ok) return true
  if (legacyResult?.error === 'already_invited' || legacyResult?.error === 'already_in_team') return true

  // Both failed — notify team in Slack so they can manually invite
  console.warn(`[Slack] Auto-invite failed for ${email}, notifying team`)
  await slackApi('chat.postMessage', {
    channel: process.env.SLACK_ORDERS_CHANNEL || '#orders',
    text: `New Glow Girl needs a Slack invite: *${email}*\nAuto-invite failed — please send manually.`,
  })

  return false
}

/**
 * Send a Slack notification when a new lead is submitted.
 * Posts to the Glow Girl's pod channel if available, otherwise to orders channel.
 */
export async function notifyNewLead({
  glowGirlName,
  slackChannelId,
  leadName,
  leadEmail,
  leadPhone,
  leadInstagram,
  leadLocation,
  leadIncomeGoal,
  interest,
  message,
}: {
  glowGirlName: string
  slackChannelId: string | null
  leadName: string
  leadEmail: string
  leadPhone: string | null
  leadInstagram: string | null
  leadLocation: string | null
  leadIncomeGoal: string | null
  interest: string
  message: string | null
}) {
  const channel = slackChannelId || process.env.SLACK_ORDERS_CHANNEL || '#orders'

  const interestLabel =
    interest === 'become_glow_girl' ? 'Become a Glow Girl' :
    interest === 'products' ? 'Shop Products' : 'General Interest'

  const fields = [
    { type: 'mrkdwn' as const, text: `*Name:*\n${leadName}` },
    { type: 'mrkdwn' as const, text: `*Email:*\n${leadEmail}` },
    { type: 'mrkdwn' as const, text: `*Interest:*\n${interestLabel}` },
  ]

  if (leadPhone) {
    fields.push({ type: 'mrkdwn', text: `*Phone:*\n${leadPhone}` })
  }

  if (leadInstagram) {
    fields.push({ type: 'mrkdwn', text: `*Instagram:*\n${leadInstagram}` })
  }

  if (leadLocation) {
    fields.push({ type: 'mrkdwn', text: `*Location:*\n${leadLocation}` })
  }

  if (leadIncomeGoal) {
    fields.push({ type: 'mrkdwn', text: `*Income Goal:*\n${leadIncomeGoal}` })
  }

  if (message) {
    fields.push({ type: 'mrkdwn', text: `*Message:*\n${message}` })
  }

  await slackApi('chat.postMessage', {
    channel,
    text: `New lead for ${glowGirlName}: ${leadName} (${interestLabel})`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Lead', emoji: true },
      },
      {
        type: 'section',
        fields,
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Submitted to *${glowGirlName}*'s connect form` },
        ],
      },
    ],
  })
}

/**
 * Full onboarding flow when a Glow Girl is approved:
 * 1. Invite her to the Slack workspace (if not already a member)
 * 2. Create her "Glow Babes" channel
 * 3. If she has a recruiter, invite her to the recruiter's channel
 */
export async function onboardGlowGirlToSlack({
  brandName,
  slug,
  email,
  recruiterSlackChannelId,
}: {
  brandName: string
  slug: string
  email: string
  recruiterSlackChannelId?: string | null
}): Promise<string | null> {
  // 1. Invite to workspace first (no-op if already a member)
  await inviteToWorkspace(email)

  // 2. Create her own pod channel
  const channelId = await createPodChannel(brandName, slug)

  if (channelId) {
    // Invite her to her own channel
    await inviteToChannel(channelId, email)
  }

  // 3. Invite her to her recruiter's channel (her "Glow Mother" channel)
  if (recruiterSlackChannelId) {
    await inviteToChannel(recruiterSlackChannelId, email)
  }

  return channelId
}
