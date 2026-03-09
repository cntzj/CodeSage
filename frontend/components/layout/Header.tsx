'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useUIStore } from '@/lib/hooks';

function titleFromPath(pathname: string): string {
  if (pathname.startsWith('/projects') && pathname.includes('/pull-requests')) {
    return 'Pull Requests';
  }
  if (pathname.includes('/knowledge')) {
    return 'Knowledge Graph';
  }
  if (pathname.includes('/debts')) {
    return 'Debt Tracker';
  }
  if (pathname.includes('/settings')) {
    return 'Project Settings';
  }
  if (pathname.includes('/search')) {
    return 'Semantic Search';
  }
  return 'Dashboard';
}

export function Header() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/60 bg-paper/70 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/15 bg-white md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/50">CodeSage Console</p>
          <h1 className="text-lg font-semibold">{titleFromPath(pathname)}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-tide/10 px-2 py-1 text-xs font-medium text-tide md:inline-flex">
          Mock Mode
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
          JR
        </div>
      </div>
    </header>
  );
}
