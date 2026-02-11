// Client journey stage utilities

export type ClientStage = 'new' | 'in_audit' | 'docs_needed' | 'ready' | 'building' | 'complete'

export interface SprintData {
  week: number
  systems: string[]
  hoursReclaimed: number
  milestones: {
    name: string
    completed: boolean
    completedAt?: string
  }[]
  status: 'active' | 'complete'
}

export interface AuditSession {
  id: string
  user_id: string
  full_name?: string
  company_name?: string
  email?: string
  score_data?: ScoreData
  form_data?: Record<string, any>
  full_audit_status?: 'not_started' | 'in_progress' | 'completed'
  full_audit_data?: Record<string, any>
  full_audit_current_question?: number
  full_audit_started_at?: string
  full_audit_completed_at?: string
  client_stage?: ClientStage
  sprint_data?: SprintData
  documents_uploaded?: string[]
  created_at?: string
  updated_at?: string
}

export interface ScoreData {
  overall?: number
  dimensions?: {
    leverage?: number
    equityPotential?: number
    revenueRisk?: number
    productReadiness?: number
    implementationCapacity?: number
  }
  financialMetrics?: {
    currentExitValue?: number
    targetExitValue?: number
    valueGap?: number
    currentExitMultiple?: number
    ownerHourlyValue?: number
    monthlyRevenue?: number
  }
  primaryConstraint?: {
    dimension: string
    score: number
    description: string
  }
  highestOpportunity?: {
    dimension: string
    score: number
    description: string
  }
  criticalFindings?: CriticalFinding[]
  quickWins?: QuickWin[]
}

export interface CriticalFinding {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: string
}

export interface QuickWin {
  id: string
  title: string
  description: string
  timeEstimate: string
  impact: 'high' | 'medium' | 'low'
  completed?: boolean
}

// Required documents for the docs_needed stage
export const REQUIRED_DOCUMENTS = [
  { id: 'service_offerings', name: 'Service Offerings Document', description: 'Your current services, pricing, and packages', icon: '📋' },
  { id: 'sample_deliverable', name: 'Sample Client Deliverable', description: 'A recent project or report you delivered', icon: '📄' },
  { id: 'team_structure', name: 'Team Structure / Org Chart', description: 'Who does what on your team', icon: '👥' },
  { id: 'current_sops', name: 'Current SOPs (if any)', description: 'Any documented processes you have', icon: '📝' },
]

/**
 * Determine the client's current journey stage based on their session data
 */
export function getClientStage(session: AuditSession | null): ClientStage {
  if (!session) return 'new'

  // Complete: has sprint_data with complete status
  if (session.sprint_data?.status === 'complete') {
    return 'complete'
  }

  // Building: has sprint_data with active sprint (week > 0)
  if (session.sprint_data && session.sprint_data.week > 0) {
    return 'building'
  }

  // Ready: full audit complete + all docs uploaded
  if (session.full_audit_status === 'completed' && hasAllDocuments(session)) {
    return 'ready'
  }

  // Docs Needed: full audit complete, missing docs
  if (session.full_audit_status === 'completed') {
    return 'docs_needed'
  }

  // In Audit: full audit started but not complete
  if (session.full_audit_status === 'in_progress') {
    return 'in_audit'
  }

  // New: default (has short assessment but nothing else)
  return 'new'
}

/**
 * Check if all required documents have been uploaded
 */
export function hasAllDocuments(session: AuditSession): boolean {
  const uploaded = session.documents_uploaded || []
  return REQUIRED_DOCUMENTS.every(doc => uploaded.includes(doc.id))
}

/**
 * Get the count of uploaded documents
 */
export function getUploadedDocumentCount(session: AuditSession): number {
  const uploaded = session.documents_uploaded || []
  return REQUIRED_DOCUMENTS.filter(doc => uploaded.includes(doc.id)).length
}

/**
 * Get stage display information for UI
 */
export function getStageInfo(stage: ClientStage): {
  label: string
  description: string
  color: string
  bgColor: string
} {
  const stageInfo: Record<ClientStage, { label: string; description: string; color: string; bgColor: string }> = {
    new: {
      label: 'Getting Started',
      description: 'Complete your full audit to unlock insights',
      color: '#666',
      bgColor: '#f8f8f6',
    },
    in_audit: {
      label: 'Audit In Progress',
      description: 'Continue your deep-dive assessment',
      color: '#b59f3b',
      bgColor: 'rgba(181, 159, 59, 0.1)',
    },
    docs_needed: {
      label: 'Documents Needed',
      description: 'Upload your documents so we can start building',
      color: '#c77d3e',
      bgColor: 'rgba(199, 125, 62, 0.1)',
    },
    ready: {
      label: 'Ready to Build',
      description: 'Everything received. Let\'s schedule your kickoff.',
      color: '#064e3b',
      bgColor: 'rgba(6, 78, 59, 0.1)',
    },
    building: {
      label: 'Building',
      description: 'Your transformation is underway',
      color: '#064e3b',
      bgColor: 'rgba(6, 78, 59, 0.1)',
    },
    complete: {
      label: 'Complete',
      description: 'Your transformation is complete',
      color: '#064e3b',
      bgColor: 'rgba(6, 78, 59, 0.1)',
    },
  }

  return stageInfo[stage]
}

