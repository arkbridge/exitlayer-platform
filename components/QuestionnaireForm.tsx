'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { questionSections, getTotalQuestionCount, type Question } from '@/lib/questions';
import { type ExitLayerScore, getScoreColor, getOverallInterpretation } from '@/lib/score-calculator';
import { getAnalytics } from '@/lib/analytics';

// Flatten all questions with section info for one-at-a-time navigation
interface FlatQuestion {
  question: Question;
  sectionIndex: number;
  sectionTitle: string;
  questionIndexInSection: number;
  totalInSection: number;
  globalIndex: number;
}

// Check if a question should be shown based on its showIf condition
function shouldShowQuestion(question: Question, formData: Record<string, any>): boolean {
  if (!question.showIf) return true;

  const { field, equals, notEquals } = question.showIf;
  const value = formData[field];

  if (equals !== undefined) {
    if (Array.isArray(equals)) {
      return equals.includes(value);
    }
    return value === equals;
  }

  if (notEquals !== undefined) {
    if (Array.isArray(notEquals)) {
      return !notEquals.includes(value);
    }
    return value !== notEquals;
  }

  return true;
}

// Get flat questions filtered by showIf conditions
function getFlatQuestions(formData: Record<string, any>): FlatQuestion[] {
  const flat: FlatQuestion[] = [];
  let globalIndex = 0;

  questionSections.forEach((section, sectionIndex) => {
    // Filter questions that should be shown
    const visibleQuestions = section.questions.filter(q => shouldShowQuestion(q, formData));

    visibleQuestions.forEach((question, questionIndexInSection) => {
      flat.push({
        question,
        sectionIndex,
        sectionTitle: section.title.replace(/Section \d+: /, ''),
        questionIndexInSection,
        totalInSection: visibleQuestions.length,
        globalIndex,
      });
      globalIndex++;
    });
  });
  return flat;
}

// Calculate section progress (only count visible questions)
function getSectionProgress(sectionIndex: number, formData: Record<string, any>): { answered: number; total: number; percentage: number } {
  const section = questionSections[sectionIndex];
  const visibleQuestions = section.questions.filter(q => shouldShowQuestion(q, formData));
  const answered = visibleQuestions.filter(q =>
    formData[q.field] !== undefined && formData[q.field] !== '' && formData[q.field] !== null
  ).length;
  return {
    answered,
    total: visibleQuestions.length,
    percentage: visibleQuestions.length > 0 ? Math.round((answered / visibleQuestions.length) * 100) : 100,
  };
}

// Estimate remaining time based on unanswered questions
function estimateRemainingMinutes(answeredCount: number, totalCount: number): number {
  const remaining = totalCount - answeredCount;
  // Average ~15 seconds per question
  return Math.max(1, Math.ceil(remaining * 0.25));
}

// Section intro content
const sectionIntros: Record<number, { emoji: string; headline: string; context: string }> = {
  0: {
    emoji: '📊',
    headline: 'Business Fundamentals',
    context: "Let's start with the basics - your revenue, clients, and financial health. This helps us understand your agency's foundation.",
  },
  1: {
    emoji: '⏰',
    headline: 'Time & Leverage',
    context: "Now let's look at how you spend your time. This is often where we find the biggest opportunities to reclaim your freedom.",
  },
  2: {
    emoji: '⚙️',
    headline: 'Systems & Documentation',
    context: "Time to assess your operational infrastructure. The more systematized you are, the more scalable and valuable your agency becomes.",
  },
  3: {
    emoji: '👥',
    headline: 'Team & Capabilities',
    context: "Let's talk about your team. Understanding their strengths and gaps helps us identify where systems can amplify their impact.",
  },
  4: {
    emoji: '🎯',
    headline: 'Product & Market Position',
    context: "Now for the exciting part - your unique value and productization potential. This shapes your path to scalable revenue.",
  },
  5: {
    emoji: '🚀',
    headline: 'Vision & Goals',
    context: "Let's capture where you want to go so we can map the right path to get you there.",
  },
  6: {
    emoji: '🛠️',
    headline: 'Build Materials',
    context: "Now for the good stuff. Walk us through how you actually deliver work so we can build AI skills that match your exact process.",
  },
  7: {
    emoji: '✨',
    headline: 'Final Details',
    context: "Almost done! Just a few more questions and your contact info so we can send your personalized diagnostic.",
  },
};

