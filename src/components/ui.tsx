"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</div>;
}

export function TopNav() {
  const links = [
    ["Demo", "/demo"],
    ["Simulation", "/simulation"],
    ["Analytics", "/analytics"],
    ["Replay", "/replay"]
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3.5 backdrop-blur-xl"
    >
      <Link href="/" className="text-xs font-semibold tracking-[0.32em] text-accent sm:text-sm">
        XR DECISION LAB
      </Link>
      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
          >
            {label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export function GlassCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`glass rounded-2xl p-5 shadow-glow md:p-6 ${className}`}
    >
      {title ? <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">{title}</h3> : null}
      {children}
    </motion.div>
  );
}
