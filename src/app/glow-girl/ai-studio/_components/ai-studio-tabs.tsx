'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoTab } from './video-tab'
import { HistoryTab } from './history-tab'
import { WeeklyPlaybook } from './weekly-playbook'
import type { AIStudioProject, VideoTemplate } from '@/lib/ai-studio/types'

interface MarketingTabsProps {
  products: { id: string; name: string }[]
  initialProjects: AIStudioProject[]
  templates: VideoTemplate[]
}

export function MarketingTabs({ products, initialProjects, templates }: MarketingTabsProps) {
  const [projects, setProjects] = useState<AIStudioProject[]>(initialProjects)

  const handleProjectCreated = (project: AIStudioProject) => {
    setProjects(prev => [project, ...prev])
  }

  return (
    <Tabs defaultValue="playbook" className="space-y-6">
      <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1 h-auto w-full flex">
        {[
          { value: 'playbook', label: 'Weekly Playbook', featured: true },
          { value: 'video', label: 'Video Scripts' },
          { value: 'history', label: 'History' },
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`flex-1 rounded-full text-xs uppercase tracking-[0.1em] px-2 py-2 data-[state=active]:shadow-sm text-[#6E6A62]/50 ${
              tab.featured
                ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6E6A62] data-[state=active]:to-[#8a8578] data-[state=active]:text-white'
                : 'data-[state=active]:bg-white data-[state=active]:text-[#6E6A62]'
            }`}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="playbook">
        <WeeklyPlaybook />
      </TabsContent>

      <TabsContent value="video">
        <VideoTab
          templates={templates}
          products={products}
          onProjectCreated={handleProjectCreated}
        />
      </TabsContent>

      <TabsContent value="history">
        <HistoryTab projects={projects} onProjectsChange={setProjects} />
      </TabsContent>
    </Tabs>
  )
}
