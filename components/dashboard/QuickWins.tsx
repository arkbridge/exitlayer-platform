'use client'

import { Zap } from 'lucide-react'

interface QuickWin {
  id: string
  title: string
  description: string
  timeEstimate: string
  impact: 'high' | 'medium' | 'low'
  completed?: boolean
}

interface QuickWinsProps {
  quickWins: QuickWin[]
  onToggleComplete?: (id: string) => void
}

const impactColors = {
  high: 'bg-emerald-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
}

export default function QuickWins({ quickWins, onToggleComplete }: QuickWinsProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Quick Wins</h2>
        </div>
        <p className="text-sm text-[#666]">Actions you can take this week</p>
      </div>

      {/* Quick Win Items */}
      <div className="divide-y divide-[#e5e5e5]">
        {quickWins.map((win) => (
          <div key={win.id} className="p-4 flex items-start justify-between gap-4">
            {/* Left Side */}
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox Circle */}
              <button
                onClick={() => onToggleComplete?.(win.id)}
                className={`
                  w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
                  transition-colors duration-200
                  ${
                    win.completed
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'border-[#e5e5e5] hover:border-emerald-600'
                  }
                `}
                aria-label={win.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {win.completed && (
                  <svg
                    className="w-full h-full text-white"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1">
                <h3
                  className={`
                    font-medium text-[#1a1a1a] mb-1
                    ${win.completed ? 'line-through opacity-50' : ''}
                  `}
                >
                  {win.title}
                </h3>
                <p
                  className={`
                    text-sm text-[#666]
                    ${win.completed ? 'line-through opacity-50' : ''}
                  `}
                >
                  {win.description}
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Time Badge */}
              <span className="text-xs bg-emerald-900/10 text-emerald-800 px-2 py-1 rounded-full whitespace-nowrap">
                {win.timeEstimate}
              </span>

              {/* Impact Indicator */}
              <div
                className={`w-2 h-2 rounded-full ${impactColors[win.impact]}`}
                aria-label={`${win.impact} impact`}
                title={`${win.impact} impact`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
