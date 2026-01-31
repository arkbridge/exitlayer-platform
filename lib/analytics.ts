/**
 * Questionnaire Analytics Tracking
 *
 * Tracks user behavior throughout the questionnaire:
 * - Session data (start time, completion, etc.)
 * - Section navigation and time spent
 * - Question interactions
 * - Drop-off points
 * - Submission success/failure
 */

// ============================================================================
// Types
// ============================================================================

export interface SectionTiming {
  sectionIndex: number;
  sectionTitle: string;
  enterTime: number;
  exitTime?: number;
  timeSpentMs?: number;
  questionsAnswered: number;
}

export interface QuestionInteraction {
  questionId: string;
  field: string;
  sectionIndex: number;
  timestamp: number;
  interactionType: 'focus' | 'change' | 'blur';
  hasValue: boolean;
}

export interface AnalyticsSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  completed: boolean;
  submitted: boolean;

  // Device/browser info
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  referrer: string;

  // Progress tracking
  lastSectionReached: number;
  totalSectionsViewed: number;
  totalQuestionsAnswered: number;
  totalQuestions: number;
  completionPercentage: number;

  // Section timings
  sectionTimings: SectionTiming[];
  currentSection: number;

  // Engagement metrics
  questionInteractions: QuestionInteraction[];
  navigationEvents: NavigationEvent[];

  // Drop-off tracking
  abandonedAt?: {
    sectionIndex: number;
    sectionTitle: string;
    questionsAnsweredInSection: number;
    totalQuestionsAnswered: number;
  };
}

export interface NavigationEvent {
  timestamp: number;
  fromSection: number;
  toSection: number;
  direction: 'forward' | 'backward' | 'jump';
}

export interface AnalyticsSummary {
  sessionId: string;
  duration: {
    totalMs: number;
    totalMinutes: number;
    perSection: Array<{
      section: string;
      timeMs: number;
      timeMinutes: number;
    }>;
  };
  completion: {
    completed: boolean;
    submitted: boolean;
    percentageComplete: number;
    lastSectionReached: number;
    abandonedAt?: string;
  };
  engagement: {
    totalInteractions: number;
    questionsAnswered: number;
    sectionsVisited: number;
    backtrackCount: number;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    screenSize: string;
  };
}

// ============================================================================
// Analytics Class
// ============================================================================

export class QuestionnaireAnalytics {
  private session: AnalyticsSession;
  private sectionStartTime: number;
  private isInitialized: boolean = false;

  constructor() {
    this.session = this.createNewSession();
    this.sectionStartTime = Date.now();
  }

