/**
 * Sunzi — AI-Powered Academic Assistant
 * Landing Page  ·  Apple-inspired scroll experience
 *
 * Scroll system:
 *   • Parallax orbs  — rAF-batched scroll listener on data-parallax elements
 *   • Scale reveal   — IntersectionObserver → .is-visible (scale 0.94→1 + fade)
 *   • Hero lines     — Sequential line-by-line fade-up on mount
 *   • Sticky HiW     — Left column scrolls; right panel stays pinned, active step tracked by observer
 *
 * Typography: Crimson Pro (serif) headings · Inter body
 * Motion:     prefers-reduced-motion respected via index.html CSS
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// ─────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────

const TargetIcon  = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const ZapIcon     = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const MessageIcon  = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CheckIcon    = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const MenuIcon     = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon        = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const StarIcon     = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const BookIcon     = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const AlertIcon    = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const EyeOffIcon   = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ClockIcon    = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const QuoteIcon    = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);


// ─────────────────────────────────────────────────────────────
// SECTION 1: NAVIGATION
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = ["Features", "How It Works", "Pricing"];

const Navigation = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-black/92 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(230,126,34,0.06)]"
        : "bg-black/30 backdrop-blur-md border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-8 h-8 bg-[#E67E22] rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(230,126,34,0.4)] group-hover:shadow-[0_0_28px_rgba(230,126,34,0.65)] transition-shadow duration-300">
              <BookIcon className="w-4 h-4 text-black" />
            </div>
            <span className="font-serif font-semibold text-xl text-[#F0EDE8] tracking-wide">
              Sunzi
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((label) => (
              <button
                key={label}
                onClick={() => scrollTo(label.toLowerCase().replace(/ /g, "-"))}
                className="text-[#9A9490] hover:text-[#F0EDE8] text-sm font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22] rounded"
              >
                {label}
              </button>
            ))}
            <button className="text-[#9A9490] hover:text-[#F0EDE8] text-sm font-medium transition-colors duration-200 cursor-pointer">
              Login
            </button>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <button
              onClick={onGetStarted}
              className="bg-[#E67E22] hover:bg-[#F39C12] text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(230,126,34,0.5)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#9A9490] hover:text-white p-1 transition-colors cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-black/98 backdrop-blur-2xl">
          <div className="px-6 py-5 space-y-4">
            {[...NAV_LINKS, "Login"].map((label) => (
              <button
                key={label}
                onClick={() => scrollTo(label.toLowerCase().replace(/ /g, "-"))}
                className="block text-left w-full text-[#9A9490] hover:text-[#F0EDE8] text-sm font-medium py-1.5 transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
            <button
              onClick={onGetStarted}
              className="w-full bg-[#E67E22] hover:bg-[#F39C12] text-black font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 mt-2 cursor-pointer"
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

const HERO_COURSES = [
  { label: "Calculus II",     pct: 78, color: "#E67E22" },
  { label: "Linear Algebra",  pct: 54, color: "#F39C12" },
  { label: "Data Structures", pct: 91, color: "#10b981" },
  { label: "Thermodynamics",  pct: 32, color: "#ef4444" },
];

const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Trigger hero-line animations shortly after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll(".hero-line").forEach((el) =>
        el.classList.add("is-visible")
      );
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center bg-black overflow-hidden pt-16">

      {/* ── Parallax ambient orbs ── */}
      <div
        data-parallax="0.18"
        className="absolute top-[-120px] left-[-80px] w-[680px] h-[680px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%)", willChange: "transform" }}
      />
      <div
        data-parallax="0.28"
        className="absolute bottom-[-100px] right-[-60px] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(230,126,34,0.07) 0%, transparent 70%)", willChange: "transform" }}
      />
      <div
        data-parallax="0.1"
        className="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)", willChange: "transform" }}
      />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* LEFT: Copy */}
          <div className="space-y-8">

            {/* Badge — hero-line */}
            <div className="hero-line hero-line-d1">
              <div className="inline-flex items-center gap-2.5 bg-[#0f0f0f]/80 border border-[#E67E22]/22 rounded-full px-4 py-1.5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E67E22] animate-pulse" />
                <span className="text-[#E67E22] text-xs font-semibold tracking-widest uppercase">
                  AI-Powered Academic Assistant
                </span>
              </div>
            </div>

            {/* Headline — each line is an independent hero-line */}
            <div className="space-y-1">
              <div className="hero-line hero-line-d2">
                <h1 className="font-serif text-5xl lg:text-[3.75rem] xl:text-[4.5rem] font-bold text-[#F0EDE8] leading-[1.06] tracking-[-0.015em]">
                  Know What You've
                </h1>
              </div>
              <div className="hero-line hero-line-d3">
                <h1 className="font-serif text-5xl lg:text-[3.75rem] xl:text-[4.5rem] font-bold leading-[1.06] tracking-[-0.015em]"
                  style={{ color: "#E67E22", textShadow: "0 0 60px rgba(230,126,34,0.28)" }}
                >
                  Mastered.
                </h1>
              </div>
              <div className="hero-line hero-line-d4">
                <h1 className="font-serif text-5xl lg:text-[3.75rem] xl:text-[4.5rem] font-bold text-[#F0EDE8] leading-[1.06] tracking-[-0.015em]">
                  Study What{" "}
                  <span className="text-[#5A5652] font-light italic">Actually Matters.</span>
                </h1>
              </div>
            </div>

            {/* Subheadline */}
            <div className="hero-line hero-line-d5">
              <p className="text-[#9A9490] text-lg lg:text-xl leading-[1.75] max-w-[500px]">
                Sunzi tracks your understanding across every course, generates
                adaptive quizzes from your actual material, and builds a
                deadline-aware study plan — so you always know your next move.
              </p>
            </div>

            {/* CTAs — hero-line */}
            <div className="hero-line hero-line-d5 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center justify-center gap-2.5 bg-[#E67E22] hover:bg-[#F39C12] text-black font-bold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-[0_0_44px_rgba(230,126,34,0.6)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22]"
              >
                Get Started — Free
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 border border-[#222] hover:border-[#E67E22]/40 text-[#9A9490] hover:text-[#F0EDE8] font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:bg-white/[0.025] cursor-pointer"
              >
                See How It Works
              </button>
            </div>

            {/* Social proof */}
            <div className="hero-line hero-line-d5 flex items-center gap-4 pt-1">
              <div className="flex -space-x-2.5">
                {["A", "M", "L", "J"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, rgba(230,126,34,${0.4 + i * 0.1}), rgba(212,168,83,0.15))` }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-[#5A5652] text-sm">
                <span className="text-[#F0EDE8] font-semibold">500+ students</span>{" "}
                tracking mastery this semester
              </p>
            </div>
          </div>

          {/* RIGHT: Mock dashboard */}
          <div className="relative hero-line hero-line-d3">

            {/* Card */}
            <div className="relative rounded-2xl border border-[#1e1e1e] bg-[#080808] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.95)] transition-shadow duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.95),0_0_80px_rgba(230,126,34,0.07)]">

              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#141414] bg-[#050505]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]/40" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]/40" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]/40" />
                </div>
                <div className="flex-1 mx-4 bg-[#141414] rounded h-5 max-w-[200px] flex items-center px-3">
                  <div className="h-1.5 bg-[#222] rounded w-24" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-3 bg-[#1e1e1e] rounded w-28" />
                    <div className="h-2 bg-[#141414] rounded w-20" />
                  </div>
                  <div className="h-7 bg-[#E67E22]/10 border border-[#E67E22]/18 rounded-lg px-3 flex items-center">
                    <div className="h-2 bg-[#E67E22]/35 rounded w-16" />
                  </div>
                </div>

                <div className="space-y-3">
                  {HERO_COURSES.map((course) => (
                    <div key={course.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#9A9490] text-xs font-medium">{course.label}</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: course.color }}>{course.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#141414] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${course.pct}%`, backgroundColor: course.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-[#E67E22]/10 to-transparent border border-[#E67E22]/16 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E67E22]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ZapIcon className="w-3 h-3 text-[#E67E22]" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 bg-[#E67E22]/20 rounded w-40" />
                    <div className="h-2 bg-[#222] rounded w-full" />
                    <div className="h-2 bg-[#222] rounded w-3/4" />
                  </div>
                </div>

                <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#E67E22]/15 rounded" />
                    <div className="h-2.5 bg-[#222] rounded w-44" />
                  </div>
                  <div className="space-y-1.5">
                    {[80, 60, 90].map((w, i) => (
                      <div key={i} className="h-2 bg-[#1e1e1e] rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <div className="h-8 bg-[#E67E22]/10 border border-[#E67E22]/20 rounded-xl flex-1" />
                    <div className="h-8 bg-[#1e1e1e] rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-5 top-[30%] bg-[#0c0c0c]/95 border border-[#1e1e1e] rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#E67E22]/10 rounded-xl flex items-center justify-center">
                  <TargetIcon className="w-4 h-4 text-[#E67E22]" />
                </div>
                <div>
                  <p className="text-[#F0EDE8] font-bold text-sm leading-none">78%</p>
                  <p className="text-[#5A5652] text-xs mt-0.5">Avg Mastery</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-5 bottom-[30%] bg-[#0c0c0c]/95 border border-[#1e1e1e] rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-[#F0EDE8] font-bold text-sm leading-none">3 days</p>
                  <p className="text-[#5A5652] text-xs mt-0.5">Ahead of schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// ─────────────────────────────────────────────────────────────
// STATS BAR  (Apple-style trust numbers)
// ─────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+",   label: "Students enrolled" },
  { value: "4.9★",  label: "Average rating" },
  { value: "3×",    label: "GPA improvement reported" },
  { value: "2 min", label: "To set up a course" },
];

const StatsBar = () => (
  <section className="py-16 lg:py-20 bg-[#050505] border-y border-[#111]">
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`stat-item reveal text-center ${i > 0 ? "lg:border-l lg:border-[#141414]" : ""}`}
            data-reveal
          >
            <div className="stat-value font-serif text-4xl lg:text-5xl font-bold text-[#E67E22] mb-2">
              {s.value}
            </div>
            <div className="text-[#5A5652] text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);


// ─────────────────────────────────────────────────────────────
// SECTION 3: PROBLEM FRAMING
// ─────────────────────────────────────────────────────────────

const PROBLEMS = [
  { Icon: BookIcon,   title: "You cram the night before.",        description: "And forget everything by the final. Short-term memory isn't a study strategy — it's a survival tactic that costs you when the stakes are highest." },
  { Icon: EyeOffIcon, title: "You don't know what you don't know.", description: "Hours of studying feel productive, but you never truly know which concepts are solid and which ones will trip you up on the exam." },
  { Icon: ClockIcon,  title: "Deadlines blindside you.",           description: "With four courses, three projects, and two exams, nothing stays organized in your head. Something always slips — usually at the worst time." },
  { Icon: AlertIcon,  title: "The overwhelm is structural.",       description: "You're not falling behind because you're not smart. You're falling behind because the system is chaotic and you have no map. Sunzi is the map." },
];

const ProblemFraming = () => (
  <section className="py-28 lg:py-36 bg-black relative overflow-hidden">
    <div className="absolute inset-0 dot-grid opacity-35 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">

      <div className="text-center space-y-5 mb-20 reveal-fade" data-reveal>
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">The Problem</p>
        <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-[#F0EDE8] tracking-tight">
          Sound familiar?
        </h2>
        <p className="text-[#5A5652] text-lg max-w-lg mx-auto leading-relaxed">
          Most students don't fail from lack of intelligence.
          <br />They fail from lack of structure.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {PROBLEMS.map(({ Icon, title, description }, i) => (
          <div
            key={i}
            className={`group bg-[#060606] border border-[#111] rounded-2xl p-7 space-y-4 hover:border-[#E67E22]/18 hover:bg-[#0a0a0a] transition-all duration-500 cursor-default reveal reveal-d${i + 1}`}
            data-reveal
          >
            <div className="w-10 h-10 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center group-hover:border-[#E67E22]/22 transition-colors duration-300">
              <Icon className="w-5 h-5 text-[#5A5652] group-hover:text-[#E67E22] transition-colors duration-300" />
            </div>
            <h3 className="font-serif text-[#F0EDE8] font-semibold text-lg leading-snug">{title}</h3>
            <p className="text-[#5A5652] text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      <div className="text-center space-y-5 reveal-fade" data-reveal>
        <div className="flex items-center justify-center gap-5">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#E67E22]/45" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#E67E22]/55 animate-pulse-orange" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#E67E22]/45" />
        </div>
        <p className="font-serif text-3xl lg:text-4xl font-bold text-[#F0EDE8]">
          Sunzi gives you the map.
        </p>
        <p className="text-[#5A5652] text-lg max-w-lg mx-auto leading-relaxed">
          Adaptive AI that understands your semester, tracks your mastery in real time,
          and keeps you ahead — not just afloat.
        </p>
      </div>
    </div>
  </section>
);


// ─────────────────────────────────────────────────────────────
// SECTION 4: FEATURES
// ─────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: TargetIcon,   tag: "Precision Learning",      title: "Adaptive Mastery Tracking",       description: "Know exactly where you stand — not where you think you stand. Sunzi maps your real understanding across every topic in every course, so you study with surgical precision instead of anxious guesswork." },
  { Icon: ZapIcon,      tag: "Active Recall",           title: "AI Quizzes & Flashcards",          description: "Generated from your actual course material, not generic internet content. Sunzi creates targeted practice problems using spaced-repetition science — reinforcing exactly what you need, when you need it most." },
  { Icon: CalendarIcon, tag: "Always Ahead",            title: "Deadline-Aware Study Planning",    description: "Your study schedule builds itself around your real calendar. Sunzi knows when exams and assignments land, works backwards, and keeps you prepared before the pressure hits — not during it." },
  { Icon: MessageIcon,  tag: "Contextual Intelligence", title: "Course-Specific AI Chat",          description: "Ask anything about your coursework and get answers grounded in your own syllabus and lecture notes. Not generic AI — an AI that has read everything your professor assigned and remembers all of it." },
];

const Features = () => (
  <section id="features" className="py-28 lg:py-36 bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      <div className="text-center space-y-5 mb-20 reveal-fade" data-reveal>
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">Features</p>
        <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-[#F0EDE8] tracking-tight">
          Built for how students actually learn
        </h2>
        <p className="text-[#5A5652] text-lg max-w-xl mx-auto leading-relaxed">
          Every feature is designed around one goal: help you understand more in less time — with no guesswork.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {FEATURES.map(({ Icon, tag, title, description }, i) => (
          <div
            key={i}
            className={`group relative rounded-2xl p-10 space-y-5 cursor-default reveal reveal-d${(i % 2) + 1} transition-all duration-500`}
            data-reveal
            style={{ background: "#060606", border: "1px solid #111" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(230,126,34,0.22)";
              e.currentTarget.style.background = "#0a0a0a";
              e.currentTarget.style.boxShadow = "inset 0 0 60px rgba(230,126,34,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#111";
              e.currentTarget.style.background = "#060606";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E67E22]/5 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-12 h-12 bg-[#E67E22]/8 border border-[#E67E22]/16 rounded-2xl flex items-center justify-center group-hover:bg-[#E67E22]/14 group-hover:border-[#E67E22]/30 transition-all duration-300">
              <Icon className="w-6 h-6 text-[#E67E22]" />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-serif text-[#F0EDE8] font-semibold text-xl">{title}</h3>
                <span className="text-xs font-semibold text-[#E67E22] bg-[#E67E22]/8 border border-[#E67E22]/16 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                  {tag}
                </span>
              </div>
              <p className="text-[#5A5652] leading-relaxed text-[0.94rem]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);


// ─────────────────────────────────────────────────────────────
// SECTION 5: HOW IT WORKS  (Apple sticky scroll)
// ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Add Your Courses",
    description: "Upload your syllabi, add your course list, and tell Sunzi your exam dates. It'll understand your entire semester in minutes — then get to work building your structure.",
    detail: "Supports PDF syllabi, manual entry, and smart deadline parsing.",
    mockType: "course-list" as const,
  },
  {
    number: "02",
    title: "Track Your Mastery",
    description: "As you study and take AI-generated quizzes, Sunzi builds a real-time map of what you know and what still needs work. Honest feedback, delivered without pressure.",
    detail: "Updated after every session. Detailed breakdowns by topic and subtopic.",
    mockType: "mastery-map" as const,
  },
  {
    number: "03",
    title: "Study Smarter with AI",
    description: "Get a personalized study plan calibrated to your actual gaps, upcoming deadlines, and available hours. Ask Sunzi anything about your courses — it answers from your own material.",
    detail: "AI chat grounded in your syllabus. Plans that adapt as you improve.",
    mockType: "ai-chat" as const,
  },
];

/** Mock UI shown in the sticky right panel — changes per active step */
const StepMockUI = ({ type }: { type: "course-list" | "mastery-map" | "ai-chat" }) => {
  if (type === "course-list") {
    return (
      <div className="space-y-2">
        {["Calculus II", "Linear Algebra", "Data Structures", "Thermodynamics"].map((c, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#111] rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-[#E67E22]" />
            <span className="text-[#9A9490] text-xs font-medium">{c}</span>
            <div className="flex-1" />
            <div className="h-2 bg-[#E67E22]/20 rounded w-16" />
          </div>
        ))}
        <div className="pt-2">
          <div className="h-10 bg-[#E67E22]/10 border border-[#E67E22]/20 rounded-xl flex items-center justify-center">
            <div className="h-2 w-24 bg-[#E67E22]/40 rounded" />
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
      <div className="space-y-4">
        {topics.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#9A9490] text-xs">{t.name}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: t.color }}>{t.pct}%</span>
            </div>
            <div className="h-2 bg-[#141414] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${t.pct}%`, backgroundColor: t.color }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-[#111] rounded-2xl rounded-tl-sm p-3 max-w-[88%]">
        <div className="space-y-1.5">
          <div className="h-2 bg-[#1e1e1e] rounded w-full" />
          <div className="h-2 bg-[#1e1e1e] rounded w-3/4" />
        </div>
      </div>
      <div className="bg-[#E67E22]/10 border border-[#E67E22]/16 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto">
        <div className="space-y-1.5">
          <div className="h-2 bg-[#E67E22]/32 rounded w-full" />
          <div className="h-2 bg-[#E67E22]/32 rounded w-2/3" />
        </div>
      </div>
      <div className="bg-[#111] rounded-2xl rounded-tl-sm p-3 max-w-[92%]">
        <div className="space-y-1.5">
          <div className="h-2 bg-[#1e1e1e] rounded w-full" />
          <div className="h-2 bg-[#1e1e1e] rounded w-4/5" />
          <div className="h-2 bg-[#1e1e1e] rounded w-3/5" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-[#111] border border-[#1e1e1e] rounded-xl" />
        <div className="w-9 h-9 bg-[#E67E22]/14 border border-[#E67E22]/22 rounded-xl flex items-center justify-center">
          <ArrowRightIcon className="w-3.5 h-3.5 text-[#E67E22]" />
        </div>
      </div>
    </div>
  );
};

const HowItWorks = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stepEls = document.querySelectorAll("[data-step-trigger]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.stepTrigger || "0");
            setActiveStep(idx);
          }
        });
      },
      { threshold: 0.55, rootMargin: "-10% 0px -10% 0px" }
    );
    stepEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-28 lg:py-36 bg-black relative overflow-clip">
      <div className="absolute inset-0 dot-grid opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center space-y-5 mb-24 reveal-fade" data-reveal>
          <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">How It Works</p>
          <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-[#F0EDE8] tracking-tight">
            From chaos to clarity
            <br />
            <span className="text-[#5A5652] font-light italic">in three steps</span>
          </h2>
        </div>

        {/* Mobile: stacked layout */}
        <div className="lg:hidden space-y-16">
          {STEPS.map((step, i) => (
            <div key={i} className="space-y-8 reveal" data-reveal>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-6xl font-bold text-[#E67E22]/14 tabular-nums leading-none select-none">{step.number}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#E67E22]/28 to-transparent" />
                </div>
                <h3 className="font-serif text-2xl lg:text-3xl font-bold text-[#F0EDE8]">{step.title}</h3>
                <p className="text-[#9A9490] text-base leading-[1.75]">{step.description}</p>
                <div className="flex items-start gap-3 bg-[#060606] border border-[#111] rounded-xl p-4">
                  <CheckIcon className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <p className="text-[#5A5652] text-sm leading-relaxed">{step.detail}</p>
                </div>
              </div>
              {/* Mock UI inline on mobile */}
              <div className="rounded-2xl border border-[#141414] bg-[#060606] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#141414] bg-[#040404]">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(j => <div key={j} className="w-2.5 h-2.5 rounded-full bg-[#141414]" />)}
                  </div>
                  <div className="flex-1 mx-3 bg-[#141414] rounded h-4 max-w-[160px]" />
                </div>
                <div className="p-5 min-h-[200px]"><StepMockUI type={step.mockType} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: sticky layout */}
        <div className="hidden lg:grid grid-cols-2 gap-20">

          {/* Left: scrollable steps */}
          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div
                key={i}
                data-step-trigger={i}
                className={`min-h-[70vh] flex items-center py-12 transition-all duration-500 ${
                  activeStep === i ? "opacity-100" : "opacity-35"
                }`}
              >
                <div className="space-y-6 w-full">
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-7xl font-bold tabular-nums leading-none select-none"
                      style={{ color: activeStep === i ? "rgba(230,126,34,0.3)" : "rgba(255,255,255,0.06)" }}
                    >
                      {step.number}
                    </span>
                    <div className="h-px flex-1"
                      style={{ background: activeStep === i ? "linear-gradient(to right, rgba(230,126,34,0.4), transparent)" : "linear-gradient(to right, rgba(255,255,255,0.06), transparent)" }}
                    />
                  </div>
                  <h3 className="font-serif text-3xl lg:text-4xl font-bold text-[#F0EDE8]">{step.title}</h3>
                  <p className="text-[#9A9490] text-lg leading-[1.75]">{step.description}</p>
                  <div className="flex items-start gap-3 bg-[#060606] border border-[#111] rounded-xl p-4">
                    <CheckIcon className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <p className="text-[#5A5652] text-sm leading-relaxed">{step.detail}</p>
                  </div>
                  {i === 2 && (
                    <button
                      onClick={onGetStarted}
                      className="group flex items-center gap-2 bg-[#E67E22] hover:bg-[#F39C12] text-black font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_28px_rgba(230,126,34,0.5)] cursor-pointer"
                    >
                      Get Started Now
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right: sticky panel */}
          <div>
           <div className="sticky top-0 h-[70vh] flex items-center w-full">
            <div
              className="relative rounded-2xl border bg-[#060606] overflow-hidden transition-all duration-700 ease-out w-full"
              style={{
                minHeight: "420px",
                borderColor: `rgba(230,126,34,${activeStep === 0 ? 0.12 : activeStep === 1 ? 0.08 : 0.15})`,
                boxShadow: `0 24px 80px rgba(0,0,0,0.85), 0 0 40px rgba(230,126,34,${activeStep * 0.03 + 0.02})`,
              }}
            >

              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#141414] bg-[#040404]">
                <div className="flex gap-1.5">
                  {[0,1,2].map(j => <div key={j} className="w-2.5 h-2.5 rounded-full bg-[#141414]" />)}
                </div>
                <div className="flex-1 mx-3 bg-[#141414] rounded h-4 max-w-[180px]" />
              </div>

              {/* Panels — absolute stacked, animated in/out */}
              <div className="relative" style={{ minHeight: "380px" }}>
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`step-panel p-7 ${activeStep === i ? "active" : ""}`}
                  >
                    {/* Step label */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-5 h-5 rounded-full bg-[#E67E22]/15 border border-[#E67E22]/25 flex items-center justify-center">
                        <span className="text-[#E67E22] text-[10px] font-bold">{i + 1}</span>
                      </div>
                      <span className="text-[#5A5652] text-xs font-medium uppercase tracking-wider">{step.title}</span>
                    </div>
                    <StepMockUI type={step.mockType} />
                  </div>
                ))}
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 pb-4">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-400"
                    style={{
                      width: activeStep === i ? "20px" : "6px",
                      height: "6px",
                      background: activeStep === i ? "#E67E22" : "#222",
                    }}
                  />
                ))}
              </div>
            </div>
           </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// ─────────────────────────────────────────────────────────────
// SECTION 6: PRODUCT SHOWCASE
// ─────────────────────────────────────────────────────────────

const DASHBOARD_FEATURES = [
  "Mastery scores by course and topic",
  "Upcoming deadlines ranked by urgency",
  "AI-recommended next study actions",
  "Quiz history and improvement trends",
];
const DASHBOARD_STATS   = [
  { label: "Avg Mastery",  value: "72%",     color: "#E67E22" },
  { label: "Study Streak", value: "12 days",  color: "#10b981" },
  { label: "Next Exam",    value: "3 days",   color: "#f59e0b" },
];
const DASHBOARD_COURSES = [
  { name: "Calculus II",     pct: 78, color: "#E67E22" },
  { name: "Linear Algebra",  pct: 54, color: "#F39C12" },
  { name: "Data Structures", pct: 91, color: "#10b981" },
  { name: "Thermodynamics",  pct: 32, color: "#ef4444" },
];

const ProductShowcase = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="py-28 lg:py-36 bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div
        className="rounded-3xl overflow-hidden reveal"
        data-reveal
        style={{
          background: "linear-gradient(135deg, #0c0c0c 0%, #080808 60%, #050808 100%)",
          border: "1px solid rgba(230,126,34,0.16)",
          boxShadow: "0 0 120px rgba(230,126,34,0.04), inset 0 0 0 1px rgba(255,255,255,0.025)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="p-10 lg:p-16 flex flex-col justify-center space-y-7">
            <div>
              <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase mb-4">The Dashboard</p>
              <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-bold text-[#F0EDE8] leading-tight">
                Everything you need.{" "}
                <span className="text-[#5A5652] font-light italic">Nothing you don't.</span>
              </h2>
            </div>
            <p className="text-[#5A5652] text-lg leading-[1.75]">
              Your Sunzi dashboard gives you a clear, honest view of exactly where you stand
              across every course — so you can make intentional decisions about how to spend every study hour.
            </p>
            <ul className="space-y-3.5">
              {DASHBOARD_FEATURES.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/22 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-[#E67E22]" />
                  </div>
                  <span className="text-[#9A9490] text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onGetStarted}
              className="self-start group flex items-center gap-2 bg-[#E67E22] hover:bg-[#F39C12] text-black font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_32px_rgba(230,126,34,0.55)] cursor-pointer"
            >
              See Your Dashboard
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Right: Mock */}
          <div className="relative bg-[#060606] border-l border-[#141414] overflow-hidden min-h-[460px]">
            <div className="absolute top-0 right-0 w-56 h-56 bg-[#E67E22]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#141414] bg-[#040404]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/28" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/28" />
                <div className="w-3 h-3 rounded-full bg-[#10b981]/28" />
              </div>
              <div className="flex-1 mx-3 bg-[#141414] rounded h-4 max-w-[200px] flex items-center px-3">
                <div className="h-1.5 bg-[#1e1e1e] rounded w-24" />
              </div>
            </div>
            <div className="p-6 space-y-4 relative">
              <div className="grid grid-cols-3 gap-3">
                {DASHBOARD_STATS.map((s, i) => (
                  <div key={i} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-3 space-y-1.5">
                    <p className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                    <div className="h-2 bg-[#1e1e1e] rounded w-3/4" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {DASHBOARD_COURSES.map((c, i) => (
                  <div key={i} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#9A9490] text-xs font-medium">{c.name}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#080808] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-[#E67E22]/10 to-transparent border border-[#E67E22]/16 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-[#E67E22]/14 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ZapIcon className="w-3 h-3 text-[#E67E22]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 bg-[#E67E22]/20 rounded w-44" />
                  <div className="h-2 bg-[#1e1e1e] rounded w-full" />
                  <div className="h-2 bg-[#1e1e1e] rounded w-3/4" />
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
  { quote: "I went from constantly scrambling before exams to actually feeling prepared. Sunzi showed me exactly which topics I didn't know — not which topics I thought I didn't know. That distinction matters.", name: "Arjun M.",  role: "CS Junior · Carnegie Mellon",              initial: "A", stars: 5 },
  { quote: "The AI-generated quizzes are legitimately better than anything I was making myself. It's like having a study partner who's read every lecture slide — and retained all of it.",                        name: "Maya T.",  role: "Pre-Med Sophomore · UPenn",               initial: "M", stars: 5 },
  { quote: "I had four courses, three projects, and two exams in the same week. Sunzi's deadline planner kept me from completely losing it. I finished two assignments ahead of schedule.",                       name: "Lena K.",  role: "Mechanical Engineering · Georgia Tech",  initial: "L", stars: 5 },
];

const UNIVERSITIES = ["Carnegie Mellon", "UPenn", "Georgia Tech", "MIT", "Stanford", "Berkeley"];

const SocialProof = () => (
  <section className="py-28 lg:py-36 bg-black relative overflow-hidden">
    <div className="absolute inset-0 dot-grid opacity-35 pointer-events-none" />
    {/* Soft glow behind testimonials */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, rgba(230,126,34,0.04) 0%, transparent 70%)" }} />

    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">

      <div className="text-center space-y-5 mb-20 reveal-fade" data-reveal>
        <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">Student Voices</p>
        <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-[#F0EDE8] tracking-tight">
          Built for ambitious students
        </h2>
        <p className="text-[#5A5652] text-lg max-w-md mx-auto leading-relaxed">
          Real students using Sunzi to take back control of their semester.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className={`flex flex-col space-y-6 rounded-2xl p-8 cursor-default reveal reveal-d${i + 1}`}
            data-reveal
            style={{ background: "#060606", border: "1px solid #111" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(230,126,34,0.16)";
              e.currentTarget.style.background = "#0a0a0a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#111";
              e.currentTarget.style.background = "#060606";
            }}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, si) => (
                <StarIcon key={si} className="w-3.5 h-3.5 text-[#E67E22]" />
              ))}
            </div>
            <div className="flex-1 space-y-3">
              <QuoteIcon className="w-5 h-5 text-[#E67E22]/25" />
              <p className="font-serif text-[#9A9490] leading-[1.72] text-base italic">"{t.quote}"</p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-[#111]">
              <div
                className="w-10 h-10 rounded-full border border-[#222] flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(230,126,34,0.5), rgba(212,168,83,0.12))" }}
              >
                {t.initial}
              </div>
              <div>
                <p className="text-[#F0EDE8] font-semibold text-sm">{t.name}</p>
                <p className="text-[#5A5652] text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-5 reveal-fade" data-reveal>
        <p className="text-[#5A5652] text-sm tracking-wide">Students from top universities trust Sunzi</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {UNIVERSITIES.map((uni, i) => (
            <div
              key={i}
              className="h-7 bg-[#060606] border border-[#111] rounded-lg px-5 flex items-center justify-center opacity-35 hover:opacity-60 transition-opacity duration-300"
            >
              <span className="text-[#9A9490] text-xs font-medium tracking-wide">{uni}</span>
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
  <section className="py-28 lg:py-36 bg-[#050505]">
    <div className="max-w-5xl mx-auto px-6 lg:px-8">
      <div
        className="relative rounded-3xl p-14 lg:p-24 text-center overflow-hidden reveal"
        data-reveal
        style={{
          background: "linear-gradient(150deg, rgba(230,126,34,0.09) 0%, #0a0a0a 45%, #060808 100%)",
          border: "1px solid rgba(230,126,34,0.22)",
          boxShadow: "0 0 140px rgba(230,126,34,0.06), inset 0 0 0 1px rgba(255,255,255,0.02)",
        }}
      >
        {/* Glow orbs */}
        <div
          data-parallax="-0.06"
          className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%)", willChange: "transform" }}
        />
        <div className="absolute -bottom-12 right-1/4 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)" }} />

        {/* Top divider line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-px bg-gradient-to-r from-transparent via-[#E67E22]/55 to-transparent" />

        <div className="relative space-y-8">
          <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">Ready to Begin</p>

          <h2 className="font-serif text-4xl lg:text-5xl xl:text-7xl font-bold text-[#F0EDE8] leading-tight">
            Your semester won't wait.
            <br />
            <span className="text-[#5A5652] font-light italic">Your grades shouldn't either.</span>
          </h2>

          <p className="text-[#5A5652] text-lg max-w-xl mx-auto leading-[1.75]">
            Join students who stopped studying harder and started studying smarter.
            Sunzi is free to start — no credit card, no friction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={onGetStarted}
              className="group flex items-center justify-center gap-2.5 bg-[#E67E22] hover:bg-[#F39C12] text-black font-black text-lg px-14 py-5 rounded-2xl transition-all duration-200 hover:shadow-[0_0_60px_rgba(230,126,34,0.7)] cursor-pointer"
            >
              Start Learning Smarter
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <p className="text-[#5A5652] text-xs pt-2 tracking-wide opacity-70">
            Free forever for core features&nbsp;&nbsp;·&nbsp;&nbsp;No credit card&nbsp;&nbsp;·&nbsp;&nbsp;2 minutes to set up
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
  <footer className="bg-[#030303] border-t border-[#0f0f0f]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#E67E22] rounded-lg flex items-center justify-center">
              <BookIcon className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-serif font-semibold text-lg text-[#F0EDE8]">Sunzi</span>
          </div>
          <p className="text-[#5A5652] text-sm leading-relaxed max-w-xs">
            AI-powered academic intelligence for ambitious students.
            Know what you know. Study what matters.
          </p>
          <blockquote className="relative pl-4 border-l-2 border-[#E67E22]/30">
            <p className="font-serif text-sm italic text-[#5A5652] leading-relaxed">
              "Supreme excellence consists in breaking the enemy's resistance without fighting."
            </p>
            <cite className="block mt-1.5 text-xs text-[#3A3632] not-italic tracking-wide">
              — Sun Tzu, The Art of War
            </cite>
          </blockquote>
        </div>

        <div className="space-y-4">
          <p className="text-[#F0EDE8] font-semibold text-sm">Product</p>
          <ul className="space-y-2.5">
            {["Features", "How It Works", "Pricing", "Changelog"].map((l) => (
              <li key={l}>
                <a href="#" className="text-[#5A5652] hover:text-[#9A9490] text-sm transition-colors duration-200">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-[#F0EDE8] font-semibold text-sm">Company</p>
          <ul className="space-y-2.5">
            {["About", "Blog", "Privacy", "Terms of Service"].map((l) => (
              <li key={l}>
                <a href="#" className="text-[#5A5652] hover:text-[#9A9490] text-sm transition-colors duration-200">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#0f0f0f] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[#2A2622] text-xs">© 2026 Sunzi. All rights reserved.</p>
        <p className="font-serif text-[#2A2622] text-xs italic">Made for students who refuse to just get by.</p>
      </div>
    </div>
  </footer>
);


// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // ── 1. Scale-based scroll reveal (IntersectionObserver) ──
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => revealObs.observe(el));

    // ── 2. rAF-batched parallax scroll ──
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
            const speed = parseFloat(el.dataset.parallax ?? "0.2");
            el.style.transform = `translateY(${y * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      revealObs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleGetStarted = () => {
    login();
    navigate("/home");
  };

  return (
    <div className="bg-black min-h-screen font-sans">
      <Navigation onGetStarted={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <StatsBar />
      <ProblemFraming />
      <Features />
      <HowItWorks onGetStarted={handleGetStarted} />
      <ProductShowcase onGetStarted={handleGetStarted} />
      <SocialProof />
      <FinalCTA onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}
