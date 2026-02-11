'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { postSaleSections, type Question } from '@/lib/questions'

interface FullAuditFormProps {
  initialFormData?: Record<string, any>
  initialQuestionIndex?: number
}

// Flatten all questions with section info for one-at-a-time navigation
interface FlatQuestion {
  question: Question
  sectionIndex: number
  sectionTitle: string
  sectionDescription: string
  questionIndexInSection: number
  totalInSection: number
  globalIndex: number
}

// Check if a question should be shown based on its showIf condition
function shouldShowQuestion(question: Question, formData: Record<string, any>): boolean {
  if (!question.showIf) return true

  const { field, equals, notEquals } = question.showIf
  const value = formData[field]

  if (equals !== undefined) {
    if (Array.isArray(equals)) {
      return equals.includes(value)
    }
    return value === equals
  }

  if (notEquals !== undefined) {
    if (Array.isArray(notEquals)) {
      return !notEquals.includes(value)
    }
    return value !== notEquals
  }

  return true
}

// Get flat questions filtered by showIf conditions
function getFlatQuestions(formData: Record<string, any>): FlatQuestion[] {
  const flat: FlatQuestion[] = []
  let globalIndex = 0

  postSaleSections.forEach((section, sectionIndex) => {
    const visibleQuestions = section.questions.filter(q => shouldShowQuestion(q, formData))

    visibleQuestions.forEach((question, questionIndexInSection) => {
      flat.push({
        question,
        sectionIndex,
        sectionTitle: section.title,
        sectionDescription: section.description,
        questionIndexInSection,
        totalInSection: visibleQuestions.length,
        globalIndex,
      })
      globalIndex++
    })
  })
  return flat
}

// Section intro content
const sectionIntros: Record<number, { headline: string; context: string }> = {
  0: {
    headline: 'Services & Revenue Details',
    context: 'Detailed breakdown of how you make money. This helps us identify productization opportunities.',
  },
  1: {
    headline: 'Owner Tasks & Delegation',
    context: 'Understanding what only you can do—and why. These are the highest-priority areas to systematize.',
  },
  2: {
    headline: 'Systems & Tools',
    context: 'Your current documentation, tools, and process maturity. We build on what you have.',
  },
  3: {
    headline: 'Team Details',
    context: 'Team composition, skills, and delegation readiness. Understanding your capacity.',
  },
  4: {
    headline: 'Market & Productization',
    context: 'Your positioning, differentiation, and product readiness. The foundation for scalable offerings.',
  },
  5: {
    headline: 'Vision Details',
    context: 'Your long-term goals. Everything we build should move you toward this vision.',
  },
  6: {
    headline: 'Delivery Workflow & Build Materials',
    context: 'How you work—the skeleton for your systems. Be as detailed as possible.',
  },
  7: {
    headline: 'Final Insights',
    context: 'Anything we missed. Your chance to share context that didn\'t fit elsewhere.',
  },
}