  private createNewSession(): AnalyticsSession {
    const sessionId = `qs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      sessionId,
      startTime: Date.now(),
      completed: false,
      submitted: false,

      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
      screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
      referrer: typeof document !== 'undefined' ? document.referrer : '',

      lastSectionReached: 0,
      totalSectionsViewed: 1,
      totalQuestionsAnswered: 0,
      totalQuestions: 0,
      completionPercentage: 0,

      sectionTimings: [],
      currentSection: 0,

      questionInteractions: [],
      navigationEvents: [],
    };
  }

  /**
   * Initialize the analytics session
   */
  initialize(totalQuestions: number): void {
    if (this.isInitialized) return;

    this.session.totalQuestions = totalQuestions;
    this.session.startTime = Date.now();
    this.sectionStartTime = Date.now();
    this.isInitialized = true;

    // Track initial section entry
    this.session.sectionTimings.push({
      sectionIndex: 0,
      sectionTitle: 'Section 1',
      enterTime: Date.now(),
      questionsAnswered: 0,
    });

    // Set up beforeunload listener to capture abandonment
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private handleBeforeUnload = (): void => {
    if (!this.session.submitted) {
      this.trackAbandonment();
    }
  };

  /**
   * Track section change
   */
  trackSectionChange(
    fromSection: number,
    toSection: number,
    sectionTitle: string,
    questionsAnsweredInSection: number
  ): void {
    const now = Date.now();

    // Close out the previous section timing
    const currentTiming = this.session.sectionTimings.find(
      (t) => t.sectionIndex === fromSection && !t.exitTime
    );
    if (currentTiming) {
      currentTiming.exitTime = now;
      currentTiming.timeSpentMs = now - currentTiming.enterTime;
      currentTiming.questionsAnswered = questionsAnsweredInSection;
    }

    // Determine navigation direction
    let direction: 'forward' | 'backward' | 'jump' = 'forward';
    if (toSection < fromSection) {
      direction = 'backward';
    } else if (toSection > fromSection + 1) {
      direction = 'jump';
    }

    // Record navigation event
    this.session.navigationEvents.push({
      timestamp: now,
      fromSection,
      toSection,
      direction,
    });

    // Start timing for new section
    this.session.sectionTimings.push({
      sectionIndex: toSection,
      sectionTitle,
      enterTime: now,
      questionsAnswered: 0,
    });

    // Update session state
    this.session.currentSection = toSection;
    if (toSection > this.session.lastSectionReached) {
      this.session.lastSectionReached = toSection;
      this.session.totalSectionsViewed++;
    }

    this.sectionStartTime = now;
  }

  /**
   * Track question interaction
   */
  trackQuestionInteraction(
    questionId: string,
    field: string,
    sectionIndex: number,
    interactionType: 'focus' | 'change' | 'blur',
    hasValue: boolean
  ): void {
    this.session.questionInteractions.push({
      questionId,
      field,
      sectionIndex,
      timestamp: Date.now(),
      interactionType,
      hasValue,
    });
  }

  /**
   * Update progress
   */
  updateProgress(questionsAnswered: number): void {
    this.session.totalQuestionsAnswered = questionsAnswered;
    this.session.completionPercentage = Math.round(
      (questionsAnswered / this.session.totalQuestions) * 100
    );
  }

  /**
   * Track form completion (all questions answered)
   */
  trackCompletion(): void {
    this.session.completed = true;
    this.session.completionPercentage = 100;
  }

  /**
   * Track successful submission
   */
  trackSubmission(): void {
    const now = Date.now();
    this.session.submitted = true;
    this.session.endTime = now;

    // Close out current section timing
    const currentTiming = this.session.sectionTimings.find(
      (t) => t.sectionIndex === this.session.currentSection && !t.exitTime
    );
    if (currentTiming) {
      currentTiming.exitTime = now;
      currentTiming.timeSpentMs = now - currentTiming.enterTime;
    }

    // Remove beforeunload listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  /**
   * Track abandonment
   */
  trackAbandonment(): void {
    const now = Date.now();

    // Get current section timing
    const currentTiming = this.session.sectionTimings.find(
      (t) => t.sectionIndex === this.session.currentSection && !t.exitTime
    );

    this.session.abandonedAt = {
      sectionIndex: this.session.currentSection,
      sectionTitle: currentTiming?.sectionTitle || `Section ${this.session.currentSection + 1}`,
      questionsAnsweredInSection: currentTiming?.questionsAnswered || 0,
      totalQuestionsAnswered: this.session.totalQuestionsAnswered,
    };

    this.session.endTime = now;

    // Close out timing
    if (currentTiming) {
      currentTiming.exitTime = now;
      currentTiming.timeSpentMs = now - currentTiming.enterTime;
    }
  }

  /**
   * Get the current session data
   */
  getSession(): AnalyticsSession {
    return { ...this.session };
  }

  /**
   * Get analytics summary for output
   */
  getSummary(): AnalyticsSummary {
    const totalMs = (this.session.endTime || Date.now()) - this.session.startTime;

    // Calculate device type
    const screenWidth = this.session.screenWidth;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (screenWidth < 768) {
      deviceType = 'mobile';
    } else if (screenWidth < 1024) {
      deviceType = 'tablet';
    }

    // Count backtracks
    const backtrackCount = this.session.navigationEvents.filter(
      (e) => e.direction === 'backward'
    ).length;

    return {
      sessionId: this.session.sessionId,
      duration: {
        totalMs,
        totalMinutes: Math.round(totalMs / 60000 * 10) / 10,
        perSection: this.session.sectionTimings.map((t) => ({
          section: t.sectionTitle,
          timeMs: t.timeSpentMs || 0,
          timeMinutes: Math.round((t.timeSpentMs || 0) / 60000 * 10) / 10,
        })),
      },
      completion: {
        completed: this.session.completed,
        submitted: this.session.submitted,
        percentageComplete: this.session.completionPercentage,
        lastSectionReached: this.session.lastSectionReached + 1, // 1-indexed for display
        abandonedAt: this.session.abandonedAt
          ? `${this.session.abandonedAt.sectionTitle} (${this.session.abandonedAt.totalQuestionsAnswered} questions answered)`
          : undefined,
      },
      engagement: {
        totalInteractions: this.session.questionInteractions.length,
        questionsAnswered: this.session.totalQuestionsAnswered,
        sectionsVisited: this.session.totalSectionsViewed,
        backtrackCount,
      },
      device: {
        type: deviceType,
        screenSize: `${this.session.screenWidth}x${this.session.screenHeight}`,
      },
    };
  }

  /**
   * Reset the session (for testing)
   */
  reset(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
    this.session = this.createNewSession();
    this.sectionStartTime = Date.now();
    this.isInitialized = false;
  }
}

// ============================================================================
// Singleton instance for use across components
// ============================================================================

let analyticsInstance: QuestionnaireAnalytics | null = null;

export function getAnalytics(): QuestionnaireAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new QuestionnaireAnalytics();
  }
  return analyticsInstance;
}

export function resetAnalytics(): void {
  if (analyticsInstance) {
    analyticsInstance.reset();
  }
  analyticsInstance = null;
}
