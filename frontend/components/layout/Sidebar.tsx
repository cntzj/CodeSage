'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DEFAULT_PROJECT_ID } from '@/lib/utils';
import { useUIStore } from '@/lib/hooks';

const links = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'PRs', href: `/projects/${DEFAULT_PROJECT_ID}/pull-requests` },
  { label: 'Graph', href: `/projects/${DEFAULT_PROJECT_ID}/knowledge` },
  { label: 'Search', href: `/projects/${DEFAULT_PROJECT_ID}/search` },
  { label: 'Debt', href: `/projects/${DEFAULT_PROJECT_ID}/debts` },
  { label: 'Settings', href: `/projects/${DEFAULT_PROJECT_ID}/settings` },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/70 bg-white/85 p-4 shadow-card backdrop-blur transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white"
        >
          <span className="h-2 w-2 rounded-full bg-ember" />
          CodeSage
        </Link>

        <nav className="space-y-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-ink text-white'
                    : 'text-ink/80 hover:bg-tide/10 hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-ink/35 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </>
  );
}
