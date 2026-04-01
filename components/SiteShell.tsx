'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const items = [
  { href: '/', label: 'Overview' },
  { href: '/simulation', label: 'Simulation' },
  { href: '/analytics', label: 'Analytics' }
];

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="page-wrap">
      <header className="glass flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_28px_rgba(99,214,255,0.65)]" />
          <div>
            <p className="section-eyebrow">ApexLab Systems</p>
            <p className="text-sm font-semibold tracking-wide">XR Decision Lab</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-pill ${pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
