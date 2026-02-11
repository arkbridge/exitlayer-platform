'use client'

import { Check } from 'lucide-react'

interface JourneyProgressProps {
  currentStage: 'new' | 'in_audit' | 'docs_needed' | 'ready' | 'building' | 'complete'
  stageCompletedDates?: {
    assessment?: string
    full_audit?: string
    documents?: string
    kickoff?: string
    building?: string
    complete?: string
  }
}

const STAGES = [
  {
    id: 'assessment',
    name: 'Assessment',
    description: 'Short questionnaire',
    dateKey: 'assessment' as const
  },
  {
    id: 'full_audit',
    name: 'Full Audit',
    description: '74-question deep dive',
    dateKey: 'full_audit' as const
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'Upload your assets',
    dateKey: 'documents' as const
  },
  {
    id: 'kickoff',
    name: 'Kickoff',
    description: 'Schedule your call',
    dateKey: 'kickoff' as const
  },
  {
    id: 'building',
    name: 'Building',
    description: '4-week sprint',
    dateKey: 'building' as const
  },
  {
    id: 'complete',
    name: 'Complete',
    description: 'Transformation done',
    dateKey: 'complete' as const
  },
]

const STAGE_INDEX_MAP = {
  'new': 0,
  'in_audit': 1,
  'docs_needed': 2,
  'ready': 3,
  'building': 4,
  'complete': 5,
}

export default function JourneyProgress({ currentStage, stageCompletedDates = {} }: JourneyProgressProps) {
  const currentIndex = STAGE_INDEX_MAP[currentStage]

  const getStageStatus = (index: number) => {
    if (index < currentIndex) return 'complete'
    if (index === currentIndex) return 'current'
    return 'future'
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
      <h2 className="font-serif font-medium text-xl mb-8">Your Journey</h2>

      {/* Desktop: Horizontal Layout */}
      <div className="hidden md:flex items-start justify-between relative">
        {STAGES.map((stage, index) => {
          const status = getStageStatus(index)
          const isComplete = status === 'complete'
          const isCurrent = status === 'current'
          const completedDate = stageCompletedDates[stage.dateKey]

          return (
            <div key={stage.id} className="flex flex-col items-center relative" style={{ flex: index === STAGES.length - 1 ? '0 0 auto' : '1' }}>
              {/* Circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all relative z-10
                ${isComplete ? 'bg-emerald-600 text-white' : ''}
                ${isCurrent ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20 shadow-lg shadow-emerald-600/30' : ''}
                ${status === 'future' ? 'bg-[#e5e5e5] text-[#999]' : ''}
              `}>
                {isComplete ? <Check className="w-6 h-6" /> : index + 1}
              </div>

              {/* Connector Line */}
              {index < STAGES.length - 1 && (
                <div
                  className={`
                    absolute top-6 left-[calc(50%+24px)] right-[calc(-100%+24px)] h-0.5 transition-all
                    ${status === 'complete' ? 'bg-emerald-600' : 'bg-[#e5e5e5]'}
                  `}
                  style={{ width: 'calc(100% - 48px)' }}
                />
              )}

              {/* Label */}
              <div className="mt-4 text-center max-w-[140px]">
                <div className={`font-medium text-sm ${status === 'future' ? 'text-[#999]' : 'text-gray-900'}`}>
                  {stage.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stage.description}
                </div>
                {completedDate && (
                  <div className="text-xs text-emerald-600 mt-1.5 font-medium">
                    {completedDate}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="md:hidden space-y-6">
        {STAGES.map((stage, index) => {
          const status = getStageStatus(index)
          const isComplete = status === 'complete'
          const isCurrent = status === 'current'
          const completedDate = stageCompletedDates[stage.dateKey]
          const isLast = index === STAGES.length - 1

          return (
            <div key={stage.id} className="flex items-start gap-4">
              {/* Circle + Connector */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all flex-shrink-0
                  ${isComplete ? 'bg-emerald-600 text-white' : ''}
                  ${isCurrent ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20 shadow-lg shadow-emerald-600/30' : ''}
                  ${status === 'future' ? 'bg-[#e5e5e5] text-[#999]' : ''}
                `}>
                  {isComplete ? <Check className="w-6 h-6" /> : index + 1}
                </div>

                {!isLast && (
                  <div
                    className={`
                      w-0.5 h-16 mt-2 transition-all
                      ${status === 'complete' ? 'bg-emerald-600' : 'bg-[#e5e5e5]'}
                    `}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2.5">
                <div className={`font-medium ${status === 'future' ? 'text-[#999]' : 'text-gray-900'}`}>
                  {stage.name}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {stage.description}
                </div>
                {completedDate && (
                  <div className="text-xs text-emerald-600 mt-1.5 font-medium">
                    {completedDate}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
