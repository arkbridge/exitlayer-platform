'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
// TYPES
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
// MOCK DATA (simulates calculated ValuationResult)
// These values would come from the actual assessment
// ============================================
const mockResults = {
  // Lead info
  companyName: 'Acme Marketing Agency',
  ownerName: 'Sarah',

  // Valuation (calculated from revenue, margin, owner comp)
  annualRevenue: 820000,
  annualProfit: 205000,  // 25% margin
  ownerComp: 150000,
  sde: 355000,  // profit + owner comp
  currentMultiple: 1.9,
  potentialMultiple: 4.5,
  currentValuation: 674500,
  potentialValuation: 1597500,
  valuationGap: 923000,

  // Direct from questions
  ownerHoursPerWeek: 52,
  teamSize: 4,
  clientCount: 14,

  // New precision fields (direct from questions)
  ownerProjectInvolvement: 'Most (70-90%)',
  ownerSalesPct: 'I close all of them (100%)',
  approvalFrequency: 'Multiple times per day',
  revenueModel: 'Mostly project-based',
  topClientPct: '25-50%',
  documentedLevel: 'A few rough notes here and there',
  withoutYou: 'Major problems — clients would notice',
  hasProprietaryMethod: 'Sort of',

  // Qualification
  stage: 1 as const,
  stageLabel: 'Needs Internal Systems',
  ctaType: 'book-call' as const,
};

