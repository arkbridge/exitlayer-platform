'use client'

import Link from 'next/link'
import { type ClientStage, type AuditSession, formatCurrency } from '@/lib/stage-utils'

interface DashboardHeaderProps {
  userName?: string
  companyName?: string
  stage: ClientStage
  session: AuditSession | null
}

function getHeroContent(stage: ClientStage, session: AuditSession | null): {
  headline: string
  subtext: string
  ctaText: string
  ctaHref: string
  showMetric?: boolean
  metricLabel?: string
  metricValue?: string
} {
  const valueGap = session?.score_data?.financialMetrics?.valueGap || 0
  const formattedGap = formatCurrency(valueGap)
  const auditProgress = session?.full_audit_current_question || 0
  const totalQuestions = 74
  const progressPercent = Math.round((auditProgress / totalQuestions) * 100)

  switch (stage) {
    case 'new':
      return {
        headline: `Your agency could be worth ${formattedGap} more`,
        subtext: 'Complete the full audit to unlock your transformation roadmap',
        ctaText: 'Start Full Audit',
        ctaHref: '/full-audit',
        showMetric: true,
        metricLabel: 'Value Gap',
        metricValue: formattedGap,
      }
    case 'in_audit':
      return {
        headline: `You're ${progressPercent}% through your audit`,
        subtext: `${auditProgress} of ${totalQuestions} questions complete`,
        ctaText: 'Continue Audit',
        ctaHref: '/full-audit',
        showMetric: true,
        metricLabel: 'Progress',
        metricValue: `${progressPercent}%`,
      }
    case 'docs_needed':
      return {
        headline: "Audit complete. Here's what we found.",
        subtext: 'Upload your documents so we can start building',
        ctaText: 'Upload Documents',
        ctaHref: '/assets',
      }
    case 'ready':
      return {
        headline: "We're ready to transform your agency",
        subtext: "All information received. Let's schedule your kickoff.",
        ctaText: 'Schedule Kickoff Call',
        ctaHref: '/schedule',
      }
    case 'building':
      return {
        headline: `Week ${session?.sprint_data?.week || 1} of 4: Building Your Systems`,
        subtext: `${session?.sprint_data?.systems?.length || 0} systems built, ${session?.sprint_data?.hoursReclaimed || 0} hours reclaimed`,
        ctaText: 'View Build Progress',
        ctaHref: '/progress',
        showMetric: true,
        metricLabel: 'Hours Reclaimed',
        metricValue: `${session?.sprint_data?.hoursReclaimed || 0}`,
      }
    case 'complete':
      return {
        headline: 'Transformation Complete',
        subtext: "Here's what we built together",
        ctaText: 'Your Next Steps',
        ctaHref: '/next-steps',
      }
    default:
      return {
        headline: 'Welcome to your dashboard',
        subtext: 'Track your transformation journey',
        ctaText: 'Get Started',
        ctaHref: '/questionnaire',
      }
  }
}

export default function DashboardHeader({ userName, companyName, stage, session }: DashboardHeaderProps) {
  const displayName = userName || 'there'
  const hero = getHeroContent(stage, session)

  return (
    <div className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] relative overflow-hidden rounded-2xl mb-8">
      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 px-8 py-10">
        {/* Company name / greeting */}
        <p className="text-emerald-400/60 text-sm mb-2 uppercase tracking-wider font-medium">
          {companyName || `Welcome back, ${displayName}`}
        </p>

        {/* Stage-specific headline */}
        <h1
          className="text-3xl md:text-4xl font-serif font-medium tracking-tight max-w-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(167,243,208,0.85) 80%, rgba(110,231,183,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {hero.headline}
        </h1>

        {/* Subtext */}
        <p className="text-white/50 mt-3 max-w-xl">
          {hero.subtext}
        </p>

        {/* CTA and optional metric */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href={hero.ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-950 font-medium rounded-full hover:bg-emerald-50 hover:scale-105 transition-all"
          >
            {hero.ctaText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {hero.showMetric && hero.metricValue && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <span className="text-emerald-400/80 text-sm">{hero.metricLabel}</span>
              <span className="text-white font-serif font-medium">{hero.metricValue}</span>
            </div>
          )}
        </div>

        {/* Progress bar for in_audit stage */}
        {stage === 'in_audit' && (
          <div className="mt-6 max-w-md">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.round(((session?.full_audit_current_question || 0) / 74) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Week progress for building stage */}
        {stage === 'building' && session?.sprint_data && (
          <div className="mt-6 flex items-center gap-2">
            {[1, 2, 3, 4].map((week) => (
              <div
                key={week}
                className={`w-12 h-2 rounded-full transition-all ${
                  week <= (session.sprint_data?.week || 1)
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
