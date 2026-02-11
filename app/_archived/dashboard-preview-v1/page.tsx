import Link from 'next/link'

// ─── Design tokens ───
const colors = {
  thesisGreen: '#064e3b',
  darkGreen: '#022c22',
  primary: '#1a1a1a',
  secondary: '#666',
  muted: '#999',
  border: '#e5e5e5',
  pageBg: '#f8f8f6',
  cardBg: '#ffffff',
  warningOrange: '#c77d3e',
  dangerRed: '#a85454',
  gold: '#b59f3b',
}

// ─── SVG Score Ring ───
function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f0f0f0" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colors.warningOrange}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-serif font-medium text-[#1a1a1a]">{score}</span>
        <span className="text-[#ccc] text-xs mt-0.5">of 100</span>
      </div>
    </div>
  )
}

// ─── Mini Donut ───
function MiniDonut({ value, size = 80, color = colors.dangerRed, label }: { value: number; size?: number; color?: string; label: string }) {
  const sw = 7
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f0f0f0" strokeWidth={sw} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-medium" style={{ color }}>{value}%</span>
        <span className="text-[8px] text-[#999] mt-0.5">{label}</span>
      </div>
    </div>
  )
}

// ─── Horizontal Bar ───
function HBar({ label, value, max = 100, color, suffix = '' }: { label: string; value: number; max?: number; color: string; suffix?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#666] w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium w-12 text-right" style={{ color }}>{value}{suffix}</span>
    </div>
  )
}

// ─── Section Divider ───
function SectionDivider({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="py-14 md:py-18 text-center">
      <div className="w-10 h-px bg-[#ddd] mx-auto mb-6" />
      <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-2">{title}</h2>
      <p className="text-[#999] max-w-md mx-auto text-sm">{subtitle}</p>
    </div>
  )
}

// ─── Mock Data ───
const data = {
  company: 'Meridian Digital',
  contact: 'Sarah Chen',
  initials: 'SC',
  score: 44,
  revenue: '$1.2M',
  revenueNum: 1200000,
  team: 8,
  clients: 12,

  dimensions: [
    { label: 'Leverage', score: 32, color: colors.dangerRed },
    { label: 'Equity Potential', score: 38, color: colors.dangerRed },
    { label: 'Revenue Risk', score: 58, color: colors.warningOrange },
    { label: 'Product Readiness', score: 52, color: colors.warningOrange },
    { label: 'Impl. Capacity', score: 48, color: colors.warningOrange },
  ],

  timeAllocation: [
    { label: 'Client delivery', hours: 25, color: colors.dangerRed },
    { label: 'Sales & BD', hours: 10, color: colors.warningOrange },
    { label: 'Team management', hours: 8, color: colors.gold },
    { label: 'Operations', hours: 5, color: '#999' },
    { label: 'Strategy', hours: 2, color: colors.thesisGreen },
  ],

  clientRevenue: [
    { name: 'Client A', pct: 22 },
    { name: 'Client B', pct: 18 },
    { name: 'Client C', pct: 15 },
    { name: 'Client D', pct: 11 },
    { name: 'Client E', pct: 9 },
    { name: 'Client F', pct: 7 },
    { name: 'Others', pct: 18 },
  ],

  docCoverage: [
    { area: 'Sales process', pct: 45 },
    { area: 'Client onboarding', pct: 30 },
    { area: 'Delivery workflows', pct: 20 },
    { area: 'Quality standards', pct: 15 },
    { area: 'Pricing logic', pct: 10 },
    { area: 'Hiring & training', pct: 5 },
  ],

  scaleCurve: [
    { clients: 8, hours: 40 },
    { clients: 10, hours: 47 },
    { clients: 12, hours: 55 },
    { clients: 14, hours: 64 },
    { clients: 16, hours: 73 },
    { clients: 18, hours: 85 },
    { clients: 20, hours: 98 },
  ],
}

const totalHours = data.timeAllocation.reduce((s, t) => s + t.hours, 0)

