'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Activity,
  CheckSquare,
  Zap,
  Sparkles,
  History,
  Settings,
  Link2,
  Key,
} from 'lucide-react';

const navigation = [
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Triggers', href: '/triggers', icon: Zap },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'History', href: '/history', icon: History },
];

const settingsNavigation = [
  { name: 'Connections', href: '/settings/connections', icon: Link2 },
  { name: 'API Key', href: '/settings/api-key', icon: Key },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  // Detect if we're in demo mode or platform mode
  const isPlatformDemo = pathname.startsWith('/platform-demo');
  const isPlatform = pathname.startsWith('/platform') && !isPlatformDemo;
  const basePath = isPlatformDemo ? '/platform-demo' : isPlatform ? '/platform' : '';

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-[#0d1c18] to-[#0a1612] text-white">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <Link href={basePath || '/'} className="flex items-center gap-2">
          <span
            className="text-xl font-serif font-medium tracking-tight"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(167,243,208,0.8) 50%, rgba(110,231,183,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ExitLayer
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const fullHref = basePath + item.href || '/';
          const isActive = pathname === fullHref ||
            (item.href !== '' && pathname.startsWith(fullHref));

          return (
            <Link
              key={item.name}
              href={fullHref}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive ? 'text-emerald-400' : 'text-white/40'
              )} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
            Settings
          </p>
          {settingsNavigation.map((item) => {
            const fullHref = basePath + item.href;
            const isActive = pathname === fullHref ||
              (item.href !== '/settings' && pathname.startsWith(fullHref));

            return (
              <Link
                key={item.name}
                href={fullHref}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-emerald-400' : 'text-white/40'
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Help section */}
      <div className="p-3 border-t border-white/10">
        <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-400">Need help?</p>
          <p className="text-xs text-white/50 mt-1">
            Check out our docs or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