// ============================================
// DERIVE RISK FACTORS FROM ANSWERS
// ============================================
function deriveRiskFactors(data: typeof mockResults): RiskFactor[] {
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
  const dep = depMap[data.withoutYou];
  if (dep && dep.severity !== 'good') {
    factors.push({
      id: 'owner-dependency',
      name: 'Owner Dependency',
      severity: dep.severity,
      userAnswer: data.withoutYou,
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
  const delivery = deliveryMap[data.ownerProjectInvolvement];
  if (delivery && delivery.severity !== 'good') {
    factors.push({
      id: 'delivery-involvement',
      name: 'Delivery Involvement',
      severity: delivery.severity,
      userAnswer: data.ownerProjectInvolvement,
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
  const sales = salesMap[data.ownerSalesPct];
  if (sales && sales.severity !== 'good') {
    factors.push({
      id: 'sales-dependency',
      name: 'Sales Dependency',
      severity: sales.severity,
      userAnswer: data.ownerSalesPct,
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
  const doc = docMap[data.documentedLevel];
  if (doc && doc.severity !== 'good') {
    factors.push({
      id: 'documentation',
      name: 'Documentation',
      severity: doc.severity,
      userAnswer: data.documentedLevel,
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
  const conc = concMap[data.topClientPct];
  if (conc && conc.severity !== 'good') {
    factors.push({
      id: 'client-concentration',
      name: 'Client Concentration',
      severity: conc.severity,
      userAnswer: data.topClientPct,
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
  const rev = revMap[data.revenueModel];
  if (rev && rev.severity !== 'good') {
    factors.push({
      id: 'revenue-model',
      name: 'Revenue Model',
      severity: rev.severity,
      userAnswer: data.revenueModel,
      description: rev.description,
      impact: "No predictability. You're always hunting for the next deal.",
    });
  }

  return factors;
}

// ============================================
// DERIVE OWNERSHIP STATUS
// ============================================
function deriveOwnershipAssets(data: typeof mockResults): OwnershipAsset[] {
  const isHighDependency =
    data.withoutYou === 'Everything stops. The business IS me.' ||
    data.withoutYou === 'Major problems — clients would notice';

  const isLowDocumentation =
    data.documentedLevel === 'Nothing is documented' ||
    data.documentedLevel === 'A few rough notes here and there';

  const hasRecurring = data.revenueModel === 'Mostly retainers / recurring';
  const hasProprietary = data.hasProprietaryMethod === 'Yes';

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
      status: isLowDocumentation ? 'missing' : (data.documentedLevel === 'Fully documented with SOPs and templates' ? 'owned' : 'partial'),
      description: isLowDocumentation
        ? "Your knowledge is trapped in your head."
        : "Some processes captured, but not complete.",
    },
    {
      name: 'Recurring Revenue',
      status: hasRecurring ? 'owned' : (data.revenueModel === 'Mix of projects and retainers' ? 'partial' : 'missing'),
      description: hasRecurring
        ? "Predictable monthly revenue."
        : "You start from zero every month.",
    },
    {
      name: 'Proprietary Method',
      status: hasProprietary ? 'owned' : (data.hasProprietaryMethod === 'Sort of' ? 'partial' : 'missing'),
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
function StageCTA({ stage, ctaType, valuationGap, potentialValuation }: {
  stage: 0 | 1 | 2 | 3;
  ctaType: 'free-guide' | 'book-call' | 'darwin-group';
  valuationGap: number;
  potentialValuation: number;
}) {
  if (ctaType === 'free-guide') {
    return (
      <div className="text-center">
        <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-4 font-medium">You&apos;re Early</p>
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-4">
          You&apos;re not quite ready yet.
        </h2>
        <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
          At your current stage, focus on hitting $300K+ revenue and building a small team.
          We&apos;ve put together a guide to help you get there.
        </p>
        <a
          href="https://go.exitlayer.io/thes-x"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-900 rounded-full font-medium hover:bg-emerald-50 transition-all text-lg hover:scale-105 shadow-2xl shadow-emerald-900/20"
        >
          Get the Free Guide
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
          $<AnimatedNumber value={potentialValuation / 1000000} decimals={1} suffix="M" />
        </span>
      </h2>
      <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
        In 30 minutes, we&apos;ll map exactly which systems would unlock that{' '}
        <span className="text-white/70">${(valuationGap / 1000).toFixed(0)}K</span> you&apos;re leaving on the table.
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
// MAIN COMPONENT
// ============================================
export default function ResultsPreview() {
  const scrollRef = useScrollAnimation();
  const r = mockResults;

  const riskFactors = deriveRiskFactors(r);
  const ownershipAssets = deriveOwnershipAssets(r);
  const ownerHourlyValue = Math.round(r.annualRevenue / (r.ownerHoursPerWeek * 52));

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#f8f8f6]">
      {/* Nav */}
      <nav className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] py-6 relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-serif font-medium tracking-tight"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(167,243,208,0.8) 50%, rgba(110,231,183,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ExitLayer
          </Link>
          <span className="text-white/40 text-sm">Your Results</span>
        </div>
      </nav>

      {/* Preview Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <p className="text-amber-800 text-sm">
            <strong>Preview Mode:</strong> This shows simulated data. Complete the assessment for your real valuation.
          </p>
        </div>
      </div>

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
                $<AnimatedNumber value={r.currentValuation / 1000} decimals={0} suffix="K" />
              </span>
              {' '}today.
            </h1>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-emerald-400 mb-6 leading-tight">
              It could be worth{' '}
              <span className="text-emerald-300">
                $<AnimatedNumber value={r.potentialValuation / 1000000} decimals={1} suffix="M" />
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
                    {r.currentMultiple}x MULTIPLE
                  </span>
                </div>
                <div className="text-4xl font-serif font-medium text-white mb-2">
                  $<AnimatedNumber value={r.currentValuation / 1000} decimals={0} suffix="K" />
                </div>
                <p className="text-white/40 text-sm">Based on ${(r.sde / 1000).toFixed(0)}K SDE × {r.currentMultiple}x</p>
              </div>

              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-emerald-300/70 text-sm uppercase tracking-wide">Potential</span>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded">
                    {r.potentialMultiple}x MULTIPLE
                  </span>
                </div>
                <div className="text-4xl font-serif font-medium text-emerald-300 mb-2">
                  $<AnimatedNumber value={r.potentialValuation / 1000000} decimals={1} suffix="M" />
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
      {r.ownerHoursPerWeek > 40 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div
            className="scale-up bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-red-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />

            <div className="relative">
              <p className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-2">Your Time</p>
              <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-6">
                You&apos;re working{' '}
                <span className="text-red-600">{r.ownerHoursPerWeek} hours/week</span>
                {' '}at ${ownerHourlyValue}/hour.
              </h3>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/80 rounded-xl p-5 border border-red-100">
                  <div className="text-3xl font-serif font-bold text-[#1a1a1a] mb-1">{r.ownerHoursPerWeek}</div>
                  <div className="text-sm text-[#666]">hours/week you work</div>
                </div>
                <div className="bg-white/80 rounded-xl p-5 border border-red-100">
                  <div className="text-3xl font-serif font-bold text-[#1a1a1a] mb-1">${ownerHourlyValue}</div>
                  <div className="text-sm text-[#666]">your effective hourly rate</div>
                </div>
                <div className="bg-white/80 rounded-xl p-5 border border-red-100">
                  <div className="text-3xl font-serif font-bold text-red-600 mb-1">{r.ownerHoursPerWeek - 20}</div>
                  <div className="text-sm text-[#666]">hours above a strategic role</div>
                </div>
              </div>

              <p className="text-[#666] text-lg">
                A CEO working 20 hours/week on strategy is building equity.
                A CEO working {r.ownerHoursPerWeek} hours/week in delivery is just trading time for money.
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
              stage={r.stage}
              ctaType={r.ctaType}
              valuationGap={r.valuationGap}
              potentialValuation={r.potentialValuation}
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
              <Link href="/questionnaire" className="hover:text-white/60 transition-colors">
                Take Assessment
              </Link>
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
