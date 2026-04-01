"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">{children}</div>;
}

export function TopNav() {
  const links = [
    ["Demo", "/demo"],
    ["Simulation", "/simulation"],
    ["Analytics", "/analytics"],
    ["Replay", "/replay"]
  ];

  return (
    <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3 backdrop-blur-md">
      <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-accent">
        XR DECISION LAB
      </Link>
      <div className="flex gap-2 text-xs text-slate-300">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-full border border-white/10 px-3 py-1.5 hover:border-accent/60 hover:text-accent">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function GlassCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`glass rounded-2xl p-5 shadow-glow ${className}`}>
      {title ? <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-300">{title}</h3> : null}
      {children}
    </motion.div>
  );
}
