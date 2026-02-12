import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, Zap, Sparkles } from 'lucide-react'

export default async function PlatformPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, organizations(id, name)')
    .eq('user_id', user.id)
    .single()

  const orgId = (userOrg?.organizations as unknown as { id: string; name: string } | null)?.id

  // Fetch stats
  let executionsToday = 0
  let pendingApprovals = 0
  let activeTriggers = 0
  let recentExecutions: any[] = []

  if (orgId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [execCountRes, pendingRes, triggersRes, recentRes] = await Promise.all([
      supabase
        .from('executions')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('created_at', today.toISOString()),
      supabase
        .from('executions')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'awaiting_approval'),
      supabase
        .from('trigger_rules')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('enabled', true),
      supabase
        .from('executions')
        .select('id, status, created_at, skill_output, action_taken, error, skills(name), trigger_rules(name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    executionsToday = execCountRes.count || 0
    pendingApprovals = pendingRes.count || 0
    activeTriggers = triggersRes.count || 0
    recentExecutions = recentRes.data || []
  }

  const hasActivity = recentExecutions.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Activity</h1>
        <p className="text-[#666]">What&apos;s happening in your automation</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e5e5e5]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#666]">Executions Today</p>
                <p className="text-3xl font-bold text-[#1a1a1a]">{executionsToday}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5e5e5]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#666]">Pending Approvals</p>
                <p className="text-3xl font-bold text-amber-600">{pendingApprovals}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5e5e5]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#666]">Active Triggers</p>
                <p className="text-3xl font-bold text-[#1a1a1a]">{activeTriggers}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <CardTitle className="text-[#1a1a1a]">Recent Activity</CardTitle>
          <CardDescription className="text-[#666]">
            Real-time log of automated actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasActivity ? (
            <div className="space-y-4">
              {recentExecutions.map((execution: any) => {
                const statusStyles: Record<string, string> = {
                  completed: 'bg-emerald-100 text-emerald-700',
                  awaiting_approval: 'bg-amber-100 text-amber-700',
                  running: 'bg-blue-100 text-blue-700',
                  failed: 'bg-red-100 text-red-700',
                  pending: 'bg-gray-100 text-gray-700',
                }
                const style = statusStyles[execution.status] || statusStyles.pending

                return (
                  <div
                    key={execution.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-[#f8f8f6] hover:bg-[#f0f0ee] transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${style}`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1a1a1a]">
                          {execution.skills?.name || 'Unknown Skill'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded border border-[#e5e5e5] text-[#666]">
                          {execution.trigger_rules?.name || 'Manual'}
                        </span>
                      </div>
                      <p className="text-sm text-[#666] truncate">
                        {execution.skill_output || execution.error || 'Processing...'}
                      </p>
                      {execution.action_taken && (
                        <p className="text-xs text-emerald-600 mt-1">
                          {execution.action_taken}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[#999] whitespace-nowrap">
                      {new Date(execution.created_at).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
              <p className="text-[#666] font-medium">No automations running yet</p>
              <p className="text-sm text-[#999] mt-1">
                Set up your first skill and trigger to start automating
              </p>
              <a
                href="/skills"
                className="inline-block mt-4 px-4 py-2 text-sm bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                Browse Skills
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
