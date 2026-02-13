import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/platform/sidebar';
import { Header } from '@/components/platform/header';
import { Toaster } from '@/components/ui/sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.ENABLE_PLATFORM_APP !== 'true') {
    redirect('/platform-demo');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's organization
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .single();

  if (!userOrg || !userOrg.organizations) {
    // Should not happen due to trigger, but handle gracefully
    redirect('/login');
  }

  const org = userOrg.organizations as unknown as { id: string; name: string; slug: string };

  return (
    <div className="flex h-screen bg-[#f8f8f6]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          organization={org}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