/**
 * Get hero content based on current stage
 */
export function getHeroContent(stage: ClientStage, session: AuditSession | null): {
  headline: string
  subtext: string
  ctaText: string
  ctaHref: string
} {
  const valueGap = session?.score_data?.financialMetrics?.valueGap || 0
  const formattedGap = formatCurrency(valueGap)
  const auditProgress = session?.full_audit_current_question || 0
  const totalQuestions = 74
  const progressPercent = Math.round((auditProgress / totalQuestions) * 100)

  const heroContent: Record<ClientStage, { headline: string; subtext: string; ctaText: string; ctaHref: string }> = {
    new: {
      headline: `Your agency could be worth ${formattedGap} more`,
      subtext: 'Complete the full audit to unlock your transformation roadmap',
      ctaText: 'Start Full Audit',
      ctaHref: '/full-audit',
    },
    in_audit: {
      headline: `You're ${progressPercent}% through your audit`,
      subtext: `${auditProgress} of ${totalQuestions} questions complete`,
      ctaText: 'Continue Audit',
      ctaHref: '/full-audit',
    },
    docs_needed: {
      headline: 'Audit complete. Here\'s what we found.',
      subtext: 'Upload your documents so we can start building',
      ctaText: 'Upload Documents',
      ctaHref: '/assets',
    },
    ready: {
      headline: 'We\'re ready to transform your agency',
      subtext: 'All information received. Let\'s schedule your kickoff.',
      ctaText: 'Schedule Kickoff Call',
      ctaHref: '/schedule',
    },
    building: {
      headline: `Week ${session?.sprint_data?.week || 1} of 4: Building Your Systems`,
      subtext: `${session?.sprint_data?.systems?.length || 0} systems built, ${session?.sprint_data?.hoursReclaimed || 0} hours reclaimed`,
      ctaText: 'View Build Progress',
      ctaHref: '/progress',
    },
    complete: {
      headline: 'Transformation Complete',
      subtext: 'Here\'s what we built together',
      ctaText: 'Your Next Steps',
      ctaHref: '/next-steps',
    },
  }

  return heroContent[stage]
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount.toLocaleString()}`
}

/**
 * Get score color based on threshold
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#064e3b' // emerald
  if (score >= 60) return '#b59f3b' // gold
  if (score >= 40) return '#c77d3e' // orange
  return '#a85454' // red
}

/**
 * Get severity color for findings
 */
export function getSeverityColor(severity: 'critical' | 'warning' | 'info'): {
  text: string
  bg: string
  border: string
} {
  const colors = {
    critical: { text: '#a85454', bg: 'rgba(168, 84, 84, 0.1)', border: 'rgba(168, 84, 84, 0.2)' },
    warning: { text: '#c77d3e', bg: 'rgba(199, 125, 62, 0.1)', border: 'rgba(199, 125, 62, 0.2)' },
    info: { text: '#666', bg: 'rgba(102, 102, 102, 0.1)', border: 'rgba(102, 102, 102, 0.2)' },
  }
  return colors[severity]
}

/**
 * Journey stages for the pipeline tracker
 */
export const JOURNEY_STAGES = [
  { id: 'assessment', label: 'Assessment', description: 'Short questionnaire' },
  { id: 'full_audit', label: 'Full Audit', description: '74-question deep dive' },
  { id: 'documents', label: 'Documents', description: 'Upload your assets' },
  { id: 'kickoff', label: 'Kickoff', description: 'Schedule your call' },
  { id: 'building', label: 'Building', description: '4-week sprint' },
  { id: 'complete', label: 'Complete', description: 'Transformation done' },
]

/**
 * Map client stage to journey stage index
 */
export function getJourneyStageIndex(stage: ClientStage): number {
  const stageMap: Record<ClientStage, number> = {
    new: 0,
    in_audit: 1,
    docs_needed: 2,
    ready: 3,
    building: 4,
    complete: 5,
  }
  return stageMap[stage]
}
