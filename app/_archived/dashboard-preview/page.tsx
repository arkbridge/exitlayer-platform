'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ValueSummaryRow from '@/components/dashboard/ValueSummaryRow'
import InsightsPair from '@/components/dashboard/InsightsPair'
import DimensionScores from '@/components/dashboard/DimensionScores'
import CriticalFindings from '@/components/dashboard/CriticalFindings'
import QuickWins from '@/components/dashboard/QuickWins'
import AuditProgress from '@/components/dashboard/AuditProgress'
import DocumentUpload from '@/components/dashboard/DocumentUpload'
import SprintProgress from '@/components/dashboard/SprintProgress'
import BeforeAfter from '@/components/dashboard/BeforeAfter'
import JourneyProgress from '@/components/dashboard/JourneyProgress'
import { type ClientStage, type AuditSession } from '@/lib/stage-utils'

// Simulated data for preview
const MOCK_SESSIONS: Record<ClientStage, AuditSession> = {
  new: {
    id: 'mock-1',
    user_id: 'user-1',
    full_name: 'Michael Davidson',
    company_name: 'Acme Agency',
    email: 'michael@acme.com',
    score_data: {
      overall: 58,
      dimensions: {
        leverage: 42,
        equityPotential: 65,
        revenueRisk: 55,
        productReadiness: 48,
        implementationCapacity: 72,
      },
      financialMetrics: {
        currentExitValue: 850000,
        targetExitValue: 2500000,
        valueGap: 1650000,
        currentExitMultiple: 2.1,
        ownerHourlyValue: 350,
        monthlyRevenue: 85000,
      },
    },
    form_data: { wasted_hours_week: 15 },
    full_audit_status: 'not_started',
    full_audit_current_question: 0,
    client_stage: 'new',
    created_at: '2025-02-01T10:00:00Z',
  },
  in_audit: {
    id: 'mock-2',
    user_id: 'user-1',
    full_name: 'Michael Davidson',
    company_name: 'Acme Agency',
    email: 'michael@acme.com',
    score_data: {
      overall: 58,
      dimensions: {
        leverage: 42,
        equityPotential: 65,
        revenueRisk: 55,
        productReadiness: 48,
        implementationCapacity: 72,
      },
      financialMetrics: {
        currentExitValue: 850000,
        targetExitValue: 2500000,
        valueGap: 1650000,
        currentExitMultiple: 2.1,
        ownerHourlyValue: 350,
        monthlyRevenue: 85000,
      },
    },
    form_data: { wasted_hours_week: 15 },
    full_audit_status: 'in_progress',
    full_audit_current_question: 32,
    full_audit_started_at: '2025-02-05T14:30:00Z',
    client_stage: 'in_audit',
    created_at: '2025-02-01T10:00:00Z',
  },
  docs_needed: {
    id: 'mock-3',
    user_id: 'user-1',
    full_name: 'Michael Davidson',
    company_name: 'Acme Agency',
    email: 'michael@acme.com',
    score_data: {
      overall: 58,
      dimensions: {
        leverage: 42,
        equityPotential: 65,
        revenueRisk: 55,
        productReadiness: 48,
        implementationCapacity: 72,
      },
      financialMetrics: {
        currentExitValue: 850000,
        targetExitValue: 2500000,
        valueGap: 1650000,
        currentExitMultiple: 2.1,
        ownerHourlyValue: 350,
        monthlyRevenue: 85000,
      },
      primaryConstraint: {
        dimension: 'Leverage',
        score: 42,
        description: 'Your business depends too heavily on you personally',
      },
      highestOpportunity: {
        dimension: 'Implementation Capacity',
        score: 72,
        description: 'Strong team capability - can execute',
      },
      criticalFindings: [
        {
          id: '1',
          severity: 'critical' as const,
          title: 'High Owner Dependency',
          description: 'Too many critical processes require your direct involvement',
          impact: 'Limits scalability and reduces exit value by up to 40%',
        },
        {
          id: '2',
          severity: 'warning' as const,
          title: 'Revenue Concentration Risk',
          description: 'Top 3 clients represent 65% of revenue',
          impact: 'Single client loss could significantly impact business',
        },
        {
          id: '3',
          severity: 'warning' as const,
          title: 'Services Not Productized',
          description: 'Custom work for each client limits efficiency',
          impact: 'Higher costs and longer delivery times',
        },
      ],
      quickWins: [
        {
          id: '1',
          title: 'Document your top 3 recurring tasks',
          description: 'Create simple SOPs for tasks you do weekly',
          timeEstimate: '2 hours',
          impact: 'high' as const,
        },
        {
          id: '2',
          title: 'Identify one task to delegate this week',
          description: 'Pick something you do regularly that someone else could handle',
          timeEstimate: '30 min',
          impact: 'high' as const,
        },
        {
          id: '3',
          title: 'Package one service offering',
          description: 'Turn a custom service into a fixed-scope package',
          timeEstimate: '1 hour',
          impact: 'medium' as const,
        },
        {
          id: '4',
          title: 'Create a client onboarding checklist',
          description: 'Standardize your new client process',
          timeEstimate: '45 min',
          impact: 'medium' as const,
        },
        {
          id: '5',
          title: 'Set up one automated email response',
          description: 'Automate a common inquiry or follow-up',
          timeEstimate: '20 min',
          impact: 'low' as const,
        },
      ],
    },
    form_data: { wasted_hours_week: 15 },
    full_audit_status: 'completed',
    full_audit_current_question: 74,
    full_audit_started_at: '2025-02-05T14:30:00Z',
    full_audit_completed_at: '2025-02-07T16:45:00Z',
    documents_uploaded: ['service_offerings'],
    client_stage: 'docs_needed',
    created_at: '2025-02-01T10:00:00Z',
  },
  ready: {
    id: 'mock-4',
    user_id: 'user-1',
    full_name: 'Michael Davidson',
    company_name: 'Acme Agency',
    email: 'michael@acme.com',
    score_data: {
      overall: 58,
      dimensions: {
        leverage: 42,
        equityPotential: 65,
        revenueRisk: 55,
        productReadiness: 48,
        implementationCapacity: 72,
      },
      financialMetrics: {
        currentExitValue: 850000,
        targetExitValue: 2500000,
        valueGap: 1650000,
        currentExitMultiple: 2.1,
        ownerHourlyValue: 350,
        monthlyRevenue: 85000,
      },
      primaryConstraint: {
        dimension: 'Leverage',
        score: 42,
        description: 'Your business depends too heavily on you personally',
      },
      highestOpportunity: {
        dimension: 'Implementation Capacity',
        score: 72,
        description: 'Strong team capability - can execute',
      },
      criticalFindings: [
        {
          id: '1',
          severity: 'critical' as const,
          title: 'High Owner Dependency',
          description: 'Too many critical processes require your direct involvement',
          impact: 'Limits scalability and reduces exit value by up to 40%',
        },
        {
          id: '2',
          severity: 'warning' as const,
          title: 'Revenue Concentration Risk',
          description: 'Top 3 clients represent 65% of revenue',
          impact: 'Single client loss could significantly impact business',
        },
      ],
      quickWins: [
        {
          id: '1',
          title: 'Document your top 3 recurring tasks',
          description: 'Create simple SOPs for tasks you do weekly',
          timeEstimate: '2 hours',
          impact: 'high' as const,
        },
        {
          id: '2',
          title: 'Identify one task to delegate this week',
          description: 'Pick something you do regularly that someone else could handle',
          timeEstimate: '30 min',
          impact: 'high' as const,
        },
      ],
    },
    form_data: { wasted_hours_week: 15 },
    full_audit_status: 'completed',
    full_audit_current_question: 74,
    full_audit_started_at: '2025-02-05T14:30:00Z',
    full_audit_completed_at: '2025-02-07T16:45:00Z',
    documents_uploaded: ['service_offerings', 'sample_deliverable', 'team_structure', 'current_sops'],
    client_stage: 'ready',
    created_at: '2025-02-01T10:00:00Z',
  },
  building: {
    id: 'mock-5',
    user_id: 'user-1',
    full_name: 'Michael Davidson',
    company_name: 'Acme Agency',
    email: 'michael@acme.com',
    score_data: {
      overall: 58,
      dimensions: {
        leverage: 42,
        equityPotential: 65,
        revenueRisk: 55,
        productReadiness: 48,
        implementationCapacity: 72,
      },
      financialMetrics: {
        currentExitValue: 850000,
        targetExitValue: 2500000,
        valueGap: 1650000,
        currentExitMultiple: 2.1,
        ownerHourlyValue: 350,
        monthlyRevenue: 85000,
      },
      primaryConstraint: {
        dimension: 'Leverage',
        score: 42,
        description: 'Your business depends too heavily on you personally',
      },
      highestOpportunity: {
        dimension: 'Implementation Capacity',
        score: 72,
        description: 'Strong team capability - can execute',
      },
      criticalFindings: [
        {
          id: '1',
          severity: 'critical' as const,
          title: 'High Owner Dependency',
          description: 'Too many critical processes require your direct involvement',
          impact: 'Limits scalability and reduces exit value by up to 40%',
        },
      ],
      quickWins: [
        {
          id: '1',
          title: 'Document your top 3 recurring tasks',
          description: 'Create simple SOPs for tasks you do weekly',
          timeEstimate: '2 hours',
          impact: 'high' as const,
          completed: true,
        },
        {
          id: '2',
          title: 'Identify one task to delegate this week',
          description: 'Pick something you do regularly that someone else could handle',
          timeEstimate: '30 min',
          impact: 'high' as const,
          completed: true,
        },
      ],
    },
    form_data: { wasted_hours_week: 15 },
    full_audit_status: 'completed',
    full_audit_current_question: 74,
    full_audit_started_at: '2025-02-05T14:30:00Z',
    full_audit_completed_at: '2025-02-07T16:45:00Z',
    documents_uploaded: ['service_offerings', 'sample_deliverable', 'team_structure', 'current_sops'],
    sprint_data: {
      week: 2,
      systems: ['Client Onboarding', 'Project Kickoff', 'Weekly Reporting', 'Invoice Generation'],
      hoursReclaimed: 12,
      milestones: [
        { name: 'Foundation & Discovery', completed: true, completedAt: '2025-02-10T17:00:00Z' },
        { name: 'Core Systems Build', completed: false },
        { name: 'Integration & Testing', completed: false },
        { name: 'Handoff & Training', completed: false },
      ],
      status: 'active' as const,
    },
    client_stage: 'building',
    created_at: '2025-02-01T10:00:00Z',
  },
  complete: {
    id: 'mock-6',
    user_id: 'user-1',
    full_name: 'Michael Davidson',
    company_name: 'Acme Agency',
    email: 'michael@acme.com',
    score_data: {
      overall: 58,
      dimensions: {
        leverage: 42,
        equityPotential: 65,
        revenueRisk: 55,
        productReadiness: 48,
        implementationCapacity: 72,
      },
      financialMetrics: {
        currentExitValue: 850000,
        targetExitValue: 2500000,
        valueGap: 1650000,
        currentExitMultiple: 2.1,
        ownerHourlyValue: 350,
        monthlyRevenue: 85000,
      },
      primaryConstraint: {
        dimension: 'Leverage',
        score: 42,
        description: 'Your business depends too heavily on you personally',
      },
      highestOpportunity: {
        dimension: 'Implementation Capacity',
        score: 72,
        description: 'Strong team capability - can execute',
      },
    },
    form_data: { wasted_hours_week: 15 },
    full_audit_status: 'completed',
    full_audit_current_question: 74,
    full_audit_started_at: '2025-02-05T14:30:00Z',
    full_audit_completed_at: '2025-02-07T16:45:00Z',
    documents_uploaded: ['service_offerings', 'sample_deliverable', 'team_structure', 'current_sops'],
    sprint_data: {
      week: 4,
      systems: [
        'Client Onboarding',
        'Project Kickoff',
        'Weekly Reporting',
        'Invoice Generation',
        'Lead Qualification',
        'Proposal Generator',
        'Team Dashboard',
        'Client Portal',
      ],
      hoursReclaimed: 22,
      milestones: [
        { name: 'Foundation & Discovery', completed: true, completedAt: '2025-02-10T17:00:00Z' },
        { name: 'Core Systems Build', completed: true, completedAt: '2025-02-17T17:00:00Z' },
        { name: 'Integration & Testing', completed: true, completedAt: '2025-02-24T17:00:00Z' },
        { name: 'Handoff & Training', completed: true, completedAt: '2025-03-03T17:00:00Z' },
      ],
      status: 'complete' as const,
    },
    client_stage: 'complete',
    created_at: '2025-02-01T10:00:00Z',
  },
}

