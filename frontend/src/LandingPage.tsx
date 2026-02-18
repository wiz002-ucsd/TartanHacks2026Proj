/**
 * Sunzi — AI-Powered Academic Assistant
 * Landing Page
 *
 * Structured as a Next.js App Router `page.tsx` default export.
 * Compatible with Vite + React when used as a component.
 *
 * Sections:
 *   1. Navigation      — Sticky, responsive, primary CTA
 *   2. Hero            — Split layout, strong headline, dual CTAs, live mock UI
 *   3. Problem         — Pain-point acknowledgment, sharp resolution line
 *   4. Features        — 4 outcome-driven feature cards
 *   5. How It Works    — 3 steps, alternating screenshot placeholders
 *   6. Product Showcase — Full dashboard preview + benefit list
 *   7. Social Proof    — 3 testimonials + university trust bar
 *   8. Final CTA       — Gradient card, closing statement, primary CTA
 *   9. Footer          — Logo, links, copyright
 *
 * Analytics hooks are marked with: // ANALYTICS:
 * Motion hooks are marked with:    // MOTION:
 * Screenshot placeholders:         {/* PRODUCT SCREENSHOT PLACEHOLDER *}
 * Icon placeholders:               {/* FEATURE ICON PLACEHOLDER *}
 */

"use client"; // Next.js App Router directive — no-op in Vite

import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface LandingPageProps {
  /** Called when any primary CTA is clicked — wire to your auth/signup flow */
  onGetStarted?: () => void;
}

// ─────────────────────────────────────────────────────────────
// INLINE SVG ICONS  (zero dependency — swap for lucide-react later)
// ─────────────────────────────────────────────────────────────

const TargetIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const ZapIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MessageIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MenuIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const AlertIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const EyeOffIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ClockIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const BrainIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// SECTION 1: NAVIGATION
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = ["Features", "How It Works", "Pricing"];

