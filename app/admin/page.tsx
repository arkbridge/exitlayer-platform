import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Fetch all submissions with profiles
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        company_name
      )
    `)
    .order('created_at', { ascending: false })

  // Calculate stats
  const stats = {
    total: submissions?.length || 0,
    submitted: submissions?.filter(s => s.status === 'submitted').length || 0,
    inReview: submissions?.filter(s => s.status === 'review').length || 0,
    building: submissions?.filter(s => s.status === 'building').length || 0,
    complete: submissions?.filter(s => s.status === 'complete').length || 0,
    avgScore: submissions?.length
      ? Math.round(submissions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / submissions.length)
      : 0,
  }

  const recentSubmissions = submissions?.slice(0, 5) || []

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Admin Dashboard</h1>
        <p className="text-[#666]">Overview of all client submissions and pipeline.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
          <div className="text-[#666] text-sm mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-[#1a1a1a]">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
          <div className="text-[#666] text-sm mb-1">New</div>
          <div className="text-3xl font-bold text-[#3b82f6]">{stats.submitted}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
          <div className="text-[#666] text-sm mb-1">In Review</div>
          <div className="text-3xl font-bold text-[#f59e0b]">{stats.inReview}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
          <div className="text-[#666] text-sm mb-1">Building</div>
          <div className="text-3xl font-bold text-[#8b5cf6]">{stats.building}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
          <div className="text-[#666] text-sm mb-1">Complete</div>
          <div className="text-3xl font-bold text-[#22c55e]">{stats.complete}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
          <div className="text-[#666] text-sm mb-1">Avg Score</div>
          <div className="text-3xl font-bold" style={{ color: getScoreColor(stats.avgScore) }}>
            {stats.avgScore}
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Recent Submissions</h2>
          <Link
            href="/admin/clients"
            className="text-emerald-800 hover:text-[#1a1a1a] text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-[#f0f0f0]">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission: any) => (
              <Link
                key={submission.id}
                href={`/admin/clients/${submission.id}`}
                className="block px-6 py-4 hover:bg-[#f8f8f6] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getScoreColor(submission.overall_score) }}
                    >
                      {submission.overall_score}
                    </div>
                    <div>
                      <p className="text-[#1a1a1a] font-medium">
                        {submission.profiles?.company_name || submission.profiles?.email || 'Unknown'}
                      </p>
                      <p className="text-[#999] text-sm">
                        {submission.profiles?.full_name || 'No name'} • {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'submitted' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                      submission.status === 'review' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                      submission.status === 'building' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' :
                      submission.status === 'complete' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                      'bg-[#666]/10 text-[#666]'
                    }`}>
                      {submission.status}
                    </span>
                    <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-[#999]">
              <p>No submissions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
