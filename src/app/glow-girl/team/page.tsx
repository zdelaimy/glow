import { requireGlowGirl } from '@/lib/auth'
import { TeamNetwork } from '@/components/team-network'
import { MyPod } from '@/components/my-pod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function TeamPage() {
  const { glowGirl } = await requireGlowGirl()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">My Team</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          Your pod, your network, your people.
        </p>
      </div>

      <Tabs defaultValue="pod" className="space-y-6">
        <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1 h-auto">
          <TabsTrigger
            value="pod"
            className="rounded-full text-xs uppercase tracking-[0.15em] px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm text-[#6E6A62]/50"
          >
            My Pod
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="rounded-full text-xs uppercase tracking-[0.15em] px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm text-[#6E6A62]/50"
          >
            Team Network
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pod">
          <MyPod glowGirlId={glowGirl.id} glowGirlName={glowGirl.brand_name || 'You'} />
        </TabsContent>

        <TabsContent value="network">
          <TeamNetwork glowGirlId={glowGirl.id} glowGirlName={glowGirl.brand_name || 'You'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
