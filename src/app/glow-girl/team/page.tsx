import { requireGlowGirl } from '@/lib/auth'
import { MyPod } from '@/components/my-pod'

export default async function TeamPage() {
  const { glowGirl } = await requireGlowGirl()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">My Team</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          Your pod, your people.
        </p>
      </div>

      <MyPod glowGirlId={glowGirl.id} glowGirlName={glowGirl.brand_name || 'You'} />
    </div>
  )
}