export default function QuestionnaireForm() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<ExitLayerScore | null>(null);
  const [clientFolder, setClientFolder] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showSectionIntro, setShowSectionIntro] = useState(true); // Show intro for first section
  const [seenSections, setSeenSections] = useState<Set<number>>(new Set([0])); // Track which section intros we've shown
  const analyticsInitialized = useRef(false);

  const flatQuestions = getFlatQuestions(formData);
  const totalQuestions = flatQuestions.length;
  // Clamp currentQuestionIndex to valid range (questions may disappear due to branching)
  const safeIndex = Math.min(currentQuestionIndex, totalQuestions - 1);
  const currentQ = flatQuestions[safeIndex];
  const questionsAnswered = Object.keys(formData).filter(key =>
    formData[key] !== undefined && formData[key] !== '' && formData[key] !== null
  ).length;
  const progress = Math.round((questionsAnswered / totalQuestions) * 100);
  const remainingMinutes = estimateRemainingMinutes(questionsAnswered, totalQuestions);

  const isLastQuestion = safeIndex === totalQuestions - 1;

  // Initialize analytics on mount
  useEffect(() => {
    if (!analyticsInitialized.current) {
      const analytics = getAnalytics();
      analytics.initialize(totalQuestions);
      analyticsInitialized.current = true;
    }
  }, [totalQuestions]);

  // Update progress tracking when questions are answered
  useEffect(() => {
    const analytics = getAnalytics();
    analytics.updateProgress(questionsAnswered);
  }, [questionsAnswered]);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exitlayer-questionnaire-progress');
    if (saved) {
      try {
        const { formData: savedData, currentIndex } = JSON.parse(saved);
        setFormData(savedData || {});
        setCurrentQuestionIndex(currentIndex || 0);
      } catch (e) {
        // Invalid saved data, start fresh
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((data: Record<string, any>, index: number) => {
    setSaveStatus('saving');
    localStorage.setItem('exitlayer-questionnaire-progress', JSON.stringify({
      formData: data,
      currentIndex: index,
      savedAt: new Date().toISOString(),
    }));
    setTimeout(() => setSaveStatus('saved'), 600);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    saveProgress(newData, currentQuestionIndex);

    // Track question interaction
    const analytics = getAnalytics();
    analytics.trackQuestionInteraction(
      currentQ.question.id,
      field,
      currentQ.sectionIndex,
      'change',
      value !== undefined && value !== '' && value !== null
    );
  };

  const handleNext = () => {
    if (showSectionIntro) {
      // Dismiss intro and show first question
      setShowSectionIntro(false);
      return;
    }

    if (safeIndex < totalQuestions - 1) {
      const nextIndex = safeIndex + 1;
      const nextQ = flatQuestions[nextIndex];

      // Check if we're entering a new section
      if (nextQ.sectionIndex !== currentQ.sectionIndex) {
        // Show section intro if we haven't seen it
        if (!seenSections.has(nextQ.sectionIndex)) {
          setSeenSections(prev => new Set([...prev, nextQ.sectionIndex]));
          setShowSectionIntro(true);
        }

        // Track section change
        const analytics = getAnalytics();
        analytics.trackSectionChange(
          currentQ.sectionIndex,
          nextQ.sectionIndex,
          nextQ.sectionTitle,
          getSectionProgress(currentQ.sectionIndex, formData).answered
        );
      }

      setCurrentQuestionIndex(nextIndex);
      saveProgress(formData, nextIndex);

      // Scroll to top so the next question is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (safeIndex > 0) {
      const prevIndex = safeIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      saveProgress(formData, prevIndex);

      // Scroll to top so the previous question is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSectionJump = (targetSectionIndex: number) => {
    // Find the first question of the target section
    const targetQuestion = flatQuestions.find(q => q.sectionIndex === targetSectionIndex);
    if (targetQuestion) {
      setCurrentQuestionIndex(targetQuestion.globalIndex);
      saveProgress(formData, targetQuestion.globalIndex);

      // Track section change
      const analytics = getAnalytics();
      analytics.trackSectionChange(
        currentQ.sectionIndex,
        targetSectionIndex,
        targetQuestion.sectionTitle,
        getSectionProgress(currentQ.sectionIndex, formData).answered
      );
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't trigger on textareas
        if (document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (isLastQuestion) {
          handleSubmit();
        } else {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, isLastQuestion, formData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Track completion and get analytics data
    const analytics = getAnalytics();
    analytics.trackCompletion();
    const analyticsSummary = analytics.getSummary();
    const analyticsSession = analytics.getSession();

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _analytics: analyticsSummary,
          _analyticsSession: analyticsSession,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Track successful submission
        analytics.trackSubmission();

        // Clear saved progress
        localStorage.removeItem('exitlayer-questionnaire-progress');

        setScore(data.score);
        setClientFolder(data.clientFolder);
        setSubmitted(true);
      } else {
        alert('Error submitting questionnaire. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting questionnaire. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && score) {
    return <ResultsDisplay score={score} formData={formData} portalUrl={clientFolder ? `/portal/${clientFolder}` : null} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Top progress dashboard header */}
      <header className="bg-[#f8f8f6] border-b border-[#e5e5e5] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium text-[#1a1a1a] tracking-tight">Agency Diagnostic</h1>
            </div>

            {/* Save status indicator */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                saveStatus === 'saved'
                  ? 'bg-[#2d4a2d]/10 text-[#2d4a2d]'
                  : 'bg-[#e5e5e5] text-[#666]'
              }`}>
                {saveStatus === 'saved' ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Progress saved
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section progress cards */}
          <div className="grid grid-cols-8 gap-1.5">
            {questionSections.map((section, i) => {
              const sectionProgress = getSectionProgress(i, formData);
              const isActive = i === currentQ.sectionIndex;
              const isComplete = sectionProgress.percentage === 100;
              const sectionName = section.title.replace(/Section \d+: /, '').split(' ')[0];

              return (
                <button
                  key={i}
                  onClick={() => handleSectionJump(i)}
                  className={`p-2.5 rounded-lg border transition-all text-left ${
                    isActive
                      ? 'border-[#2d4a2d] bg-[#2d4a2d]'
                      : isComplete
                      ? 'border-[#2d4a2d]/30 bg-[#2d4a2d]/5 hover:border-[#2d4a2d]/50'
                      : sectionProgress.answered > 0
                      ? 'border-[#e5e5e5] bg-white hover:border-[#ccc]'
                      : 'border-[#e5e5e5] bg-white hover:border-[#ccc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium truncate ${
                      isActive ? 'text-white' : isComplete ? 'text-[#2d4a2d]' : 'text-[#666]'
                    }`}>
                      {sectionName}
                    </span>
                    {isComplete && (
                      <svg className="w-3.5 h-3.5 text-[#2d4a2d] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${
                    isActive ? 'bg-white/20' : 'bg-[#e5e5e5]'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isActive ? 'bg-white' : 'bg-[#2d4a2d]'
                      }`}
                      style={{ width: `${sectionProgress.percentage}%` }}
                    />
                  </div>
                  <span className={`text-[10px] mt-1.5 block ${
                    isActive ? 'text-white/60' : 'text-[#999]'
                  }`}>
                    {sectionProgress.answered}/{sectionProgress.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {showSectionIntro ? (
          /* Section Intro Screen */
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
            <div className="p-10 text-center">
              <div className="text-6xl mb-6">{sectionIntros[currentQ.sectionIndex]?.emoji || '📋'}</div>
              <div className="text-xs text-[#999] uppercase tracking-wider mb-2">
                Section {currentQ.sectionIndex + 1} of {questionSections.length}
              </div>
              <h2 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-4">
                {sectionIntros[currentQ.sectionIndex]?.headline || currentQ.sectionTitle}
              </h2>
              <p className="text-lg text-[#666] mb-8 max-w-md mx-auto leading-relaxed">
                {sectionIntros[currentQ.sectionIndex]?.context}
              </p>
              <div className="text-sm text-[#999] mb-8">
                {currentQ.totalInSection} questions in this section
              </div>
              <button
                onClick={handleNext}
                className="px-10 py-4 bg-[#2d4a2d] text-white rounded-full font-medium hover:bg-[#1a2e1a] transition-all inline-flex items-center gap-2"
              >
                Let's Go
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Question Card */
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
            <div className="p-10">
              {/* Question indicator */}
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-full bg-[#2d4a2d] text-white flex items-center justify-center text-sm font-medium">
                  {safeIndex + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#999] uppercase tracking-wider">
                      {currentQ.sectionTitle} &middot; Q{currentQ.questionIndexInSection + 1} of {currentQ.totalInSection}
                    </span>
                    <span className="text-xs font-medium text-[#666]">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2d4a2d] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question */}
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-3 leading-tight">
                {currentQ.question.question}
                {currentQ.question.required && <span className="text-red-500 ml-1">*</span>}
              </h2>
              {currentQ.question.helpText && (
                <p className="text-lg text-[#666] mb-10 leading-relaxed">{currentQ.question.helpText}</p>
              )}
              {!currentQ.question.helpText && <div className="mb-10" />}

              {/* Input - Premium styling */}
              <QuestionInput
                question={currentQ.question}
                value={formData[currentQ.question.field]}
                onChange={(value) => handleInputChange(currentQ.question.field, value)}
              />

              {/* Time Allocation Summary - show after time questions are filled */}
              {currentQ.sectionIndex === 1 && currentQ.questionIndexInSection >= 4 && (
                <TimeAllocationSummary formData={formData} />
              )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#e5e5e5]">
              <button
                onClick={handlePrevious}
                disabled={safeIndex === 0}
                className="flex items-center gap-2 px-5 py-3 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] rounded-full font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-[#2d4a2d] text-white rounded-full font-medium hover:bg-[#1a2e1a] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Calculating...
                    </>
                  ) : (
                    <>
                      Get Your Score
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-10 py-4 bg-[#2d4a2d] text-white rounded-full font-medium hover:bg-[#1a2e1a] transition-all flex items-center gap-2"
                >
                  Continue
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Keyboard hint & time estimate */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <span className="text-sm text-[#999]">
            Press <kbd className="px-2 py-1 bg-white border border-[#e5e5e5] rounded-lg text-xs font-mono">Enter</kbd> to continue
          </span>
          <span className="text-[#ccc]">&bull;</span>
          <span className="text-sm text-[#999]">About {remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''} remaining</span>
        </div>
      </main>
    </div>
  );
}

function QuestionInput({ question, value, onChange }: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) {
  const baseInputClasses = "w-full text-lg px-6 py-5 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg focus:border-[#2d4a2d] focus:bg-white focus:ring-2 focus:ring-[#2d4a2d]/10 transition-all placeholder:text-[#999]";

  if (question.type === 'text' || question.type === 'number') {
    const displayValue = question.type === 'number' && value
      ? value.toLocaleString('en-US')
      : value || '';

    const isMoneyField = question.field.includes('revenue') || question.field.includes('cac') || question.field.includes('ltv') || question.field.includes('avg_value');

    return (
      <div className="relative group">
        {isMoneyField && (
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-slate-300 font-light transition-colors group-focus-within:text-slate-500">$</span>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            if (question.type === 'number') {
              const numValue = e.target.value.replace(/,/g, '');
              const parsed = Number(numValue);
              onChange(isNaN(parsed) ? 0 : parsed);
            } else {
              onChange(e.target.value);
            }
          }}
          placeholder={question.placeholder || 'Type your answer...'}
          required={question.required}
          className={`${baseInputClasses} ${isMoneyField ? 'pl-14' : ''}`}
          autoFocus
        />
      </div>
    );
  }

  if (question.type === 'textarea') {
    return (
      <div className="space-y-2">
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer...'}
          required={question.required}
          rows={4}
          className={`${baseInputClasses} resize-none`}
          autoFocus
        />
        <p className="text-sm text-slate-400 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          A few sentences is plenty. Don't overthink it.
        </p>
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="space-y-3">
        {question.options?.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
              value === option
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              value === option
                ? 'border-white bg-white'
                : 'border-slate-300'
            }`}>
              {value === option && (
                <span className="w-3 h-3 rounded-full bg-slate-900" />
              )}
            </span>
            <span className="text-lg font-medium">{option}</span>
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'multiselect') {
    const selectedValues = value || [];

    return (
      <div className="space-y-3">
        {question.options?.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onChange(selectedValues.filter((v: string) => v !== option));
                } else {
                  onChange([...selectedValues, option]);
                }
              }}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'border-slate-900 bg-slate-900'
                  : 'border-slate-300'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className={`text-lg font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{option}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'slider') {
    const min = question.min || 0;
    const max = question.max || 100;
    const currentValue = value ?? null;

    // For percentage questions (0-100), use segmented buttons with 10% ranges
    if (max === 100 && min === 0) {
      const ranges = [
        { label: '0-10%', min: 0, max: 10, midpoint: 5 },
        { label: '11-20%', min: 11, max: 20, midpoint: 15 },
        { label: '21-30%', min: 21, max: 30, midpoint: 25 },
        { label: '31-40%', min: 31, max: 40, midpoint: 35 },
        { label: '41-50%', min: 41, max: 50, midpoint: 45 },
        { label: '51-60%', min: 51, max: 60, midpoint: 55 },
        { label: '61-70%', min: 61, max: 70, midpoint: 65 },
        { label: '71-80%', min: 71, max: 80, midpoint: 75 },
        { label: '81-90%', min: 81, max: 90, midpoint: 85 },
        { label: '91-100%', min: 91, max: 100, midpoint: 95 },
      ];

      // Find which range the current value falls into
      const selectedRange = currentValue !== null
        ? ranges.find(r => currentValue >= r.min && currentValue <= r.max)
        : null;

      return (
        <div className="grid grid-cols-5 gap-2">
          {ranges.map((range) => {
            const isSelected = selectedRange?.label === range.label;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => onChange(range.midpoint)}
                className={`py-4 px-2 rounded-xl border-2 text-center transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-sm font-semibold">{range.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // For 1-10 scale questions, use simple number buttons
    if (max === 10 && min === 1) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const isSelected = currentValue === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(num)}
                  className={`flex-1 py-4 rounded-xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-lg font-bold">{num}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-400 px-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      );
    }

    // Fallback for other slider types - simple number input
    return (
      <div className="relative group">
        <input
          type="number"
          min={min}
          max={max}
          value={currentValue ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={`Enter a number (${min}-${max})`}
          className="w-full text-lg font-medium px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300 placeholder:font-normal"
        />
      </div>
    );
  }

  if (question.type === 'services') {
    const services = value || [
      { name: '', revenue_pct: 0, avg_value: 0 },
      { name: '', revenue_pct: 0, avg_value: 0 },
      { name: '', revenue_pct: 0, avg_value: 0 }
    ];

    return (
      <div className="space-y-4">
        {services.map((service: any, index: number) => (
          <div key={index} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl">
            <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              Service {index + 1}
            </h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Service name (e.g., Web Design, SEO, PPC)"
                value={service.name || ''}
                onChange={(e) => {
                  const newServices = [...services];
                  newServices[index] = { ...service, name: e.target.value };
                  onChange(newServices);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">% of Revenue</label>
                  <input
                    type="number"
                    placeholder="e.g., 40"
                    value={service.revenue_pct || ''}
                    onChange={(e) => {
                      const newServices = [...services];
                      newServices[index] = { ...service, revenue_pct: Number(e.target.value) };
                      onChange(newServices);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Avg Project Value ($)</label>
                  <input
                    type="text"
                    placeholder="e.g., 5,000"
                    value={service.avg_value ? service.avg_value.toLocaleString('en-US') : ''}
                    onChange={(e) => {
                      const newServices = [...services];
                      const numValue = e.target.value.replace(/,/g, '');
                      const parsed = Number(numValue);
                      newServices[index] = { ...service, avg_value: isNaN(parsed) ? 0 : parsed };
                      onChange(newServices);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function TimeAllocationSummary({ formData }: { formData: Record<string, any> }) {
  const timeFields = [
    { field: 'time_delivery_hrs', label: 'Delivery', color: 'bg-red-500' },
    { field: 'time_sales_hrs', label: 'Sales', color: 'bg-emerald-500' },
    { field: 'time_mgmt_hrs', label: 'Management', color: 'bg-blue-500' },
    { field: 'time_ops_hrs', label: 'Operations', color: 'bg-amber-500' },
    { field: 'time_strategy_hrs', label: 'Strategy', color: 'bg-purple-500' },
  ];

  const totalHours = timeFields.reduce((sum, { field }) => sum + (formData[field] || 0), 0);

  if (totalHours === 0) return null;

  const percentages = timeFields.map(({ field, label, color }) => {
    const hours = formData[field] || 0;
    const pct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
    return { field, label, hours, pct, color };
  });

  const isOverworked = totalHours > 60;
  const isExtreme = totalHours > 80;

  return (
    <div className={`mt-8 p-6 rounded-2xl border-2 transition-all ${
      isExtreme
        ? 'bg-red-50 border-red-300'
        : isOverworked
        ? 'bg-amber-50 border-amber-300'
        : 'bg-emerald-50 border-emerald-300'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Weekly Time
        </h4>
        <div className={`text-2xl font-bold ${
          isExtreme ? 'text-red-600' : isOverworked ? 'text-amber-600' : 'text-emerald-600'
        }`}>
          {totalHours}
          <span className="text-sm font-normal text-slate-500 ml-1">hrs/week</span>
        </div>
      </div>

      {/* Visual bar chart */}
      <div className="h-6 flex rounded-lg overflow-hidden mb-4">
        {percentages.map(({ label, pct, color }) => (
          pct > 0 && (
            <div
              key={label}
              className={`${color} flex items-center justify-center transition-all`}
              style={{ width: `${pct}%` }}
              title={`${label}: ${pct}%`}
            >
              {pct >= 15 && (
                <span className="text-white text-xs font-semibold">{pct}%</span>
              )}
            </div>
          )
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 gap-2">
        {percentages.map(({ label, hours, color }) => (
          hours > 0 && (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-slate-900 ml-auto">{hours}h</span>
            </div>
          )
        ))}
      </div>

      {isExtreme && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-xl mt-4">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p><strong>Burnout risk:</strong> {totalHours} hours/week is unsustainable.</p>
        </div>
      )}

      {isOverworked && !isExtreme && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-100 p-3 rounded-xl mt-4">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p><strong>High workload:</strong> {totalHours} hours/week indicates owner dependency.</p>
        </div>
      )}
    </div>
  );
}

// Results Display Component - V1: Owner Tax Calculator (Pain-first with cascading costs)
function ResultsDisplay({ score, formData, portalUrl }: { score: ExitLayerScore; formData: Record<string, any>; portalUrl: string | null }) {
  // Calculate derived metrics for the Owner Tax display
  const ownerHourlyValue = score.financialMetrics.ownerHourlyValue;
  const totalWeeklyHours = score.financialMetrics.totalWeeklyHours;
  const monthlyRevenue = score.financialMetrics.monthlyRevenue;
  const annualRevenue = score.financialMetrics.annualRevenue;

  // Use actual wasted hours from form if available, otherwise estimate
  const wastedHoursWeekly = formData.wasted_hours_week || Math.round(totalWeeklyHours * 0.33);
  const wastedHoursPerYear = wastedHoursWeekly * 52;
  const wastedDollarsPerYear = wastedHoursWeekly * ownerHourlyValue * 52;
  const exitValueGap = score.financialMetrics.valueGap;

  // ============================================
  // BUILD THE INEFFICIENCY CASCADE
  // Each inefficiency has: issue, yourData, directCost, cascadeEffect
  // ============================================

  interface Inefficiency {
    id: string;
    category: 'time' | 'systems' | 'sales' | 'risk' | 'knowledge';
    issue: string;
    yourData: string;
    directCost: string;
    directCostValue: number; // for calculations
    cascadeEffect: string;
    feedsInto: string[]; // which other inefficiencies this compounds
  }

  const inefficiencies: Inefficiency[] = [];

  // 1. TIME INEFFICIENCIES

  // Owner hours below pay grade
  if (wastedHoursWeekly > 5) {
    inefficiencies.push({
      id: 'wasted-hours',
      category: 'time',
      issue: 'Hours spent on tasks below your pay grade',
      yourData: `You spend ${wastedHoursWeekly} hours/week on tasks that should cost $50/hr, not your ${ownerHourlyValue}/hr`,
      directCost: `$${Math.round(wastedDollarsPerYear / 1000)}K/year in opportunity cost`,
      directCostValue: wastedDollarsPerYear,
      cascadeEffect: 'These hours aren\'t available for strategy, sales, or building systems - the only activities that grow enterprise value.',
      feedsInto: ['no-strategy-time', 'revenue-cap'],
    });
  }

  // Excessive owner hours total
  if (totalWeeklyHours > 50) {
    inefficiencies.push({
      id: 'overwork',
      category: 'time',
      issue: 'Unsustainable owner workload',
      yourData: `${totalWeeklyHours} hours/week - you're working ${Math.round((totalWeeklyHours / 40 - 1) * 100)}% more than a standard workweek`,
      directCost: 'Burnout risk, decision fatigue, reduced quality',
      directCostValue: 0,
      cascadeEffect: 'You can\'t think strategically when you\'re in survival mode. Every extra hour in the weeds is an hour not spent on the business.',
      feedsInto: ['owner-dependency', 'no-systems'],
    });
  }

  // 2. OWNER DEPENDENCY INEFFICIENCIES

  // Projects requiring owner
  const projectsRequiringOwner = formData.projects_requiring_owner_pct || 0;
  if (projectsRequiringOwner > 50) {
    const revenueCappedAt = Math.round(annualRevenue * (100 / projectsRequiringOwner));
    inefficiencies.push({
      id: 'owner-dependency',
      category: 'time',
      issue: 'You are the delivery bottleneck',
      yourData: `${projectsRequiringOwner}% of projects require your direct involvement`,
      directCost: `Revenue capped at ~$${Math.round(revenueCappedAt / 1000)}K without adding more of YOU`,
      directCostValue: revenueCappedAt - annualRevenue,
      cascadeEffect: 'You can\'t scale delivery beyond your personal capacity. Every new client means more hours for you, not more leverage.',
      feedsInto: ['revenue-cap', 'exit-value'],
    });
  }

  // Sales dependency
  const salesReplaceability = formData.owner_replaceability_sales || 1;
  const teamCanClose = formData.team_can_close;
  if (salesReplaceability < 5 || teamCanClose === 'No') {
    const salesHours = formData.time_sales_hrs || 0;
    const salesValuePerHour = monthlyRevenue / (salesHours * 4.33 || 1);
    inefficiencies.push({
      id: 'sales-dependency',
      category: 'sales',
      issue: 'You are the entire sales department',
      yourData: teamCanClose === 'No' ? 'Your team cannot close deals without you' : `Sales replaceability: ${salesReplaceability}/10`,
      directCost: `Revenue growth limited to your ${salesHours || '?'} sales hours/week`,
      directCostValue: 0,
      cascadeEffect: 'Pipeline dies when you\'re sick, on vacation, or busy with delivery. No you = no new revenue.',
      feedsInto: ['revenue-cap', 'vacation-risk'],
    });
  }

  // 3. SYSTEMS INEFFICIENCIES

  // No SOPs
  const hasSOPs = formData.has_sops;
  const documentedPct = formData.documented_pct || 0;
  if (hasSOPs === 'No' || documentedPct < 30) {
    inefficiencies.push({
      id: 'no-sops',
      category: 'systems',
      issue: 'Tribal knowledge blocks delegation',
      yourData: hasSOPs === 'No' ? 'No documented SOPs' : `Only ${documentedPct}% of processes documented`,
      directCost: 'Every task requires your brain, every hire needs your time to train',
      directCostValue: 0,
      cascadeEffect: 'Without documentation, knowledge is trapped in your head. You can\'t hire to replace yourself because there\'s nothing to train from.',
      feedsInto: ['owner-dependency', 'hiring-blocked', 'exit-value'],
    });
  }

  // No templates
  const hasTemplates = formData.has_deliverable_templates;
  if (hasTemplates === 'No') {
    const hoursPerProject = 4; // estimate hours saved per project with templates
    const projectsPerMonth = formData.new_clients_per_month || 2;
    const templateSavings = hoursPerProject * projectsPerMonth * 12 * ownerHourlyValue;
    inefficiencies.push({
      id: 'no-templates',
      category: 'systems',
      issue: 'Reinventing the wheel on every project',
      yourData: 'No templates for client deliverables',
      directCost: `~$${Math.round(templateSavings / 1000)}K/year recreating similar work`,
      directCostValue: templateSavings,
      cascadeEffect: 'Without templates, every project starts from scratch. Quality varies, delivery takes longer, and delegation is impossible.',
      feedsInto: ['wasted-hours', 'quality-inconsistency'],
    });
  }

  // 4. REVENUE RISK INEFFICIENCIES

  // Client concentration
  const top3Concentration = formData.top3_concentration_pct || 0;
  if (top3Concentration > 40) {
    const revenueAtRisk = Math.round((top3Concentration / 100) * annualRevenue);
    inefficiencies.push({
      id: 'client-concentration',
      category: 'risk',
      issue: 'Dangerous revenue concentration',
      yourData: `Top 3 clients = ${top3Concentration}% of revenue`,
      directCost: `$${Math.round(revenueAtRisk / 1000)}K at risk if one client leaves`,
      directCostValue: revenueAtRisk * 0.33, // probability-adjusted
      cascadeEffect: 'Acquirers see this as massive risk. One client departure could trigger a death spiral. This directly suppresses your exit multiple.',
      feedsInto: ['exit-value'],
    });
  }

  // Low recurring revenue
  const recurringPct = formData.revenue_recurring_pct || 0;
  if (recurringPct < 50) {
    const nonRecurringRevenue = annualRevenue * ((100 - recurringPct) / 100);
    inefficiencies.push({
      id: 'low-recurring',
      category: 'risk',
      issue: 'Revenue resets every month',
      yourData: `Only ${recurringPct}% recurring revenue`,
      directCost: 'Constant hustle to replace $' + Math.round(nonRecurringRevenue / 12 / 1000) + 'K/month',
      directCostValue: 0,
      cascadeEffect: 'Project-based revenue means starting from zero each month. You\'re on a treadmill that never stops.',
      feedsInto: ['sales-dependency', 'exit-value'],
    });
  }

  // 5. KNOWLEDGE & VACATION INEFFICIENCIES

  // Vacation breaks everything
  const vacationBreaks = formData.vacation_breaks;
  if (vacationBreaks && vacationBreaks.length > 20) {
    inefficiencies.push({
      id: 'vacation-risk',
      category: 'knowledge',
      issue: 'The business can\'t survive without you',
      yourData: `When you leave: "${vacationBreaks.substring(0, 100)}${vacationBreaks.length > 100 ? '...' : ''}"`,
      directCost: 'You haven\'t had a real vacation in how long?',
      directCostValue: 0,
      cascadeEffect: 'This is the clearest sign of owner dependency. If the business breaks when you step away, you don\'t own a business - you own a job.',
      feedsInto: ['exit-value', 'burnout'],
    });
  }

  // ============================================
  // CALCULATE THE COMPOUNDING EFFECT
  // ============================================

  // Sum up direct costs
  const totalDirectCosts = inefficiencies.reduce((sum, i) => sum + i.directCostValue, 0);

  // Calculate exit multiple impact
  const currentMultiple = score.financialMetrics.currentExitMultiple;
  const targetMultiple = 5;
  const multipleDelta = targetMultiple - currentMultiple;

  // Categorize inefficiencies
  const timeIssues = inefficiencies.filter(i => i.category === 'time');
  const systemsIssues = inefficiencies.filter(i => i.category === 'systems');
  const salesIssues = inefficiencies.filter(i => i.category === 'sales');
  const riskIssues = inefficiencies.filter(i => i.category === 'risk');
  const knowledgeIssues = inefficiencies.filter(i => i.category === 'knowledge');

  return (
    <div className="animate-fade-in max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Hero: The Owner Tax */}
        <div className="bg-gradient-to-br from-red-950 via-red-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-red-300 text-sm font-semibold uppercase tracking-wider mb-2">Your Owner Tax</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              You're losing <span className="text-red-400">${Math.round(wastedDollarsPerYear / 1000)}K</span>/year
            </h1>
            <p className="text-xl text-red-200/80 mb-8 max-w-2xl">
              to tasks below your pay grade. Here's how it adds up:
            </p>

            {/* Cascading Cost Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="text-red-300 text-sm font-medium mb-1">Hours Wasted Weekly</div>
                <div className="text-4xl font-bold">{wastedHoursWeekly}</div>
                <div className="text-red-200/60 text-sm mt-2">on tasks worth $50/hr when your time is worth ${ownerHourlyValue}/hr</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="text-red-300 text-sm font-medium mb-1">Annual Cost</div>
                <div className="text-4xl font-bold">${Math.round(wastedDollarsPerYear / 1000)}K</div>
                <div className="text-red-200/60 text-sm mt-2">{wastedHoursPerYear} hours × ${ownerHourlyValue}/hr</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="text-red-300 text-sm font-medium mb-1">Exit Value Lost</div>
                <div className="text-4xl font-bold">${(exitValueGap / 1000000).toFixed(1)}M</div>
                <div className="text-red-200/60 text-sm mt-2">the gap between {currentMultiple}x and {targetMultiple}x multiple</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* THE INEFFICIENCY CASCADE - Twilight Style */}
        {/* ============================================ */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              The Inefficiency Cascade
            </h2>
            <p className="text-slate-300 mt-2">
              {inefficiencies.length} compounding issues identified. Each one feeds the others, creating a doom loop that suppresses your exit value.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* TIME CATEGORY */}
            {timeIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Time & Capacity</h3>
                </div>
                <div className="space-y-4">
                  {timeIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* SYSTEMS CATEGORY */}
            {systemsIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Systems & Documentation</h3>
                </div>
                <div className="space-y-4">
                  {systemsIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* SALES CATEGORY */}
            {salesIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Sales & Growth</h3>
                </div>
                <div className="space-y-4">
                  {salesIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* RISK CATEGORY */}
            {riskIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Revenue Risk</h3>
                </div>
                <div className="space-y-4">
                  {riskIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* KNOWLEDGE CATEGORY */}
            {knowledgeIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Knowledge & Continuity</h3>
                </div>
                <div className="space-y-4">
                  {knowledgeIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* THE COMPOUNDING SUMMARY */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                How These Compound Into a ${(exitValueGap / 1000000).toFixed(1)}M Value Gap
              </h3>

              <div className="space-y-4 text-sm">
                <p className="text-slate-700">
                  These {inefficiencies.length} inefficiencies don't exist in isolation. They feed each other in a doom loop:
                </p>

                <div className="bg-white/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <p className="text-slate-700"><strong>No documentation</strong> means you can't delegate, so <strong>you stay in delivery</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <p className="text-slate-700"><strong>Stuck in delivery</strong> means no time for <strong>systems or strategy</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <p className="text-slate-700"><strong>No systems</strong> means you can't hire to replace yourself, so <strong>revenue is capped</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <p className="text-slate-700"><strong>Owner-dependent revenue</strong> means acquirers see risk, so <strong>your multiple stays at {currentMultiple}x</strong> instead of {targetMultiple}x</p>
                  </div>
                </div>

                <div className="bg-red-100 rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-900">The Total Cost:</span>
                    <span className="text-2xl font-bold text-red-600">${(exitValueGap / 1000000).toFixed(1)}M</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    That's the gap between your {currentMultiple}x multiple and the {targetMultiple}x you'd command with systems in place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Score - Secondary info, not hero */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Your ExitLayer Score</h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold" style={{ color: getScoreColor(score.overall) }}>
                {score.overall}
              </span>
              <span className="text-slate-400 text-sm">/100</span>
            </div>
          </div>
          <p className="text-slate-600 mb-4">{getOverallInterpretation(score.overall)}</p>

          {/* Dimension mini-bars */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { key: 'leverage', label: 'Leverage', score: score.dimensions.leverage },
              { key: 'equityPotential', label: 'Equity', score: score.dimensions.equityPotential },
              { key: 'revenueRisk', label: 'Revenue', score: score.dimensions.revenueRisk },
              { key: 'productReadiness', label: 'Product', score: score.dimensions.productReadiness },
              { key: 'implementationCapacity', label: 'Capacity', score: score.dimensions.implementationCapacity },
            ].map((dim) => (
              <div key={dim.key} className="text-center">
                <div className="text-lg font-bold" style={{ color: getScoreColor(dim.score) }}>
                  {dim.score}
                </div>
                <div className="text-xs text-slate-400 mb-1">{dim.label}</div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${dim.score}%`, backgroundColor: getScoreColor(dim.score) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Opportunity - A glimmer of hope */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
          <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Your Highest Opportunity: {score.analysis.highestOpportunity.dimension}
          </h3>
          <p className="text-emerald-800">{score.analysis.highestOpportunity.description}</p>
        </div>

        {/* Documents Required Section */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="p-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#2d4a2d]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2d4a2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Before Your Implementation Call</h3>
                <p className="text-[#666] text-sm">Upload these documents so we can prepare a tailored action plan</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {[
              { name: 'Service Offerings Document', desc: 'Your current services, pricing, and packages', icon: '📋' },
              { name: 'Sample Client Deliverable', desc: 'A recent project or report you delivered', icon: '📄' },
              { name: 'Team Structure / Org Chart', desc: 'Who does what on your team', icon: '👥' },
              { name: 'Current SOPs (if any)', desc: 'Any documented processes you have', icon: '📝' },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                <span className="text-2xl">{doc.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-[#1a1a1a]">{doc.name}</div>
                  <div className="text-sm text-[#666]">{doc.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999] bg-white px-2 py-1 rounded border border-[#e5e5e5]">Not uploaded</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#f8f8f6] border-t border-[#e5e5e5]">
            <a
              href="/assets"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d4a2d] text-white font-medium rounded-full hover:bg-[#1a2e1a] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Documents
            </a>
            <p className="text-[#999] text-sm mt-3">
              These help us understand your business before we talk, so we can make the call as valuable as possible.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#2d4a2d] rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-serif font-medium mb-3">Ready to stop the bleeding?</h3>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            In a 1-hour deep implementation call, we'll map exactly which systems would break this doom loop, define the build plan, and reclaim your ${Math.round(wastedDollarsPerYear / 1000)}K/year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/michael-exitlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#2d4a2d] font-medium rounded-full hover:bg-[#f8f8f6] transition-colors"
            >
              Book Your Implementation Call
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <p className="text-white/50 text-sm mt-4">
            Your full diagnostic has been saved. We'll be in touch within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

// Individual inefficiency card component
function InefficiencyCard({ issue, index }: { issue: { id: string; issue: string; yourData: string; directCost: string; cascadeEffect: string }; index: number }) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
          {index + 1}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-slate-900">{issue.issue}</h4>
            <p className="text-sm text-slate-500 mt-1">{issue.yourData}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100">
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Direct Cost</div>
              <div className="text-sm text-red-800">{issue.directCost}</div>
            </div>
            <div className="flex-1 bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Cascade Effect</div>
              <div className="text-sm text-amber-800">{issue.cascadeEffect}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
