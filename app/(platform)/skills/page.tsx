import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, Play } from 'lucide-react';

export default async function SkillsPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user!.id)
    .single();

  const organizationId = userOrg?.organization_id;

  // Get skills
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-500">AI-powered capabilities for your automation</p>
        </div>
        <Button asChild>
          <Link href="/skills/new">
            <Plus className="h-4 w-4 mr-2" />
            New Skill
          </Link>
        </Button>
      </div>

      {skills && skills.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} className="hover:border-indigo-200 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                  </div>
                  <Badge variant={skill.is_active ? 'default' : 'secondary'}>
                    {skill.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{skill.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {skill.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {skill.config?.model || 'claude-sonnet-4-20250514'}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/skills/${skill.slug}`}>
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No skills yet</h3>
              <p className="text-gray-500 mt-1 mb-4">
                Skills are AI prompts that power your automation.
              </p>
              <Button asChild>
                <Link href="/skills/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Skill
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