export default function FullAuditForm({
  initialFormData = {},
  initialQuestionIndex = 0,
}: FullAuditFormProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex)
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [showSectionIntro, setShowSectionIntro] = useState(true)
  const [seenSections, setSeenSections] = useState<Set<number>>(new Set([0]))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [shakeInput, setShakeInput] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flatQuestions = getFlatQuestions(formData)
  const totalQuestions = flatQuestions.length
  const safeIndex = Math.min(currentQuestionIndex, totalQuestions - 1)
  const currentQ = flatQuestions[safeIndex]
  const questionsAnswered = Object.keys(formData).filter(key =>
    formData[key] !== undefined && formData[key] !== '' && formData[key] !== null
  ).length
  const progress = Math.round((questionsAnswered / totalQuestions) * 100)

  const isLastQuestion = safeIndex === totalQuestions - 1

  // Debounced save to Supabase
  const saveToSupabase = useCallback(async (data: Record<string, any>, questionIndex: number) => {
    setSaveStatus('saving')
    try {
      const response = await fetch('/api/full-audit/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_data: data,
          current_question: questionIndex,
        }),
      })

      if (!response.ok) {
        console.error('Failed to save progress')
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaveStatus('saved')
    }
  }, [])

  // Trigger debounced save when form data changes
  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }

    saveTimer.current = setTimeout(() => {
      saveToSupabase(formData, currentQuestionIndex)
    }, 1000)

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [formData, currentQuestionIndex, saveToSupabase])

  // Handle value change
  const handleValueChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  // Validate current question
  const validateCurrentQuestion = (): boolean => {
    if (!currentQ) return true

    const { question } = currentQ
    const value = formData[question.field]

    if (question.required) {
      if (value === undefined || value === '' || value === null) {
        setValidationError('This field is required')
        setShakeInput(true)
        setTimeout(() => setShakeInput(false), 500)
        return false
      }
    }

    return true
  }

  // Navigate to next question
  const goNext = () => {
    if (!validateCurrentQuestion()) return

    if (isLastQuestion) {
      handleSubmit()
      return
    }

    const nextIndex = safeIndex + 1
    const nextQ = flatQuestions[nextIndex]

    // Check if entering a new section
    if (nextQ && nextQ.sectionIndex !== currentQ.sectionIndex) {
      if (!seenSections.has(nextQ.sectionIndex)) {
        setSeenSections(prev => new Set([...prev, nextQ.sectionIndex]))
        setShowSectionIntro(true)
      }
    }

    setCurrentQuestionIndex(nextIndex)
    setValidationError(null)
  }

  // Navigate to previous question
  const goPrevious = () => {
    if (safeIndex > 0) {
      setCurrentQuestionIndex(safeIndex - 1)
      setValidationError(null)
      setShowSectionIntro(false)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/full-audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: formData }),
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      router.push('/full-audit/results')
    } catch (error) {
      console.error('Submission error:', error)
      setValidationError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dismiss section intro
  const dismissIntro = () => {
    setShowSectionIntro(false)
  }

  // Render section intro
  if (showSectionIntro && currentQ && sectionIntros[currentQ.sectionIndex]) {
    const intro = sectionIntros[currentQ.sectionIndex]
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-[#999] mb-2">
              <span>Section {currentQ.sectionIndex + 1} of 8</span>
            </div>
            <div className="h-1 bg-[#e5e5e5] rounded-full max-w-xs mx-auto overflow-hidden">
              <div
                className="h-full bg-emerald-800 rounded-full transition-all"
                style={{ width: `${((currentQ.sectionIndex + 1) / 8) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            {intro.headline}
          </h1>
          <p className="text-[#666] text-lg mb-8 max-w-md mx-auto">
            {intro.context}
          </p>
          <button
            onClick={dismissIntro}
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[#666]">Loading...</p>
      </div>
    )
  }

  const { question } = currentQ

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#999]">
            Q{safeIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-[#999]">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>
        </div>
        <div className="h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-800 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#999]">
            {currentQ.sectionTitle}
          </span>
          <span className="text-xs text-[#999]">
            {progress}% complete
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-[#666] text-sm">{question.helpText}</p>
        )}
      </div>

      {/* Input */}
      <div className={`mb-8 ${shakeInput ? 'animate-shake' : ''}`}>
        {question.type === 'text' && (
          <input
            type="text"
            value={formData[question.field] || ''}
            onChange={(e) => handleValueChange(question.field, e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
        )}

        {question.type === 'number' && (
          <input
            type="number"
            value={formData[question.field] || ''}
            onChange={(e) => handleValueChange(question.field, e.target.value ? Number(e.target.value) : '')}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
        )}

        {question.type === 'textarea' && (
          <textarea
            value={formData[question.field] || ''}
            onChange={(e) => handleValueChange(question.field, e.target.value)}
            placeholder={question.placeholder}
            rows={5}
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors resize-none"
          />
        )}

        {question.type === 'select' && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleValueChange(question.field, option)}
                className={`w-full px-4 py-3 text-left rounded-lg border transition-colors ${
                  formData[question.field] === option
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-[#f8f8f6] text-[#1a1a1a] border-[#e5e5e5] hover:border-emerald-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === 'multiselect' && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selected = (formData[question.field] || []).includes(option)
              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = formData[question.field] || []
                    const updated = selected
                      ? current.filter((v: string) => v !== option)
                      : [...current, option]
                    handleValueChange(question.field, updated)
                  }}
                  className={`w-full px-4 py-3 text-left rounded-lg border transition-colors flex items-center gap-3 ${
                    selected
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-[#f8f8f6] text-[#1a1a1a] border-[#e5e5e5] hover:border-emerald-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selected ? 'bg-white border-white' : 'border-[#ccc]'
                  }`}>
                    {selected && (
                      <svg className="w-3 h-3 text-emerald-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrevious}
          disabled={safeIndex === 0}
          className="px-6 py-3 text-[#666] hover:text-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <button
          onClick={goNext}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-900 hover:bg-emerald-950 disabled:bg-emerald-900/50 text-white font-medium rounded-full transition-colors"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : isLastQuestion ? (
            <>
              Submit Audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
