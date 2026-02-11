'use client'

import { Hammer, CheckCircle2, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SprintMilestone {
  name: string
  completed: boolean
  completedAt?: string
}

interface SprintProgressProps {
  week: number
  systems: string[]
  hoursReclaimed: number
  milestones: SprintMilestone[]
}

const WEEK_MILESTONES = [
  { week: 1, label: 'Foundation & Discovery' },
  { week: 2, label: 'Core Systems Build' },
  { week: 3, label: 'Integration & Testing' },
  { week: 4, label: 'Handoff & Training' },
]

export default function SprintProgress({
  week,
  systems,
  hoursReclaimed,
  milestones,
}: SprintProgressProps) {
  const [animatedHours, setAnimatedHours] = useState(0)

  // Animated counter effect for hours reclaimed
  useEffect(() => {
    if (hoursReclaimed === 0) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = hoursReclaimed / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= hoursReclaimed) {
        setAnimatedHours(hoursReclaimed)
        clearInterval(timer)
      } else {
        setAnimatedHours(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [hoursReclaimed])

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center ring-2 ring-emerald-200/40">
            <Hammer className="w-6 h-6 text-emerald-700" strokeWidth={2.5} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#1a1a1a] tracking-tight">
              Build Progress
            </h3>
          </div>
        </div>

        {/* Week Badge */}
        <div className="px-5 py-2 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 shadow-sm">
          <span className="text-sm font-bold text-emerald-700 tabular-nums">
            Week {week} of 4
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Current Week Display */}
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
          <div className="pl-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-[#1a1a1a] tabular-nums">
                Week {week}
              </span>
              <span className="text-base text-[#666] font-medium">
                {WEEK_MILESTONES[week - 1]?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Hours Reclaimed Counter */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-6 border border-emerald-200/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-emerald-900/70 mb-1 uppercase tracking-wide">
                Hours Reclaimed
              </div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-700 tabular-nums">
                {animatedHours}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Clock className="w-12 h-12 text-emerald-600/30" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Systems Being Built */}
        <div>
          <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wide">
            Systems in Progress
          </h4>
          <div className="space-y-2">
            {systems.map((system, index) => {
              const isComplete = milestones.find(m => m.name === system)?.completed || false

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:shadow-sm"
                >
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isComplete ? 'text-emerald-900 line-through' : 'text-[#1a1a1a]'
                  }`}>
                    {system}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4-Week Timeline Stepper */}
        <div className="pt-4">
          <h4 className="text-sm font-semibold text-[#1a1a1a] mb-4 uppercase tracking-wide">
            Sprint Timeline
          </h4>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200" />
            <div
              className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
              style={{ height: `${((week - 1) / 3) * 100}%` }}
            />

            {/* Milestones */}
            <div className="space-y-6">
              {WEEK_MILESTONES.map((milestone, index) => {
                const weekNum = milestone.week
                const isPast = weekNum < week
                const isCurrent = weekNum === week
                const isFuture = weekNum > week

                return (
                  <div key={weekNum} className="relative flex items-start gap-4">
                    {/* Dot */}
                    <div className={`
                      relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      border-2 transition-all duration-500
                      ${isPast || isCurrent
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-600 shadow-lg shadow-emerald-200'
                        : 'bg-white border-gray-300'
                      }
                    `}>
                      {isPast ? (
                        <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={3} />
                      ) : (
                        <span className={`text-sm font-bold tabular-nums ${
                          isCurrent ? 'text-white' : 'text-gray-400'
                        }`}>
                          {weekNum}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className={`font-semibold mb-1 ${
                        isCurrent ? 'text-emerald-700' : isPast ? 'text-[#1a1a1a]' : 'text-gray-400'
                      }`}>
                        Week {weekNum}
                      </div>
                      <div className={`text-sm ${
                        isCurrent ? 'text-emerald-600 font-medium' : isPast ? 'text-[#666]' : 'text-gray-400'
                      }`}>
                        {milestone.label}
                      </div>

                      {isCurrent && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                            In Progress
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