const STAGES: ClientStage[] = ['new', 'in_audit', 'docs_needed', 'ready', 'building', 'complete']

export default function DashboardPreviewNew() {
  const [selectedStage, setSelectedStage] = useState<ClientStage>('docs_needed')
  const session = MOCK_SESSIONS[selectedStage]
  const scoreData = session.score_data || {}
  const dimensions = scoreData.dimensions || {}
  const financials = scoreData.financialMetrics || {}

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Stage Selector */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-medium text-[#666] whitespace-nowrap">Preview Stage:</span>
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedStage === stage
                    ? 'bg-emerald-900 text-white'
                    : 'bg-[#f8f8f6] text-[#666] hover:bg-[#e5e5e5]'
                }`}
              >
                {stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stage-Aware Header */}
        <DashboardHeader
          userName={session.full_name?.split(' ')[0]}
          companyName={session.company_name}
          stage={selectedStage}
          session={session}
        />

        {/* Value Summary Row */}
        <div className="mb-8">
          <ValueSummaryRow
            currentValue={financials.currentExitValue || 0}
            potentialValue={financials.targetExitValue || 0}
            valueGap={financials.valueGap || 0}
            currentMultiple={financials.currentExitMultiple || 2}
          />
        </div>

        {/* Insights Pair */}
        <div className="mb-8">
          <InsightsPair
            primaryConstraint={scoreData.primaryConstraint || null}
            highestOpportunity={scoreData.highestOpportunity || null}
          />
        </div>

        {/* Dimension Scores */}
        <div className="mb-8">
          <DimensionScores dimensions={dimensions} />
        </div>

        {/* Stage-Specific Action Section */}
        {(selectedStage === 'new' || selectedStage === 'in_audit') && (
          <div className="mb-8">
            <AuditProgress
              currentQuestion={session.full_audit_current_question || 0}
              totalQuestions={74}
              status={session.full_audit_status || 'not_started'}
            />
          </div>
        )}

        {selectedStage === 'docs_needed' && (
          <div className="mb-8">
            <DocumentUpload uploadedDocuments={session.documents_uploaded || []} />
          </div>
        )}

        {selectedStage === 'ready' && (
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-900/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">All Set!</h3>
                  <p className="text-[#666] text-sm">We have everything we need. Let's schedule your kickoff call.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors">
                  Schedule Kickoff
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 'building' && session.sprint_data && (
          <div className="mb-8">
            <SprintProgress
              week={session.sprint_data.week}
              systems={session.sprint_data.systems}
              hoursReclaimed={session.sprint_data.hoursReclaimed}
              milestones={session.sprint_data.milestones}
            />
          </div>
        )}

        {selectedStage === 'complete' && (
          <div className="mb-8">
            <BeforeAfter
              before={{
                exitMultiple: financials.currentExitMultiple || 2,
                weeklyHoursSaved: 0,
                systemsAutomated: 0,
                revenueRiskScore: dimensions.revenueRisk || 40,
              }}
              after={{
                exitMultiple: 5,
                weeklyHoursSaved: session.sprint_data?.hoursReclaimed || 22,
                systemsAutomated: session.sprint_data?.systems?.length || 8,
                revenueRiskScore: Math.min(85, (dimensions.revenueRisk || 40) + 30),
              }}
            />
          </div>
        )}

        {/* Critical Findings - Show after audit complete */}
        {(selectedStage === 'docs_needed' || selectedStage === 'ready' || selectedStage === 'building' || selectedStage === 'complete') && scoreData.criticalFindings && (
          <div className="mb-8">
            <CriticalFindings findings={scoreData.criticalFindings} />
          </div>
        )}

        {/* Quick Wins - Show after audit complete */}
        {(selectedStage === 'docs_needed' || selectedStage === 'ready' || selectedStage === 'building' || selectedStage === 'complete') && scoreData.quickWins && (
          <div className="mb-8">
            <QuickWins quickWins={scoreData.quickWins} />
          </div>
        )}

        {/* Journey Progress - Always visible */}
        <div className="mb-8">
          <JourneyProgress
            currentStage={selectedStage}
            stageCompletedDates={{
              assessment: session.created_at,
              full_audit: session.full_audit_completed_at,
            }}
          />
        </div>

        {/* Contact CTA */}
        {(selectedStage === 'new' || selectedStage === 'in_audit' || selectedStage === 'docs_needed') && (
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-2">Have Questions?</h3>
                <p className="text-[#666] text-sm">
                  Book a quick call to discuss your assessment results and next steps.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors flex-shrink-0">
                Contact Us
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
