'use client'

import { useState, useTransition } from 'react'
import { markLessonComplete, markLessonIncomplete } from '@/lib/actions/journey'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'

interface LessonCompleteButtonProps {
  glowGirlId: string
  lessonId: string
  initialCompleted: boolean
}

export function LessonCompleteButton({ glowGirlId, lessonId, initialCompleted }: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle() {
    const newState = !completed
    setCompleted(newState) // optimistic

    startTransition(async () => {
      try {
        if (newState) {
          await markLessonComplete(glowGirlId, lessonId)
        } else {
          await markLessonIncomplete(glowGirlId, lessonId)
        }
        router.refresh()
      } catch {
        setCompleted(!newState) // revert
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all ${
        completed
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100/80'
          : 'bg-[#6E6A62] text-white hover:bg-[#5a574f]'
      } ${isPending ? 'opacity-60' : ''}`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="w-5 h-5" />
          Completed — Click to undo
        </>
      ) : (
        <>
          <Circle className="w-5 h-5" />
          Mark as Complete
        </>
      )}
    </button>
  )
}