// ─── Page ───
export default function DiagnosticResults() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">

      {/* ━━━ NAV ━━━ */}
      <nav className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#666] hidden sm:inline">{data.contact}</span>
            <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-white text-sm font-medium">
              {data.initials}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">

        {/* ━━━ HERO ━━━ */}
        <div className="pt-10 md:pt-14 pb-2">
          {/* Report header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] text-[#999] uppercase tracking-widest mb-1">Diagnostic Report</p>
              <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a]">{data.company}</h1>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-[#999]">January 28, 2026</p>
              <p className="text-[11px] text-[#999]">#EL-2026-0044</p>
            </div>
          </div>

          {/* Score + dimensions row */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score */}
              <div className="flex flex-col items-center gap-3">
                <ScoreRing score={data.score} size={160} />
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.warningOrange }}>
                    Critical
                  </p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-[#1a1a1a]">Dimension Scores</p>
                  <p className="text-[10px] text-[#999]">Higher is better</p>
                </div>
                <div className="space-y-3">
                  {data.dimensions.map((dim) => (
                    <div key={dim.label} className="flex items-center gap-3">
                      <span className="text-xs text-[#666] w-28 flex-shrink-0">{dim.label}</span>
                      <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
                      </div>
                      <span className="text-xs font-medium w-8 text-right" style={{ color: dim.color }}>{dim.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key metrics row */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#f0f0f0]">
              <div className="text-center">
                <p className="text-xl font-serif font-medium text-[#1a1a1a]">{data.revenue}</p>
                <p className="text-[10px] text-[#999] uppercase tracking-wider mt-1">Annual Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-serif font-medium text-[#1a1a1a]">{data.team} people</p>
                <p className="text-[10px] text-[#999] uppercase tracking-wider mt-1">Team Size</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-serif font-medium text-[#1a1a1a]">{data.clients} active</p>
                <p className="text-[10px] text-[#999] uppercase tracking-wider mt-1">Client Base</p>
              </div>
            </div>
          </div>

          <p className="text-center text-[#bbb] text-sm mt-5 italic">
            What follows is not a plan. It&apos;s a diagnosis.
          </p>
        </div>

        {/* ━━━ FIRST ORDER ━━━ */}
        <SectionDivider title="What This Costs You Today" subtitle="The things you feel every single day." />

        {/* ━━━ 1. THE MONDAY MORNING ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">The Monday Morning</h3>
            <span className="text-xs text-[#999]">Time Allocation</span>
          </div>
          <p className="text-sm text-[#999] mb-6">Where your 50-hour week actually goes.</p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Stacked bar chart */}
            <div className="flex-1">
              <div className="h-10 rounded-lg overflow-hidden flex mb-4">
                {data.timeAllocation.map((t) => (
                  <div
                    key={t.label}
                    className="h-full relative group"
                    style={{ width: `${(t.hours / totalHours) * 100}%`, backgroundColor: t.color }}
                    title={`${t.label}: ${t.hours}h`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {data.timeAllocation.map((t) => (
                  <div key={t.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="text-xs text-[#666] flex-1">{t.label}</span>
                    <span className="text-xs font-medium text-[#1a1a1a]">{t.hours}h</span>
                    <span className="text-xs text-[#999] w-8 text-right">{Math.round((t.hours / totalHours) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Callouts */}
            <div className="md:w-64 space-y-3">
              <div className="bg-[#fdf6f3] rounded-lg p-4 border border-[#f0e0d6]">
                <p className="text-2xl font-serif font-medium text-[#a85454]">48%</p>
                <p className="text-xs text-[#a85454] mt-1">of your time is doing the work</p>
              </div>
              <div className="bg-[#f8f8f6] rounded-lg p-4 border border-[#e5e5e5]">
                <p className="text-2xl font-serif font-medium text-emerald-800">4%</p>
                <p className="text-xs text-[#666] mt-1">of your time is on strategy</p>
              </div>
              <p className="text-xs text-[#999] italic pt-1">
                For every 1 hour on strategy, you spend 12.5 hours in delivery.
              </p>
            </div>
          </div>
        </div>

        {/* ━━━ 2. MOST EXPENSIVE EMPLOYEE ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">The Most Expensive Employee</h3>
            <span className="text-xs text-[#999]">Opportunity Cost</span>
          </div>
          <p className="text-sm text-[#999] mb-6">You&apos;re paying yourself $231/hr to do $40/hr work.</p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Visual comparison */}
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#666]">Your hourly value</span>
                    <span className="text-sm font-medium text-[#1a1a1a]">$231/hr</span>
                  </div>
                  <div className="h-8 bg-[#f0f0f0] rounded-lg overflow-hidden">
                    <div className="h-full bg-[#a85454] rounded-lg" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#666]">Task market rate</span>
                    <span className="text-sm font-medium text-[#999]">$40/hr</span>
                  </div>
                  <div className="h-8 bg-[#f0f0f0] rounded-lg overflow-hidden">
                    <div className="h-full bg-[#ccc] rounded-lg" style={{ width: '17%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-[#999]">
                <div className="flex-1 h-px bg-[#e5e5e5]" />
                <span>15 hours/week at $191/hr overpay</span>
                <div className="flex-1 h-px bg-[#e5e5e5]" />
              </div>
            </div>

            {/* The math */}
            <div className="md:w-56">
              <div className="bg-[#fdf6f3] rounded-lg p-5 border border-[#f0e0d6]">
                <p className="text-3xl font-serif font-medium text-[#a85454]">$180K</p>
                <p className="text-xs text-[#a85454] mt-1 mb-4">destroyed per year</p>
                <div className="space-y-2 text-xs text-[#999]">
                  <div className="flex justify-between">
                    <span>Rate gap</span>
                    <span className="text-[#666]">$191/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours/week</span>
                    <span className="text-[#666]">15h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weeks/year</span>
                    <span className="text-[#666]">52</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#f0e0d6]">
                    <span className="font-medium text-[#a85454]">Annual loss</span>
                    <span className="font-medium text-[#a85454]">$180,180</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ 3. CLIENT YOU CAN'T TAKE ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">The Client You Can&apos;t Take</h3>
            <span className="text-xs text-[#999]">Capacity</span>
          </div>
          <p className="text-sm text-[#999] mb-6">A $12K/month client wants to start next week. You have to say no.</p>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Capacity donut */}
            <div className="flex items-center gap-6">
              <MiniDonut value={75} size={100} color={colors.dangerRed} label="used" />
              <div>
                <p className="text-sm text-[#666] mb-1">Owner involvement</p>
                <p className="text-3xl font-serif font-medium text-[#a85454]">75%</p>
                <p className="text-xs text-[#999] mt-1">of projects require you</p>
              </div>
            </div>

            {/* Impact */}
            <div className="flex-1">
              <div className="bg-[#f8f8f6] rounded-lg p-5">
                <p className="text-xs text-[#999] uppercase tracking-wider mb-3">If you add 1 more client</p>
                <div className="space-y-2">
                  {[
                    { label: 'Weekly hours', from: '55h', to: '59h', bad: true },
                    { label: 'Available capacity', from: '5h', to: '1h', bad: true },
                    { label: 'Quality risk', from: 'Moderate', to: 'High', bad: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-[#666]">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#999]">{row.from}</span>
                        <span className="text-[#ccc]">&rarr;</span>
                        <span className={row.bad ? 'text-[#a85454] font-medium' : 'text-[#666]'}>{row.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#999] mt-3 italic">
                Revenue is knocking. You&apos;re turning it away. The bottleneck isn&apos;t capacity &mdash; it&apos;s architecture.
              </p>
            </div>
          </div>
        </div>

        {/* ━━━ 4. THE TWO-WEEK TEST ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">The Two-Week Test</h3>
            <span className="text-xs text-[#999]">Dependency</span>
          </div>
          <p className="text-sm text-[#999] mb-6">If you disappeared for 2 weeks, here&apos;s what happens.</p>

          {/* Project grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs border"
                style={{
                  backgroundColor: i < 9 ? '#fdf6f3' : '#f0f7f0',
                  borderColor: i < 9 ? '#f0e0d6' : '#d4e8d4',
                }}
              >
                <span className="text-[10px] text-[#999]">P{i + 1}</span>
                <span style={{ color: i < 9 ? colors.dangerRed : colors.thesisGreen }} className="font-medium text-[10px] mt-0.5">
                  {i < 9 ? 'STALLS' : 'OK'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-[#fdf6f3] rounded-lg p-4 border border-[#f0e0d6]">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-serif font-medium text-[#a85454]">9</span>
                <div>
                  <p className="text-xs text-[#a85454] font-medium">of 12 projects stall</p>
                  <p className="text-[11px] text-[#999]">~$50K revenue at immediate risk</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-[#f8f8f6] rounded-lg p-4 border border-[#e5e5e5]">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-serif font-medium text-[#1a1a1a]">Day 3</span>
                <div>
                  <p className="text-xs text-[#666] font-medium">Client confidence erodes</p>
                  <p className="text-[11px] text-[#999]">40+ messages go unanswered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ 5. THE BLIND TEAM ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">The Blind Team</h3>
            <span className="text-xs text-[#999]">Documentation</span>
          </div>
          <p className="text-sm text-[#999] mb-6">What percentage of your business exists outside your head?</p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Documentation bars */}
            <div className="flex-1 space-y-3">
              {data.docCoverage.map((doc) => (
                <HBar key={doc.area} label={doc.area} value={doc.pct} color={doc.pct > 30 ? colors.warningOrange : colors.dangerRed} suffix="%" />
              ))}
            </div>

            {/* Summary */}
            <div className="md:w-56">
              <div className="bg-[#fdf6f3] rounded-lg p-5 border border-[#f0e0d6]">
                <MiniDonut value={25} size={72} color={colors.dangerRed} label="captured" />
                <p className="text-sm text-[#a85454] font-medium mt-3 text-center">75% is trapped in your head</p>
                <p className="text-[11px] text-[#999] mt-2 text-center">
                  Your team asks you questions because the answers don&apos;t exist anywhere else.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ SECOND ORDER ━━━ */}
        <SectionDivider title="What This Is Really Costing You" subtitle="The consequences you can't see from inside the business." />

        {/* ━━━ 6. REVENUE FRAGILITY ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Revenue Fragility</h3>
            <span className="text-xs text-[#999]">Concentration Risk</span>
          </div>
          <p className="text-sm text-[#999] mb-6">One phone call could wipe out 22% of your revenue.</p>

          {/* Revenue waterfall */}
          <div className="flex items-end gap-1.5 h-40 mb-4">
            {data.clientRevenue.map((client, i) => (
              <div key={client.name} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] font-medium mb-1" style={{ color: i < 3 ? colors.dangerRed : '#999' }}>
                  {client.pct}%
                </span>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(client.pct / 22) * 100}%`,
                    backgroundColor: i < 3 ? colors.dangerRed : '#e5e5e5',
                    opacity: i < 3 ? 1 - i * 0.15 : 0.6,
                  }}
                />
                <span className="text-[9px] text-[#999] mt-1.5 truncate w-full text-center">{client.name}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-[#fdf6f3] rounded-lg p-4 border border-[#f0e0d6] text-center">
              <p className="text-2xl font-serif font-medium text-[#a85454]">55%</p>
              <p className="text-xs text-[#999] mt-1">from 3 clients</p>
            </div>
            <div className="flex-1 bg-[#fdf6f3] rounded-lg p-4 border border-[#f0e0d6] text-center">
              <p className="text-2xl font-serif font-medium text-[#a85454]">$660K</p>
              <p className="text-xs text-[#999] mt-1">at risk annually</p>
            </div>
            <div className="flex-1 bg-[#f8f8f6] rounded-lg p-4 border border-[#e5e5e5] text-center">
              <p className="text-2xl font-serif font-medium text-[#1a1a1a]">$540K</p>
              <p className="text-xs text-[#999] mt-1">remaining if top 3 leave</p>
            </div>
          </div>
        </div>

        {/* ━━━ 7. SCALE CEILING ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">The Scale Ceiling</h3>
            <span className="text-xs text-[#999]">Growth Limit</span>
          </div>
          <p className="text-sm text-[#999] mb-6">Your hours required vs. clients served.</p>

          {/* Scale curve chart */}
          <div className="relative h-48 mb-4">
            <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[40, 60, 80, 100].map((h) => {
                const y = 170 - ((h - 30) / 80) * 160
                return (
                  <g key={h}>
                    <line x1="40" y1={y} x2="380" y2={y} stroke="#f0f0f0" strokeWidth="1" />
                    <text x="35" y={y + 3} textAnchor="end" fill="#999" fontSize="8">{h}h</text>
                  </g>
                )
              })}

              {/* Danger zone */}
              <rect x="40" y={170 - ((60 - 30) / 80) * 160} width="340" height={((60 - 30) / 80) * 160 - ((170 - ((100 - 30) / 80) * 160) - (170 - ((60 - 30) / 80) * 160))} fill="none" />
              <rect x="40" y="10" width="340" height={170 - ((60 - 30) / 80) * 160 - 10} fill="#fdf6f3" opacity="0.5" />

              {/* The curve */}
              <polyline
                points={data.scaleCurve.map((p, i) => {
                  const x = 40 + (i / (data.scaleCurve.length - 1)) * 340
                  const y = 170 - ((p.hours - 30) / 80) * 160
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke={colors.dangerRed}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.scaleCurve.map((p, i) => {
                const x = 40 + (i / (data.scaleCurve.length - 1)) * 340
                const y = 170 - ((p.hours - 30) / 80) * 160
                const isCurrent = p.clients === 12
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={isCurrent ? 5 : 3} fill={isCurrent ? colors.dangerRed : 'white'} stroke={colors.dangerRed} strokeWidth="2" />
                    <text x={x} y="178" textAnchor="middle" fill={isCurrent ? colors.dangerRed : '#999'} fontSize="8" fontWeight={isCurrent ? '600' : '400'}>
                      {p.clients}
                    </text>
                  </g>
                )
              })}

              {/* Current marker */}
              {(() => {
                const idx = data.scaleCurve.findIndex(p => p.clients === 12)
                const x = 40 + (idx / (data.scaleCurve.length - 1)) * 340
                const y = 170 - ((data.scaleCurve[idx].hours - 30) / 80) * 160
                return (
                  <g>
                    <line x1={x} y1={y + 8} x2={x} y2="170" stroke={colors.dangerRed} strokeWidth="1" strokeDasharray="3,3" />
                    <text x={x + 8} y={y - 8} fill={colors.dangerRed} fontSize="8" fontWeight="600">YOU ARE HERE</text>
                  </g>
                )
              })()}

              {/* 60h danger line */}
              {(() => {
                const y = 170 - ((60 - 30) / 80) * 160
                return (
                  <g>
                    <line x1="40" y1={y} x2="380" y2={y} stroke={colors.dangerRed} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
                    <text x="382" y={y + 3} fill={colors.dangerRed} fontSize="7" opacity="0.6">burnout</text>
                  </g>
                )
              })()}

              {/* X axis label */}
              <text x="210" y="190" textAnchor="middle" fill="#999" fontSize="8">Clients</text>
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-[#fdf6f3] rounded-lg p-4 border border-[#f0e0d6] text-center">
              <p className="text-2xl font-serif font-medium text-[#c77d3e]">~15</p>
              <p className="text-xs text-[#999] mt-1">maximum clients at this model</p>
            </div>
            <div className="flex-1 bg-[#fdf6f3] rounded-lg p-4 border border-[#f0e0d6] text-center">
              <p className="text-2xl font-serif font-medium text-[#a85454]">73h/wk</p>
              <p className="text-xs text-[#999] mt-1">required at 16 clients</p>
            </div>
          </div>
        </div>

        {/* ━━━ 8. EXIT VALUE GAP ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Exit Value Gap</h3>
            <span className="text-xs text-[#999]">Enterprise Value</span>
          </div>
          <p className="text-sm text-[#999] mb-6">Your agency is a job, not an asset. Here&apos;s the difference.</p>

          {/* Value comparison bars */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#a85454]" />
                  <span className="text-xs text-[#666]">Current value (2.4x multiple)</span>
                </div>
                <span className="text-sm font-serif font-medium text-[#a85454]">$2.9M</span>
              </div>
              <div className="h-8 bg-[#f0f0f0] rounded-lg overflow-hidden">
                <div className="h-full bg-[#a85454] rounded-lg" style={{ width: '48%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900" />
                  <span className="text-xs text-[#666]">With transferable systems (5x multiple)</span>
                </div>
                <span className="text-sm font-serif font-medium text-emerald-800">$6.0M</span>
              </div>
              <div className="h-8 bg-[#f0f0f0] rounded-lg overflow-hidden">
                <div className="h-full bg-emerald-900 rounded-lg" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="bg-[#fdf6f3] rounded-lg p-5 border border-[#f0e0d6] text-center">
            <p className="text-3xl font-serif font-medium text-[#a85454]">$3.1M</p>
            <p className="text-sm text-[#999] mt-1">in value that doesn&apos;t exist yet</p>
            <p className="text-xs text-[#999] mt-3 max-w-md mx-auto">
              A buyer doesn&apos;t see a company. They see a job with your name on it. Jobs don&apos;t sell for 5x.
            </p>
          </div>
        </div>

        {/* ━━━ 9. INVISIBLE IP ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Invisible IP</h3>
            <span className="text-xs text-[#999]">Knowledge Assets</span>
          </div>
          <p className="text-sm text-[#999] mb-6">What an acquirer sees during due diligence.</p>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Big donut */}
            <div className="flex-shrink-0">
              <MiniDonut value={25} size={120} color={colors.dangerRed} label="documented" />
            </div>

            {/* IP inventory */}
            <div className="flex-1 w-full">
              <div className="space-y-2">
                {[
                  { asset: 'Pricing logic', status: 'In your head', captured: false },
                  { asset: 'Quality standards', status: 'In your head', captured: false },
                  { asset: 'Client management', status: 'In your head', captured: false },
                  { asset: 'Delivery process', status: 'Partially documented', captured: false },
                  { asset: 'Sales playbook', status: 'Partially documented', captured: false },
                  { asset: 'Project templates', status: 'Documented', captured: true },
                ].map((item) => (
                  <div key={item.asset} className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0">
                    <span className="text-xs text-[#666]">{item.asset}</span>
                    <span className={`text-[11px] font-medium ${item.captured ? 'text-emerald-800' : 'text-[#a85454]'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#999] mt-4 italic">
                An acquirer sees one person who IS the company. That&apos;s the difference between equity and a salary.
              </p>
            </div>
          </div>
        </div>

        {/* ━━━ THE LINE ━━━ */}
        <div className="py-16 md:py-20 text-center max-w-2xl mx-auto">
          <div className="w-10 h-px bg-[#ddd] mx-auto mb-8" />
          <p className="text-lg md:text-xl font-serif text-[#1a1a1a] leading-relaxed">
            Every month this stays the same, you lose another $15,000 in time, another month
            of freedom, and another percentage point off your exit multiple.
          </p>
          <div className="w-10 h-px bg-[#ddd] mx-auto mt-8" />
        </div>

        {/* ━━━ CTA ━━━ */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8 md:p-12 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-3">
            Let&apos;s Fix This.
          </h2>
          <p className="text-[#666] max-w-lg mx-auto mb-8 leading-relaxed">
            In 45 minutes, we&apos;ll walk through your diagnostic, identify the structural
            breaks, and map the path from owner-dependent to owner-optional.
          </p>
          <a
            href="https://cal.com/exit-layer/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-900 text-white text-lg font-medium rounded-full hover:bg-emerald-950 transition-colors"
          >
            Book Your Discovery Call
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-[#999] text-sm mt-4">Free &middot; No pitch until you ask &middot; Just clarity</p>
        </div>

      </main>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-[#999] text-sm">
          <span>&copy; 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">michael@exitlayer.io</a>
        </div>
      </footer>
    </div>
  )
}
