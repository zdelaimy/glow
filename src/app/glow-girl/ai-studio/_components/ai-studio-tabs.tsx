'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTab } from './create-tab'
import { AnalyzeTab } from './analyze-tab'
import { HistoryTab } from './history-tab'
import type { AIStudioProject } from '@/lib/ai-studio/types'

interface AIStudioTabsProps {
  products: { id: string; name: string }[]
  initialProjects: AIStudioProject[]
}

export function AIStudioTabs({ products, initialProjects }: AIStudioTabsProps) {
  const [projects, setProjects] = useState<AIStudioProject[]>(initialProjects)

  const handleProjectCreated = (project: AIStudioProject) => {
    setProjects(prev => [project, ...prev])
  }

  return (
    <Tabs defaultValue="create" className="space-y-6">
      <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1 h-auto">
        {[
          { value: 'create', label: 'Create' },
          { value: 'analyze', label: 'Analyze' },
          { value: 'history', label: 'History' },
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-full text-xs uppercase tracking-[0.15em] px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm text-[#6E6A62]/50"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="create">
        <CreateTab products={products} onProjectCreated={handleProjectCreated} />
      </TabsContent>

      <TabsContent value="analyze">
        <AnalyzeTab onProjectCreated={handleProjectCreated} />
      </TabsContent>

      <TabsContent value="history">
        <HistoryTab projects={projects} onProjectsChange={setProjects} />
      </TabsContent>
    </Tabs>
  )
}