const Navigation = ({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-black/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-8 h-8 bg-[#E67E22] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(230,126,34,0.4)]">
              <BookIcon className="w-4 h-4 text-black" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Sunzi</span>
          </div>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((label) => (
              <button
                key={label}
                onClick={() => scrollTo(label.toLowerCase().replace(/ /g, "-"))}
                className="text-[#a3a3a3] hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {label}
              </button>
            ))}
            <button className="text-[#a3a3a3] hover:text-white text-sm font-medium transition-colors duration-200">
              Login
            </button>
          </div>

          {/* ── Desktop CTA ── */}
          {/* ANALYTICS: track('nav_cta_clicked') */}
          <div className="hidden md:block">
            <button
              onClick={onGetStarted}
              className="bg-[#E67E22] hover:bg-[#F39C12] text-black font-semibold text-sm px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(230,126,34,0.45)]"
            >
              Get Started
            </button>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#a3a3a3] hover:text-white p-1 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {/* MOTION: animate with framer-motion AnimatePresence + slide-down */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-black">
          <div className="px-6 py-5 space-y-4">
            {[...NAV_LINKS, "Login"].map((label) => (
              <button
                key={label}
                onClick={() => scrollTo(label.toLowerCase().replace(/ /g, "-"))}
                className="block text-left w-full text-[#a3a3a3] hover:text-white text-sm font-medium py-1 transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={onGetStarted}
              className="w-full bg-[#E67E22] hover:bg-[#F39C12] text-black font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 mt-2"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────
// SECTION 2: HERO
// ─────────────────────────────────────────────────────────────

/** Mock mastery data rendered inside the hero screenshot placeholder */
const HERO_COURSES = [
  { label: "Calculus II",      pct: 78, color: "#E67E22" },
  { label: "Linear Algebra",   pct: 54, color: "#F39C12" },
  { label: "Data Structures",  pct: 91, color: "#10b981" },
  { label: "Thermodynamics",   pct: 32, color: "#ef4444" },
];

const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="relative min-h-screen flex items-center bg-black overflow-hidden pt-16">

    {/* ── Background Gradients ── */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#E67E22]/8 via-transparent to-transparent pointer-events-none" />
    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#E67E22]/5 via-transparent to-transparent pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-[#E67E22]/4 to-transparent pointer-events-none" />

    {/* ── Subtle Grid Pattern ── */}
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
        backgroundSize: "72px 72px",
      }}
    />

    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* ── LEFT: Copy ── */}
        <div className="space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-[#0f0f0f] border border-[#E67E22]/30 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse" />
            <span className="text-[#E67E22] text-xs font-semibold tracking-widest uppercase">
              AI-Powered Academic Assistant
            </span>
          </div>

          {/* Headline */}
          {/* MOTION: stagger children with framer-motion on mount */}
          <h1 className="text-5xl lg:text-6xl xl:text-[4.25rem] font-black text-white leading-[1.04] tracking-tight">
            Know What You've{" "}
            <span
              className="text-[#E67E22]"
              style={{ textShadow: "0 0 40px rgba(230,126,34,0.35)" }}
            >
              Mastered.
            </span>
            <br />
            Study What{" "}
            <span className="text-[#e5e5e5]">Actually Matters.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#a3a3a3] text-lg lg:text-xl leading-relaxed max-w-[520px]">
            Sunzi tracks your understanding across every course, generates
            adaptive quizzes from your actual material, and builds a
            deadline-aware study plan — so you always know your next move.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* ANALYTICS: track('hero_primary_cta_clicked') */}
            <button
              onClick={onGetStarted}
              className="group flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#F39C12] text-black font-bold text-base px-8 py-3.5 rounded-2xl transition-all duration-200 hover:shadow-[0_0_35px_rgba(230,126,34,0.55)]"
            >
              Get Started — Free
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            {/* ANALYTICS: track('hero_secondary_cta_clicked') */}
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 border border-[#2a2a2a] hover:border-[#E67E22]/50 text-[#e5e5e5] hover:text-white font-semibold text-base px-8 py-3.5 rounded-2xl transition-all duration-200 hover:bg-white/[0.02]"
            >
              See How It Works
            </button>
          </div>

          {/* Micro social proof */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex -space-x-2.5">
              {["A", "M", "L", "J"].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, rgba(230,126,34,${0.3 + i * 0.15}), rgba(230,126,34,0.1))`,
                  }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-[#737373] text-sm">
              <span className="text-[#e5e5e5] font-semibold">500+ students</span>{" "}
              tracking mastery this semester
            </p>
          </div>
        </div>

        {/* ── RIGHT: Screenshot Placeholder ── */}
        {/* PRODUCT SCREENSHOT PLACEHOLDER — replace outer div with <img> */}
        <div className="relative">

          {/* Main card */}
          <div className="relative rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.9)] hover:shadow-[0_40px_80px_rgba(230,126,34,0.12)] transition-shadow duration-700">

            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#080808]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/50" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/50" />
                <div className="w-3 h-3 rounded-full bg-[#10b981]/50" />
              </div>
              <div className="flex-1 mx-4 bg-[#1a1a1a] rounded h-5 max-w-[200px] flex items-center px-3">
                <div className="h-1.5 bg-[#2a2a2a] rounded w-24" />
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 space-y-4">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 bg-[#2a2a2a] rounded w-28" />
                  <div className="h-2 bg-[#1a1a1a] rounded w-20" />
                </div>
                <div className="h-7 bg-[#E67E22]/15 border border-[#E67E22]/25 rounded-lg px-3 flex items-center">
                  <div className="h-2 bg-[#E67E22]/40 rounded w-16" />
                </div>
              </div>

              {/* Mastery bars */}
              <div className="space-y-3">
                {HERO_COURSES.map((course) => (
                  <div key={course.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a3a3a3] text-xs font-medium">{course.label}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: course.color }}>
                        {course.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${course.pct}%`, backgroundColor: course.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI recommendation pill */}
              <div className="bg-gradient-to-r from-[#E67E22]/10 to-transparent border border-[#E67E22]/20 rounded-xl p-3 flex items-start gap-3">
                <div className="w-6 h-6 bg-[#E67E22]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ZapIcon className="w-3 h-3 text-[#E67E22]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 bg-[#E67E22]/20 rounded w-40" />
                  <div className="h-2 bg-[#2a2a2a] rounded w-full" />
                  <div className="h-2 bg-[#2a2a2a] rounded w-3/4" />
                </div>
              </div>

              {/* Quiz card */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#E67E22]/15 rounded" />
                  <div className="h-2.5 bg-[#2a2a2a] rounded w-44" />
                </div>
                <div className="space-y-1.5">
                  {[80, 60, 90].map((w, i) => (
                    <div key={i} className="h-2 bg-[#2a2a2a] rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <div className="h-8 bg-[#E67E22]/15 border border-[#E67E22]/25 rounded-xl flex-1" />
                  <div className="h-8 bg-[#2a2a2a] rounded-xl flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating Stat Badges ── */}
          <div className="absolute -left-5 top-1/3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#E67E22]/10 rounded-xl flex items-center justify-center">
                <TargetIcon className="w-4 h-4 text-[#E67E22]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">78%</p>
                <p className="text-[#737373] text-xs mt-0.5">Avg Mastery</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-5 bottom-1/3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-[#10b981]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">3 days</p>
                <p className="text-[#737373] text-xs mt-0.5">Ahead of schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 3: PROBLEM FRAMING
// ─────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    Icon: BookIcon,
    title: "You cram the night before.",
    description:
      "And forget everything by the final. Short-term memory isn't a study strategy — it's a survival tactic that costs you when the stakes are highest.",
  },
  {
    Icon: EyeOffIcon,
    title: "You don't know what you don't know.",
    description:
      "Hours of studying feel productive, but you never truly know which concepts are solid and which ones will trip you up on the exam.",
  },
  {
    Icon: ClockIcon,
    title: "Deadlines blindside you.",
    description:
      "With four courses, three projects, and two exams, nothing stays organized in your head. Something always slips — usually at the worst time.",
  },
  {
    Icon: AlertIcon,
    title: "The overwhelm is structural.",
    description:
      "You're not falling behind because you're not smart. You're falling behind because the system is chaotic and you have no map. Sunzi is the map.",
  },
];

const ProblemFraming = () => (
  <section className="py-24 lg:py-32 bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">
          The Problem
        </p>
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
          Sound familiar?
        </h2>
        <p className="text-[#737373] text-lg max-w-lg mx-auto leading-relaxed">
          Most students don't fail from lack of intelligence.
          <br />
          They fail from lack of structure.
        </p>
      </div>

      {/* Problem cards */}
      {/* MOTION: stagger in from bottom on scroll — use Intersection Observer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {PROBLEMS.map(({ Icon, title, description }, i) => (
          <div
            key={i}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-7 space-y-4 hover:border-[#E67E22]/25 hover:bg-[#0f0f0f] transition-all duration-300"
          >
            {/* FEATURE ICON PLACEHOLDER */}
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center group-hover:border-[#E67E22]/20 transition-colors duration-300">
              <Icon className="w-5 h-5 text-[#737373] group-hover:text-[#E67E22] transition-colors duration-300" />
            </div>
            <h3 className="text-[#e5e5e5] font-bold text-base leading-snug">{title}</h3>
            <p className="text-[#737373] text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* Resolution bridge */}
      <div className="text-center space-y-4">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#E67E22]/60 to-transparent mx-auto" />
        <p className="text-2xl lg:text-3xl font-bold text-white mt-6">
          Sunzi gives you the map.
        </p>
        <p className="text-[#737373] text-base max-w-lg mx-auto leading-relaxed">
          Adaptive AI that understands your semester, tracks your mastery in
          real time, and keeps you ahead — not just afloat.
        </p>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 4: FEATURES
// ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: TargetIcon,
    tag: "Precision Learning",
    title: "Adaptive Mastery Tracking",
    description:
      "Know exactly where you stand — not where you think you stand. Sunzi maps your real understanding across every topic in every course, so you study with surgical precision instead of anxious guesswork.",
  },
  {
    Icon: ZapIcon,
    tag: "Active Recall",
    title: "AI Quizzes & Flashcards",
    description:
      "Generated from your actual course material, not generic internet content. Sunzi creates targeted practice problems using spaced-repetition science — reinforcing exactly what you need, when you need it most.",
  },
  {
    Icon: CalendarIcon,
    tag: "Always Ahead",
    title: "Deadline-Aware Study Planning",
    description:
      "Your study schedule builds itself around your real calendar. Sunzi knows when exams and assignments land, works backwards, and keeps you prepared before the pressure hits — not during it.",
  },
  {
    Icon: MessageIcon,
    tag: "Contextual Intelligence",
    title: "Course-Specific AI Chat",
    description:
      "Ask anything about your coursework and get answers grounded in your own syllabus and lecture notes. Not generic AI — an AI that has read everything your professor assigned and remembers all of it.",
  },
];

const Features = () => (
  <section id="features" className="py-24 lg:py-32 bg-black">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      <div className="text-center space-y-4 mb-16">
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">
          Features
        </p>
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
          Built for how students actually learn
        </h2>
        <p className="text-[#737373] text-lg max-w-xl mx-auto">
          Every feature is designed around one goal: help you understand more
          in less time — with no guesswork.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map(({ Icon, tag, title, description }, i) => (
          <div
            key={i}
            className="group relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-9 space-y-5 hover:border-[#E67E22]/35 hover:bg-[#0f0f0f] transition-all duration-300 hover:shadow-[0_0_50px_rgba(230,126,34,0.07)]"
          >
            {/* FEATURE ICON PLACEHOLDER */}
            <div className="w-12 h-12 bg-[#E67E22]/10 border border-[#E67E22]/20 rounded-2xl flex items-center justify-center group-hover:bg-[#E67E22]/15 group-hover:border-[#E67E22]/35 transition-all duration-300">
              <Icon className="w-6 h-6 text-[#E67E22]" />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-white font-bold text-xl">{title}</h3>
                <span className="text-xs font-semibold text-[#E67E22] bg-[#E67E22]/10 border border-[#E67E22]/20 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                  {tag}
                </span>
              </div>
              <p className="text-[#737373] leading-relaxed text-[0.95rem]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 5: HOW IT WORKS
// ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Add Your Courses",
    description:
      "Upload your syllabi, add your course list, and tell Sunzi your exam dates. It'll understand your entire semester in minutes — then get to work building your structure.",
    detail: "Supports PDF syllabi, manual entry, and smart deadline parsing.",
    /* Mock UI for step */
    mockType: "course-list" as const,
  },
  {
    number: "02",
    title: "Track Your Mastery",
    description:
      "As you study and take AI-generated quizzes, Sunzi builds a real-time map of what you know and what still needs work. Honest feedback, delivered without pressure.",
    detail: "Updated after every session. Detailed breakdowns by topic and subtopic.",
    mockType: "mastery-map" as const,
  },
  {
    number: "03",
    title: "Study Smarter with AI",
    description:
      "Get a personalized study plan calibrated to your actual gaps, upcoming deadlines, and available hours. Ask Sunzi anything about your courses — it answers from your own material.",
    detail: "AI chat grounded in your syllabus. Plans that adapt as you improve.",
    mockType: "ai-chat" as const,
  },
];

/** Renders the mock UI inside each step's screenshot placeholder */
const StepMockUI = ({ type }: { type: "course-list" | "mastery-map" | "ai-chat" }) => {
  if (type === "course-list") {
    return (
      <div className="space-y-2">
        {["Calculus II", "Linear Algebra", "Data Structures", "Thermodynamics"].map((c, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-[#E67E22]" />
            <span className="text-[#a3a3a3] text-xs font-medium">{c}</span>
            <div className="flex-1" />
            <div className="h-2 bg-[#E67E22]/20 rounded w-16" />
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-9 bg-[#E67E22]/12 border border-[#E67E22]/25 rounded-xl flex items-center justify-center">
            <div className="h-2 w-20 bg-[#E67E22]/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "mastery-map") {
    const topics = [
      { name: "Integration by Parts", pct: 92, color: "#10b981" },
      { name: "Partial Fractions",    pct: 67, color: "#E67E22" },
      { name: "Taylor Series",        pct: 45, color: "#f59e0b" },
      { name: "Vector Calculus",      pct: 28, color: "#ef4444" },
    ];
    return (
      <div className="space-y-3">
        {topics.map((t, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#a3a3a3] text-xs">{t.name}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: t.color }}>
                {t.pct}%
              </span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: t.color }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ai-chat */
  return (
    <div className="space-y-2 flex flex-col h-full">
      <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
        <div className="space-y-1.5">
          <div className="h-2 bg-[#2a2a2a] rounded w-full" />
          <div className="h-2 bg-[#2a2a2a] rounded w-3/4" />
        </div>
      </div>
      <div className="bg-[#E67E22]/12 border border-[#E67E22]/18 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto">
        <div className="space-y-1.5">
          <div className="h-2 bg-[#E67E22]/35 rounded w-full" />
          <div className="h-2 bg-[#E67E22]/35 rounded w-2/3" />
        </div>
      </div>
      <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-sm p-3 max-w-[90%]">
        <div className="space-y-1.5">
          <div className="h-2 bg-[#2a2a2a] rounded w-full" />
          <div className="h-2 bg-[#2a2a2a] rounded w-4/5" />
          <div className="h-2 bg-[#2a2a2a] rounded w-3/5" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-9 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl" />
        <div className="w-9 h-9 bg-[#E67E22]/18 border border-[#E67E22]/28 rounded-xl flex items-center justify-center">
          <ArrowRightIcon className="w-3.5 h-3.5 text-[#E67E22]" />
        </div>
      </div>
    </div>
  );
};

const HowItWorks = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section id="how-it-works" className="py-24 lg:py-32 bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      <div className="text-center space-y-4 mb-20">
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">
          How It Works
        </p>
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
          From chaos to clarity in three steps
        </h2>
        <p className="text-[#737373] text-lg max-w-lg mx-auto">
          Simple setup. Powerful results. No learning curve.
        </p>
      </div>

      <div className="space-y-24">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
              i % 2 === 1 ? "lg:grid-flow-dense" : ""
            }`}
          >
            {/* Text block */}
            <div className={`space-y-6 ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
              <div className="flex items-center gap-4">
                <span className="text-6xl font-black text-[#E67E22]/18 tabular-nums leading-none">
                  {step.number}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#E67E22]/30 to-transparent" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-white">{step.title}</h3>
              <p className="text-[#a3a3a3] text-lg leading-relaxed">{step.description}</p>
              <div className="flex items-start gap-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                <CheckIcon className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                <p className="text-[#737373] text-sm leading-relaxed">{step.detail}</p>
              </div>
              {i === 2 && (
                /* ANALYTICS: track('hiw_cta_clicked') */
                <button
                  onClick={onGetStarted}
                  className="group flex items-center gap-2 bg-[#E67E22] hover:bg-[#F39C12] text-black font-bold px-7 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_0_25px_rgba(230,126,34,0.4)]"
                >
                  Get Started Now
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* STEP SCREENSHOT PLACEHOLDER */}
            <div className={i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
              <div className="relative rounded-2xl border border-[#1a1a1a] bg-[#080808] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#050505]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
                  </div>
                  <div className="flex-1 mx-3 bg-[#1a1a1a] rounded h-4 max-w-[180px]" />
                </div>

                {/* Mock UI content */}
                <div className="p-6 min-h-[240px]">
                  <StepMockUI type={step.mockType} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 6: PRODUCT SHOWCASE
// ─────────────────────────────────────────────────────────────

const DASHBOARD_FEATURES = [
  "Mastery scores by course and topic",
  "Upcoming deadlines ranked by urgency",
  "AI-recommended next study actions",
  "Quiz history and improvement trends",
];

const DASHBOARD_STATS = [
  { label: "Avg Mastery", value: "72%",    color: "#E67E22" },
  { label: "Study Streak", value: "12 days", color: "#10b981" },
  { label: "Next Exam",   value: "3 days",  color: "#f59e0b" },
];

const DASHBOARD_COURSES = [
  { name: "Calculus II",      pct: 78, color: "#E67E22" },
  { name: "Linear Algebra",   pct: 54, color: "#F39C12" },
  { name: "Data Structures",  pct: 91, color: "#10b981" },
  { name: "Thermodynamics",   pct: 32, color: "#ef4444" },
];

const ProductShowcase = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="py-24 lg:py-32 bg-black">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="bg-gradient-to-br from-[#0f0f0f] via-[#0a0a0a] to-[#0a0808] border border-[#E67E22]/20 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left: Copy */}
          <div className="p-10 lg:p-16 flex flex-col justify-center space-y-7">
            <div>
              <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase mb-4">
                The Dashboard
              </p>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight">
                Everything you need.{" "}
                <span className="text-[#737373] font-normal">Nothing you don't.</span>
              </h2>
            </div>
            <p className="text-[#737373] text-lg leading-relaxed">
              Your Sunzi dashboard gives you a clear, honest view of exactly
              where you stand across every course — so you can make intentional
              decisions about how to spend every study hour.
            </p>
            <ul className="space-y-3">
              {DASHBOARD_FEATURES.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/30 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-[#E67E22]" />
                  </div>
                  <span className="text-[#a3a3a3] text-sm">{item}</span>
                </li>
              ))}
            </ul>
            {/* ANALYTICS: track('showcase_cta_clicked') */}
            <div>
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-2 bg-[#E67E22] hover:bg-[#F39C12] text-black font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(230,126,34,0.5)]"
              >
                See Your Dashboard
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* PRODUCT SCREENSHOT PLACEHOLDER — right panel */}
          <div className="relative bg-[#080808] border-l border-[#1a1a1a] overflow-hidden min-h-[460px]">

            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#050505]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/35" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/35" />
                <div className="w-3 h-3 rounded-full bg-[#10b981]/35" />
              </div>
              <div className="flex-1 mx-3 bg-[#1a1a1a] rounded h-4 max-w-[200px] flex items-center px-3">
                <div className="h-1.5 bg-[#2a2a2a] rounded w-24" />
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="p-6 space-y-4">

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3">
                {DASHBOARD_STATS.map((s, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl p-3 space-y-1.5">
                    <p className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                    <div className="h-2 bg-[#2a2a2a] rounded w-3/4" />
                  </div>
                ))}
              </div>

              {/* Course mastery list */}
              <div className="space-y-2">
                {DASHBOARD_COURSES.map((c, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a3a3a3] text-xs font-medium">{c.name}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI recommendation */}
              <div className="bg-gradient-to-r from-[#E67E22]/10 to-transparent border border-[#E67E22]/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-[#E67E22]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ZapIcon className="w-3 h-3 text-[#E67E22]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 bg-[#E67E22]/20 rounded w-44" />
                  <div className="h-2 bg-[#2a2a2a] rounded w-full" />
                  <div className="h-2 bg-[#2a2a2a] rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 7: SOCIAL PROOF
// ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      "I went from constantly scrambling before exams to actually feeling prepared. Sunzi showed me exactly which topics I didn't know — not which topics I thought I didn't know. That distinction matters.",
    name: "Arjun M.",
    role: "CS Junior · Carnegie Mellon",
    initial: "A",
    stars: 5,
  },
  {
    quote:
      "The AI-generated quizzes are legitimately better than anything I was making myself. It's like having a study partner who's read every lecture slide — and retained all of it.",
    name: "Maya T.",
    role: "Pre-Med Sophomore · UPenn",
    initial: "M",
    stars: 5,
  },
  {
    quote:
      "I had four courses, three projects, and two exams in the same week. Sunzi's deadline planner kept me from completely losing it. I finished two assignments ahead of schedule.",
    name: "Lena K.",
    role: "Mechanical Engineering · Georgia Tech",
    initial: "L",
    stars: 5,
  },
];

const UNIVERSITIES = ["Carnegie Mellon", "UPenn", "Georgia Tech", "MIT", "Stanford", "Berkeley"];

const SocialProof = () => (
  <section className="py-24 lg:py-32 bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      <div className="text-center space-y-4 mb-16">
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">
          Student Voices
        </p>
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
          Built for ambitious students
        </h2>
        <p className="text-[#737373] text-lg max-w-md mx-auto">
          Real students using Sunzi to take back control of their semester.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 space-y-6 hover:border-[#E67E22]/20 hover:bg-[#0f0f0f] transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: t.stars }).map((_, si) => (
                <StarIcon key={si} className="w-3.5 h-3.5 text-[#E67E22]" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-[#a3a3a3] leading-relaxed text-sm italic">"{t.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-1">
              {/* TESTIMONIAL AVATAR PLACEHOLDER */}
              <div
                className="w-10 h-10 rounded-full border border-[#2a2a2a] flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(230,126,34,0.55), rgba(230,126,34,0.1))" }}
              >
                {t.initial}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-[#737373] text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* University trust bar */}
      <div className="text-center space-y-5">
        <p className="text-[#737373] text-sm">
          Students from top universities trust Sunzi
        </p>
        {/* UNIVERSITY LOGO PLACEHOLDER — replace divs with <img> tags */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {UNIVERSITIES.map((uni, i) => (
            <div
              key={i}
              className="h-7 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-5 flex items-center justify-center opacity-50 hover:opacity-75 transition-opacity duration-200"
            >
              <span className="text-[#737373] text-xs font-medium tracking-wide">{uni}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 8: FINAL CTA
// ─────────────────────────────────────────────────────────────

const FinalCTA = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="py-24 lg:py-32 bg-black">
    <div className="max-w-5xl mx-auto px-6 lg:px-8">
      <div className="relative bg-gradient-to-br from-[#E67E22]/14 via-[#0f0f0f] to-[#080808] border border-[#E67E22]/28 rounded-3xl p-12 lg:p-20 text-center overflow-hidden">

        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#E67E22]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-48 h-48 bg-[#E67E22]/6 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-7">
          <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">
            Ready to Begin
          </p>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight">
            Your semester won't wait.
            <br />
            <span className="text-[#737373] font-normal">Your grades shouldn't either.</span>
          </h2>

          <p className="text-[#737373] text-lg max-w-xl mx-auto leading-relaxed">
            Join students who stopped studying harder and started studying smarter.
            Sunzi is free to start — no credit card, no friction.
          </p>

          {/* ANALYTICS: track('final_cta_clicked') — highest-intent CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={onGetStarted}
              className="group flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#F39C12] text-black font-black text-lg px-12 py-4 rounded-2xl transition-all duration-200 hover:shadow-[0_0_45px_rgba(230,126,34,0.6)]"
            >
              Start Learning Smarter
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <p className="text-[#737373] text-xs pt-1">
            Free forever for core features&nbsp;&nbsp;·&nbsp;&nbsp;No credit card required&nbsp;&nbsp;·&nbsp;&nbsp;2 minutes to set up
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// SECTION 9: FOOTER
// ─────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="bg-[#050505] border-t border-[#1a1a1a]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        {/* Brand column */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#E67E22] rounded-lg flex items-center justify-center">
              <BookIcon className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-white font-bold text-lg">Sunzi</span>
          </div>
          <p className="text-[#737373] text-sm leading-relaxed max-w-xs">
            AI-powered academic intelligence for ambitious students.
            Know what you know. Study what matters.
          </p>
          <p className="text-[#2a2a2a] text-xs italic border-l border-[#1a1a1a] pl-3">
            "Supreme excellence consists in breaking the enemy's resistance without fighting."
            <br />— Sun Tzu, The Art of War
          </p>
        </div>

        {/* Product links */}
        <div className="space-y-4">
          <p className="text-white font-semibold text-sm">Product</p>
          <ul className="space-y-2.5">
            {["Features", "How It Works", "Pricing", "Changelog"].map((l) => (
              <li key={l}>
                <a href="#" className="text-[#737373] hover:text-[#a3a3a3] text-sm transition-colors duration-200">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div className="space-y-4">
          <p className="text-white font-semibold text-sm">Company</p>
          <ul className="space-y-2.5">
            {["About", "Blog", "Privacy", "Terms of Service"].map((l) => (
              <li key={l}>
                <a href="#" className="text-[#737373] hover:text-[#a3a3a3] text-sm transition-colors duration-200">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[#737373] text-xs">© 2026 Sunzi. All rights reserved.</p>
        <p className="text-[#2a2a2a] text-xs">Made for students who refuse to just get by.</p>
      </div>
    </div>
  </footer>
);

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// Next.js: export default from app/page.tsx
// Vite:    import LandingPage from './LandingPage' → pass onGetStarted prop
// ─────────────────────────────────────────────────────────────

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const handleGetStarted = () => {
    // ANALYTICS: track('cta_clicked', { source: 'landing_page', timestamp: Date.now() })
    if (onGetStarted) onGetStarted();
  };

  return (
    <div className="bg-black min-h-screen font-sans">

      {/* ① Navigation */}
      <Navigation onGetStarted={handleGetStarted} />

      {/* ② Hero */}
      <Hero onGetStarted={handleGetStarted} />

      {/* ③ Problem Framing */}
      <ProblemFraming />

      {/* ④ Features */}
      <Features />

      {/* ⑤ How It Works */}
      <HowItWorks onGetStarted={handleGetStarted} />

      {/* ⑥ Product Showcase */}
      <ProductShowcase onGetStarted={handleGetStarted} />

      {/* ⑦ Social Proof */}
      <SocialProof />

      {/* ⑧ Final CTA */}
      <FinalCTA onGetStarted={handleGetStarted} />

      {/* ⑨ Footer */}
      <Footer />
    </div>
  );
}
