'use client'

interface ValueSummaryRowProps {
  currentValue: number
  potentialValue: number
  valueGap: number
  currentMultiple: number
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

export default function ValueSummaryRow({
  currentValue,
  potentialValue,
  valueGap,
  currentMultiple
}: ValueSummaryRowProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Card 1 - Current Valuation */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-[#999] text-sm mb-2">Current Valuation</div>
        <div className="text-3xl font-serif font-medium text-[#1a1a1a] mb-1">
          {formatCurrency(currentValue)}
        </div>
        <div className="text-[#999] text-sm">
          {currentMultiple}x multiple
        </div>
      </div>

      {/* Card 2 - Potential Valuation */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-emerald-800 text-sm mb-2">Potential Valuation</div>
        <div className="text-3xl font-serif font-medium text-emerald-800 mb-1">
          {formatCurrency(potentialValue)}
        </div>
        <div className="text-[#999] text-sm">
          at 5x multiple
        </div>
      </div>

      {/* Card 3 - Value Gap (Opportunity) */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        {/* Subtle emerald gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="text-emerald-800 text-sm mb-2">Value Gap</div>
          <div className="text-3xl font-serif font-medium text-emerald-800 mb-1">
            {formatCurrency(valueGap)}
          </div>
          <div className="text-[#999] text-sm">
            Your growth opportunity
          </div>
        </div>
      </div>
    </div>
  )
}
