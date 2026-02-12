'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { preCallSections, type Question } from '@/lib/questions';
import { calculateValuation, type ValuationResult } from '@/lib/score-calculator';
import { getAnalytics } from '@/lib/analytics';

interface QuestionnaireFormProps {
  initialSessionToken?: string | null;
  initialFormData?: Record<string, any> | null;
  initialQuestionIndex?: number | null;
}

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

  preCallSections.forEach((section, sectionIndex) => {
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
  const section = preCallSections[sectionIndex];
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

// Section intro content for valuation quiz (4 sections)
const sectionIntros: Record<number, { headline: string; context: string }> = {
  0: {
    headline: 'Your Numbers',
    context: "A few financials to calculate your exit price. Ballpark is fine.",
  },
  1: {
    headline: 'Your Business',
    context: "How your agency operates today. These questions determine your exit multiple.",
  },
  2: {
    headline: 'The Exit Test',
    context: "Three questions every acquirer asks. Your answers determine your price.",
  },
  3: {
    headline: 'Get Your Results',
    context: "Last step — where should we send your valuation report?",
  },
};

export default function QuestionnaireForm({
  initialSessionToken = null,
  initialFormData = null,
  initialQuestionIndex = null,
}: QuestionnaireFormProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex || 0);
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [clientFolder, setClientFolder] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showSectionIntro, setShowSectionIntro] = useState(true); // Show intro for first section
  const [seenSections, setSeenSections] = useState<Set<number>>(new Set([0])); // Track which section intros we've shown
  const analyticsInitialized = useRef(false);
  const [sessionToken, setSessionToken] = useState<string | null>(initialSessionToken || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const sessionCreating = useRef(false);
  const supabaseSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Load saved progress - Priority: props (magic link) > localStorage token > localStorage data > fresh
  useEffect(() => {
    // If we got data from props (magic link resume), it's already set via useState defaults
    if (initialSessionToken && initialFormData) {
      // Store token in localStorage for future visits
      localStorage.setItem('exitlayer-session-token', initialSessionToken);
      localStorage.setItem('exitlayer-questionnaire-progress', JSON.stringify({
        formData: initialFormData,
        currentIndex: initialQuestionIndex || 0,
        savedAt: new Date().toISOString(),
      }));
      return;
    }

    // Check localStorage for existing session token
    const savedToken = localStorage.getItem('exitlayer-session-token');
    if (savedToken && !sessionToken) {
      setSessionToken(savedToken);
    }

    // Load form data from localStorage
    // Version check: if structure changed, keep data but reset to Q1
    const QUESTIONNAIRE_VERSION = 'v2-reordered-sections';
    const saved = localStorage.getItem('exitlayer-questionnaire-progress');
    if (saved) {
      try {
        const { formData: savedData, currentIndex, version } = JSON.parse(saved);
        setFormData(savedData || {});
        // Reset to start if version mismatch (sections were reordered)
        if (version === QUESTIONNAIRE_VERSION) {
          setCurrentQuestionIndex(currentIndex || 0);
        } else {
          setCurrentQuestionIndex(0);
          // Save with new version
          localStorage.setItem('exitlayer-questionnaire-progress', JSON.stringify({
            formData: savedData || {},
            currentIndex: 0,
            version: QUESTIONNAIRE_VERSION,
            savedAt: new Date().toISOString(),
          }));
        }
      } catch (e) {
        // Invalid saved data, start fresh
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save progress to localStorage + debounced Supabase save
  const QUESTIONNAIRE_VERSION = 'v2-reordered-sections';
  const saveProgress = useCallback((data: Record<string, any>, index: number) => {
    setSaveStatus('saving');
    localStorage.setItem('exitlayer-questionnaire-progress', JSON.stringify({
      formData: data,
      currentIndex: index,
      version: QUESTIONNAIRE_VERSION,
      savedAt: new Date().toISOString(),
    }));
    setTimeout(() => setSaveStatus('saved'), 600);

    // Debounced Supabase save (1s after last change)
    if (supabaseSaveTimer.current) {
      clearTimeout(supabaseSaveTimer.current);
    }
    supabaseSaveTimer.current = setTimeout(() => {
      const token = sessionToken || localStorage.getItem('exitlayer-session-token');
      if (token) {
        const answeredCount = Object.keys(data).filter(
          (k) => data[k] !== undefined && data[k] !== '' && data[k] !== null
        ).length;
        fetch('/api/audit-session/save', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_token: token,
            form_data: data,
            current_question_index: index,
            questions_answered: answeredCount,
          }),
        }).catch((err) => console.error('Supabase save failed:', err));
      }
    }, 1000);
  }, [sessionToken]);

  // Create audit session after lead capture (name + email + company)
  const createSessionIfNeeded = useCallback(async (data: Record<string, any>) => {
    if (sessionToken || sessionCreating.current) return;
    if (!data.full_name || !data.email || !data.company_name) return;

    sessionCreating.current = true;
    try {
      const res = await fetch('/api/audit-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          company_name: data.company_name,
        }),
      });
      const result = await res.json();
      if (result.session_token) {
        setSessionToken(result.session_token);
        localStorage.setItem('exitlayer-session-token', result.session_token);

        // If resuming an existing session, load its data
        if (result.resumed && result.form_data) {
          setFormData(result.form_data);
          setCurrentQuestionIndex(result.current_question_index || 3);
          localStorage.setItem('exitlayer-questionnaire-progress', JSON.stringify({
            formData: result.form_data,
            currentIndex: result.current_question_index || 3,
            savedAt: new Date().toISOString(),
          }));
        }
      }
    } catch (err) {
      console.error('Failed to create audit session:', err);
    } finally {
      sessionCreating.current = false;
    }
  }, [sessionToken]);

  const handleInputChange = (field: string, value: any) => {
    // Clear validation error when user starts typing
    setValidationError(null);

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

    // After lead capture fields are filled, create session
    if (field === 'company_name' || field === 'email' || field === 'full_name') {
      createSessionIfNeeded(newData);
    }
  };

  const handleNext = () => {
    if (showSectionIntro) {
      // Dismiss intro and show first question
      setShowSectionIntro(false);
      return;
    }

    // Validate current question before proceeding
    const currentQuestion = currentQ.question;
    const currentValue = formData[currentQuestion.field];
    const isEmpty = currentValue === undefined || currentValue === '' || currentValue === null;

    if (currentQuestion.required && isEmpty) {
      setValidationError('Please answer this question to continue');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }

    // Clear any previous validation error
    setValidationError(null);

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

    // Calculate valuation client-side for instant results
    const result = calculateValuation(formData);
    setValuation(result);
    setSubmitted(true);
    setIsSubmitting(false);

    // Fire server POST in background (non-blocking)
    const token = sessionToken || localStorage.getItem('exitlayer-session-token');
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        _analytics: analyticsSummary,
        _analyticsSession: analyticsSession,
        _session_token: token,
        _valuation: {
          currentValuation: result.currentValuation,
          potentialValuation: result.potentialValuation,
          currentMultiple: result.currentMultiple,
          potentialMultiple: result.potentialMultiple,
          sde: result.sde,
        },
      }),
    }).then(res => res.json()).then(data => {
      if (data.success) {
        analytics.trackSubmission();
        localStorage.removeItem('exitlayer-questionnaire-progress');
        if (data.clientFolder) setClientFolder(data.clientFolder);
      }
    }).catch(err => console.error('Background submit error:', err));
  };

  if (submitted && valuation) {
    return <ValuationResults valuation={valuation} formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Top progress dashboard header */}
      <header className="bg-[#f8f8f6] border-b border-[#e5e5e5] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer Assessment</h1>
            </div>

            {/* Save status indicator */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                saveStatus === 'saved'
                  ? 'bg-emerald-900/10 text-emerald-800'
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
          <div className="grid grid-cols-4 gap-1.5">
            {preCallSections.map((section, i) => {
              const sectionProgress = getSectionProgress(i, formData);
              const isActive = i === currentQ.sectionIndex;
              const isComplete = sectionProgress.percentage === 100;
              const sectionName = section.title.replace(/Section \d+: /, '');

              return (
                <button
                  key={i}
                  onClick={() => handleSectionJump(i)}
                  className={`p-2.5 rounded-lg border transition-all text-left ${
                    isActive
                      ? 'border-emerald-800 bg-emerald-900'
                      : isComplete
                      ? 'border-emerald-800/30 bg-emerald-900/5 hover:border-emerald-800/50'
                      : sectionProgress.answered > 0
                      ? 'border-[#e5e5e5] bg-white hover:border-[#ccc]'
                      : 'border-[#e5e5e5] bg-white hover:border-[#ccc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium truncate ${
                      isActive ? 'text-white' : isComplete ? 'text-emerald-800' : 'text-[#666]'
                    }`}>
                      {sectionName}
                    </span>
                    {isComplete && (
                      <svg className="w-3.5 h-3.5 text-emerald-800 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${
                    isActive ? 'bg-white/20' : 'bg-[#e5e5e5]'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isActive ? 'bg-white' : 'bg-emerald-900'
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
              <div className="text-xs text-[#999] uppercase tracking-wider mb-3">
                Section {currentQ.sectionIndex + 1} of {preCallSections.length}
              </div>
              <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-3">
                {sectionIntros[currentQ.sectionIndex]?.headline || currentQ.sectionTitle}
              </h2>
              <p className="text-[#666] mb-6 max-w-md mx-auto">
                {sectionIntros[currentQ.sectionIndex]?.context}
              </p>
              <div className="text-sm text-[#999] mb-6">
                {currentQ.totalInSection} questions
              </div>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors inline-flex items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="w-10 h-10 rounded-full bg-emerald-900 text-white flex items-center justify-center text-sm font-medium">
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
                      className="h-full bg-emerald-900 rounded-full transition-all duration-500"
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
              <div className={shakeInput ? 'animate-shake' : ''}>
                <QuestionInput
                  question={currentQ.question}
                  value={formData[currentQ.question.field]}
                  onChange={(value) => handleInputChange(currentQ.question.field, value)}
                />
              </div>


            {/* Validation error - centered */}
            {validationError && (
              <p className="text-red-500 text-sm text-center mt-6">{validationError}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-8 border-t border-[#e5e5e5]">
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
                  className="px-10 py-4 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-all flex items-center gap-2 disabled:opacity-50"
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
                      Get Your Valuation
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-10 py-4 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-all flex items-center gap-2"
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
  const baseInputClasses = "w-full text-lg px-6 py-5 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 transition-all placeholder:text-[#999]";

  if (question.type === 'text' || question.type === 'number') {
    const displayValue = question.type === 'number'
      ? (value !== null && value !== undefined && value !== '' ? Number(value).toLocaleString('en-US') : '')
      : value || '';

    const isMoneyField = question.field.includes('revenue') || question.field.includes('avg_value') || question.field === 'owner_annual_comp';

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
              if (numValue === '') {
                onChange(null);
              } else {
                const parsed = Number(numValue);
                onChange(isNaN(parsed) ? null : parsed);
              }
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


// ============================================
// SCROLL ANIMATION HOOK
// ============================================
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.fade-up, .slide-in-left, .scale-up');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

// ============================================
// ANIMATED NUMBER COMPONENT
// ============================================
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(eased * value);
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const formatted = decimals > 0
    ? displayed.toFixed(decimals)
    : Math.round(displayed).toLocaleString();

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

// ============================================
// RISK FACTOR TYPES
// ============================================
interface RiskFactor {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'good';
  userAnswer: string;
  description: string;
  impact: string;
}

interface OwnershipAsset {
  name: string;
  status: 'missing' | 'partial' | 'owned';
  description: string;
}

// ============================================
// DERIVE RISK FACTORS FROM FORM DATA
// ============================================
function deriveRiskFactors(formData: Record<string, any>): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Owner Dependency (from without_you)
  const depMap: Record<string, { severity: 'critical' | 'high' | 'moderate' | 'good'; description: string }> = {
    'Everything stops. The business IS me.': {
      severity: 'critical',
      description: 'The business cannot function without you. Acquirers see this as buying a job, not a company.'
    },
    'Major problems — clients would notice': {
      severity: 'critical',
      description: 'Clients would notice your absence. The business depends heavily on you.'
    },
    "Some things would slip, but it'd survive": {
      severity: 'moderate',
      description: 'The business could survive without you, but not thrive.'
    },
    'It would run fine without me': {
      severity: 'good',
      description: 'Low owner dependency. This is what acquirers want to see.'
    },
  };
  const dep = depMap[formData.without_you];
  if (dep && dep.severity !== 'good') {
    factors.push({
      id: 'owner-dependency',
      name: 'Owner Dependency',
      severity: dep.severity,
      userAnswer: formData.without_you,
      description: dep.description,
      impact: 'If you step away, the business suffers. This suppresses your multiple.',
    });
  }

  // Delivery Involvement (from owner_project_involvement)
  const deliveryMap: Record<string, { severity: 'critical' | 'high' | 'moderate' | 'good'; description: string }> = {
    'Nearly all (90%+)': { severity: 'critical', description: "You're in the weeds on almost every project." },
    'Most (70-90%)': { severity: 'critical', description: "You're directly involved in most client work." },
    'About half (40-70%)': { severity: 'moderate', description: "You're still involved in too many projects." },
    'Some (20-40%)': { severity: 'moderate', description: 'Some involvement, but your team handles most.' },
    'Few or none (<20%)': { severity: 'good', description: 'Minimal delivery involvement. Your team executes.' },
  };
  const delivery = deliveryMap[formData.owner_project_involvement];
  if (delivery && delivery.severity !== 'good') {
    factors.push({
      id: 'delivery-involvement',
      name: 'Delivery Involvement',
      severity: delivery.severity,
      userAnswer: formData.owner_project_involvement,
      description: delivery.description,
      impact: "Your capacity limits the business's capacity.",
    });
  }

  // Sales Dependency (from owner_sales_pct)
  const salesMap: Record<string, { severity: 'critical' | 'high' | 'moderate' | 'good'; description: string }> = {
    'I close all of them (100%)': { severity: 'critical', description: "You're the only one who can close deals." },
    'I close most (75%+)': { severity: 'critical', description: 'You close the vast majority of deals.' },
    'About half (50%)': { severity: 'moderate', description: "You're still closing half the deals." },
    'My team closes most (<25%)': { severity: 'good', description: 'Your team handles most sales.' },
    "I don't do sales": { severity: 'good', description: 'Sales runs without you.' },
  };
  const sales = salesMap[formData.owner_sales_pct];
  if (sales && sales.severity !== 'good') {
    factors.push({
      id: 'sales-dependency',
      name: 'Sales Dependency',
      severity: sales.severity,
      userAnswer: formData.owner_sales_pct,
      description: sales.description,
      impact: 'Growth is capped by your calendar.',
    });
  }

  // Documentation (from documented_level)
  const docMap: Record<string, { severity: 'critical' | 'high' | 'moderate' | 'good'; description: string }> = {
    'Nothing is documented': { severity: 'critical', description: 'Zero documentation. Everything is in your head.' },
    'A few rough notes here and there': { severity: 'critical', description: 'Minimal documentation that no one could actually use.' },
    'Most processes have some documentation': { severity: 'moderate', description: 'Some documentation exists, but gaps remain.' },
    'Fully documented with SOPs and templates': { severity: 'good', description: 'Fully documented. This is transferable.' },
  };
  const doc = docMap[formData.documented_level];
  if (doc && doc.severity !== 'good') {
    factors.push({
      id: 'documentation',
      name: 'Documentation',
      severity: doc.severity,
      userAnswer: formData.documented_level,
      description: doc.description,
      impact: 'Nothing to transfer in a sale. Your knowledge dies with you.',
    });
  }

  // Client Concentration (from top_client_pct)
  const concMap: Record<string, { severity: 'critical' | 'high' | 'moderate' | 'good'; description: string }> = {
    'More than 50%': { severity: 'critical', description: 'Over half your revenue from one client.' },
    '25-50%': { severity: 'high', description: 'A quarter to half your revenue from one client.' },
    '10-25%': { severity: 'moderate', description: 'Moderate concentration in your top client.' },
    'Less than 10%': { severity: 'good', description: 'Well-diversified client base.' },
  };
  const conc = concMap[formData.top_client_pct];
  if (conc && conc.severity !== 'good') {
    factors.push({
      id: 'client-concentration',
      name: 'Client Concentration',
      severity: conc.severity,
      userAnswer: formData.top_client_pct,
      description: conc.description,
      impact: 'Losing that client could be catastrophic.',
    });
  }

  // Revenue Model (from revenue_model)
  const revMap: Record<string, { severity: 'critical' | 'high' | 'moderate' | 'good'; description: string }> = {
    'Mostly project-based': { severity: 'high', description: 'Project-based means starting from zero every month.' },
    'Mix of projects and retainers': { severity: 'moderate', description: 'Some recurring, but not enough for predictability.' },
    'Mostly retainers / recurring': { severity: 'good', description: 'Strong recurring revenue base.' },
  };
  const rev = revMap[formData.revenue_model];
  if (rev && rev.severity !== 'good') {
    factors.push({
      id: 'revenue-model',
      name: 'Revenue Model',
      severity: rev.severity,
      userAnswer: formData.revenue_model,
      description: rev.description,
      impact: "No predictability. You're always hunting for the next deal.",
    });
  }

  return factors;
}

// ============================================
// DERIVE OWNERSHIP STATUS
// ============================================
function deriveOwnershipAssets(formData: Record<string, any>): OwnershipAsset[] {
  const isHighDependency =
    formData.without_you === 'Everything stops. The business IS me.' ||
    formData.without_you === 'Major problems — clients would notice';

  const isLowDocumentation =
    formData.documented_level === 'Nothing is documented' ||
    formData.documented_level === 'A few rough notes here and there';

  const hasRecurring = formData.revenue_model === 'Mostly retainers / recurring';
  const hasProprietary = formData.has_proprietary_method === 'Yes';

  return [
    {
      name: 'Internal Systems',
      status: isHighDependency || isLowDocumentation ? 'missing' : 'partial',
      description: isHighDependency
        ? "The business runs on you, not systems."
        : "Some systems exist, but gaps remain.",
    },
    {
      name: 'Documented IP',
      status: isLowDocumentation ? 'missing' : (formData.documented_level === 'Fully documented with SOPs and templates' ? 'owned' : 'partial'),
      description: isLowDocumentation
        ? "Your knowledge is trapped in your head."
        : "Some processes captured, but not complete.",
    },
    {
      name: 'Recurring Revenue',
      status: hasRecurring ? 'owned' : (formData.revenue_model === 'Mix of projects and retainers' ? 'partial' : 'missing'),
      description: hasRecurring
        ? "Predictable monthly revenue."
        : "You start from zero every month.",
    },
    {
      name: 'Proprietary Method',
      status: hasProprietary ? 'owned' : (formData.has_proprietary_method === 'Sort of' ? 'partial' : 'missing'),
      description: hasProprietary
        ? "Named methodology that differentiates you."
        : "No formalized approach to sell.",
    },
  ];
}

// ============================================
// SEVERITY BADGE COMPONENT
// ============================================
function SeverityBadge({ severity }: { severity: 'critical' | 'high' | 'moderate' | 'good' }) {
  const styles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    good: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const labels = {
    critical: 'CRITICAL',
    high: 'HIGH RISK',
    moderate: 'MODERATE',
    good: 'GOOD',
  };

  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded border ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

// ============================================
// OWNERSHIP STATUS ICON
// ============================================
function OwnershipIcon({ status }: { status: 'missing' | 'partial' | 'owned' }) {
  if (status === 'owned') {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  if (status === 'partial') {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

// ============================================
// CTA COMPONENT BY STAGE
// ============================================
function StageCTA({ ctaType, valuationGap, potentialValuation }: {
  ctaType: 'free-guide' | 'book-call' | 'darwin-group';
  valuationGap: number;
  potentialValuation: number;
}) {
  if (ctaType === 'free-guide') {
    return (
      <div className="text-center">
        <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-4 font-medium">Next Step</p>
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-4">
          Let&apos;s talk about where you&apos;re headed.
        </h2>
        <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
          Every agency starts somewhere. Book a call and we&apos;ll map out
          what systems would make the biggest difference at your stage.
        </p>
        <a
          href="https://cal.com/exit-layer/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-900 rounded-full font-medium hover:bg-emerald-50 transition-all text-lg hover:scale-105 shadow-2xl shadow-emerald-900/20"
        >
          Book Your Strategy Call
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  if (ctaType === 'darwin-group') {
    return (
      <div className="text-center">
        <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-4 font-medium">You&apos;re Ahead</p>
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-4">
          You&apos;re in the top 5% of agencies.
        </h2>
        <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
          You&apos;ve built systems most never achieve. Darwin Group is our community for
          operators at your level—focused on scale, exits, and what&apos;s next.
        </p>
        <a
          href="https://cal.com/exit-layer/darwin-group"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-900 rounded-full font-medium hover:bg-emerald-50 transition-all text-lg hover:scale-105 shadow-2xl shadow-emerald-900/20"
        >
          Book a Darwin Group Call
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  // Default: book-call (Stage 1 or 2)
  return (
    <div className="text-center">
      <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-4 font-medium">Next Step</p>
      <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-4">
        Get your roadmap to{' '}
        <span className="text-emerald-400">
          ${potentialValuation >= 1000000
            ? <AnimatedNumber value={potentialValuation / 1000000} decimals={1} suffix="M" />
            : <AnimatedNumber value={potentialValuation / 1000} decimals={0} suffix="K" />
          }
        </span>
      </h2>
      <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
        In 30 minutes, we&apos;ll map exactly which systems would unlock that{' '}
        <span className="text-white/70">
          ${valuationGap >= 1000000
            ? `${(valuationGap / 1000000).toFixed(1)}M`
            : `${(valuationGap / 1000).toFixed(0)}K`}
        </span> you&apos;re leaving on the table.
      </p>
      <a
        href="https://cal.com/exit-layer/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-900 rounded-full font-medium hover:bg-emerald-50 transition-all text-lg hover:scale-105 shadow-2xl shadow-emerald-900/20"
      >
        Book Your Strategy Call
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
      <p className="text-white/30 text-sm mt-8">
        Your assessment has been saved. Michael will review before your call.
      </p>
    </div>
  );
}

// ============================================
// VALUATION RESULTS COMPONENT — New Format
// ============================================
function ValuationResults({ valuation, formData }: { valuation: ValuationResult; formData: Record<string, any> }) {
  const scrollRef = useScrollAnimation();
  const riskFactors = deriveRiskFactors(formData);
  const ownershipAssets = deriveOwnershipAssets(formData);
  const ownerHourlyValue = valuation.ownerHoursPerWeek > 0
    ? Math.round(valuation.annualRevenue / (valuation.ownerHoursPerWeek * 52))
    : 0;

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#f8f8f6]">
      {/* CSS for animations */}
      <style jsx>{`
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .slide-in-left {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .slide-in-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .scale-up {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .scale-up.visible {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      {/* Nav */}
      <nav className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] py-6 relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span
            className="text-xl font-serif font-medium tracking-tight"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(167,243,208,0.8) 50%, rgba(110,231,183,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ExitLayer
          </span>
          <span className="text-white/40 text-sm">Your Results</span>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO: THE VALUATION GAP */}
      {/* ============================================ */}
      <section className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 pb-28 md:pb-36 relative z-10">
          <div className="text-center fade-up">
            <p className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider mb-6">
              Your Exit Valuation
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-4 leading-tight">
              Your agency is worth{' '}
              <span className="text-white">
                ${valuation.currentValuation >= 1000000
                  ? <AnimatedNumber value={valuation.currentValuation / 1000000} decimals={2} suffix="M" />
                  : <AnimatedNumber value={valuation.currentValuation / 1000} decimals={0} suffix="K" />
                }
              </span>
              {' '}today.
            </h1>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-emerald-400 mb-6 leading-tight">
              It could be worth{' '}
              <span className="text-emerald-300">
                ${valuation.potentialValuation >= 1000000
                  ? <AnimatedNumber value={valuation.potentialValuation / 1000000} decimals={1} suffix="M" />
                  : <AnimatedNumber value={valuation.potentialValuation / 1000} decimals={0} suffix="K" />
                }
              </span>
              .
            </h2>

            <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto">
              The gap?{' '}
              <span className="text-white/70 font-medium">You don&apos;t own anything yet.</span>
            </p>

            {/* Valuation Comparison */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/50 text-sm uppercase tracking-wide">Today</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded">
                    {valuation.currentMultiple}x MULTIPLE
                  </span>
                </div>
                <div className="text-4xl font-serif font-medium text-white mb-2">
                  ${valuation.currentValuation >= 1000000
                    ? <AnimatedNumber value={valuation.currentValuation / 1000000} decimals={2} suffix="M" />
                    : <AnimatedNumber value={valuation.currentValuation / 1000} decimals={0} suffix="K" />
                  }
                </div>
                <p className="text-white/40 text-sm">
                  Based on ${valuation.sde >= 1000000
                    ? `${(valuation.sde / 1000000).toFixed(2)}M`
                    : `${(valuation.sde / 1000).toFixed(0)}K`} SDE × {valuation.currentMultiple}x
                </p>
              </div>

              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-emerald-300/70 text-sm uppercase tracking-wide">Potential</span>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded">
                    {valuation.potentialMultiple}x MULTIPLE
                  </span>
                </div>
                <div className="text-4xl font-serif font-medium text-emerald-300 mb-2">
                  ${valuation.potentialValuation >= 1000000
                    ? <AnimatedNumber value={valuation.potentialValuation / 1000000} decimals={1} suffix="M" />
                    : <AnimatedNumber value={valuation.potentialValuation / 1000} decimals={0} suffix="K" />
                  }
                </div>
                <p className="text-emerald-300/50 text-sm">With systems that don&apos;t require you</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHAT YOU DON'T OWN */}
      {/* ============================================ */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20 -mt-8">
        <div
          className="scale-up bg-white rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-4">The Diagnosis</p>

            <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-6 leading-tight">
              You don&apos;t own your business.<br />
              <span className="text-[#666]">Your business owns you.</span>
            </h2>

            <div className="space-y-4 text-lg text-[#666] leading-relaxed mb-8">
              <p>
                A business worth acquiring has two things: <strong className="text-[#1a1a1a]">internal systems</strong> that
                run without the owner, and <strong className="text-[#1a1a1a]">external products</strong> that generate
                revenue without the owner&apos;s time.
              </p>
              <p>
                Right now, you don&apos;t own either. You ARE the system. You ARE the product.
              </p>
            </div>

            {/* Ownership Checklist */}
            <div className="grid md:grid-cols-2 gap-4">
              {ownershipAssets.map((asset, i) => (
                <div
                  key={asset.name}
                  className="slide-in-left flex items-start gap-4 p-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa]"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <OwnershipIcon status={asset.status} />
                  <div>
                    <div className="font-semibold text-[#1a1a1a] mb-1">{asset.name}</div>
                    <div className="text-sm text-[#666]">{asset.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* YOUR RISK FACTORS */}
      {/* ============================================ */}
      {riskFactors.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium text-[#1a1a1a]">What&apos;s Suppressing Your Multiple</h2>
                <p className="text-[#666]">Based on your answers</p>
              </div>
            </div>

            <div className="space-y-4">
              {riskFactors.map((factor, i) => (
                <div
                  key={factor.id}
                  className="slide-in-left bg-white rounded-xl p-6 border border-[#e5e5e5] hover:shadow-lg transition-all"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#1a1a1a]">{factor.name}</h3>
                        <SeverityBadge severity={factor.severity} />
                      </div>
                      <p className="text-[#666] text-sm mb-2">{factor.description}</p>
                      <p className="text-xs text-[#999] italic">
                        You said: &ldquo;{factor.userAnswer}&rdquo;
                      </p>
                    </div>
                    <div className="md:max-w-xs md:text-right">
                      <p className="text-sm text-[#999]">{factor.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* YOUR TIME (Owner Tax) - Only show if hours > 40 */}
      {/* ============================================ */}
      {valuation.ownerHoursPerWeek > 40 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div
            className="scale-up bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-red-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />

            <div className="relative">
              <p className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-2">Your Time</p>
              <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-6">
                You&apos;re working{' '}
                <span className="text-red-600">{valuation.ownerHoursPerWeek} hours/week</span>
                {' '}at ${ownerHourlyValue}/hour.
              </h3>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/80 rounded-xl p-5 border border-red-100">
                  <div className="text-3xl font-serif font-bold text-[#1a1a1a] mb-1">{valuation.ownerHoursPerWeek}</div>
                  <div className="text-sm text-[#666]">hours/week you work</div>
                </div>
                <div className="bg-white/80 rounded-xl p-5 border border-red-100">
                  <div className="text-3xl font-serif font-bold text-[#1a1a1a] mb-1">${ownerHourlyValue}</div>
                  <div className="text-sm text-[#666]">your effective hourly rate</div>
                </div>
                <div className="bg-white/80 rounded-xl p-5 border border-red-100">
                  <div className="text-3xl font-serif font-bold text-red-600 mb-1">{valuation.ownerHoursPerWeek - 20}</div>
                  <div className="text-sm text-[#666]">hours above a strategic role</div>
                </div>
              </div>

              <p className="text-[#666] text-lg">
                A CEO working 20 hours/week on strategy is building equity.
                A CEO working {valuation.ownerHoursPerWeek} hours/week in delivery is just trading time for money.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* THE PATH: Ownership Ladder */}
      {/* ============================================ */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="fade-up text-center mb-10">
          <p className="text-xs text-[#999] uppercase tracking-wider mb-3 font-medium">The Path</p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a]">
            Two Things You Need to Own
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="scale-up bg-white rounded-2xl p-8 md:p-10"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 12px 24px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">PHASE 1</span>
            </div>
            <h3 className="text-xl font-serif font-medium text-[#1a1a1a] mb-3">Internal Systems</h3>
            <p className="text-[#666] mb-6">
              Documented processes, decision frameworks, and trained team members that let
              the business run without your daily involvement.
            </p>
            <div className="space-y-2 text-sm text-[#666]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Business runs without you</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Multiple jumps to 3-4x</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>You get your time back</span>
              </div>
            </div>
          </div>

          <div
            className="scale-up bg-white rounded-2xl p-8 md:p-10 relative overflow-hidden"
            style={{
              animationDelay: '0.15s',
              boxShadow: '0 1px 2px rgba(16,185,129,0.04), 0 4px 8px rgba(16,185,129,0.06), 0 12px 24px rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)'
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">PHASE 2</span>
              </div>
              <h3 className="text-xl font-serif font-medium text-[#1a1a1a] mb-3">External Product</h3>
              <p className="text-[#666] mb-6">
                A productized offering with recurring revenue that generates income
                without requiring your time in delivery.
              </p>
              <div className="space-y-2 text-sm text-[#666]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Revenue without your time</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Multiple jumps to 5x+</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Real equity you can sell</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA: STAGE-APPROPRIATE */}
      {/* ============================================ */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div
          className="scale-up bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <StageCTA
              ctaType={valuation.ctaType}
              valuationGap={valuation.valuationGap}
              potentialValuation={valuation.potentialValuation}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] pt-16 pb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-6 mb-10 relative">
          <h2
            className="text-[10vw] md:text-[8vw] lg:text-[6vw] font-serif font-medium leading-none tracking-tight text-center select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(167,243,208,0.8) 50%, rgba(110,231,183,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ExitLayer
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
            <span>© 2026 ExitLayer</span>
            <div className="flex items-center gap-6">
              <a href="/questionnaire" className="hover:text-white/60 transition-colors">
                Take Assessment
              </a>
              <a href="mailto:michael@exitlayer.io" className="hover:text-white/60 transition-colors">
                michael@exitlayer.io
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
