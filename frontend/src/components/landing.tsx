import {
  ArrowRight,
  Sparkles,
  Users,
  Palette,
  BarChart3,
  Zap,
  Terminal,
  RefreshCw,
  Layers,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import Footer from "./parts/footer";

import { Button } from "@/components/ui/button";
import { queries } from "@/api/appApi";
import { useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import { redirectToGithubOAuth } from "@/utils/utils";

const transformToKMB = (num: number): string => {
  if (num < 1000) {
    return Math.floor(num / 10).toString() + "0";
  }

  if (num < 1_000_000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  if (num < 1_000_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
};

// ── Text Scramble Hook ──
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";

function useTextScramble(words: string[], interval = 3000) {
  const [display, setDisplay] = useState(words[0]);
  const indexRef = useRef(0);

  const scramble = useCallback(() => {
    indexRef.current = (indexRef.current + 1) % words.length;
    const target = words[indexRef.current];
    let iteration = 0;
    const maxLen = Math.max(display.length, target.length);

    const timer = setInterval(() => {
      setDisplay(
        target
          .split("")
          .map((char, i) => {
            if (i < iteration) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
          .slice(0, Math.max(maxLen, target.length)),
      );

      iteration += 1 / 2;

      if (iteration >= target.length) {
        clearInterval(timer);
        setDisplay(target);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [words, display.length]);

  useEffect(() => {
    const id = setInterval(scramble, interval);
    return () => clearInterval(id);
  }, [scramble, interval]);

  return display;
}

// ── Fake code lines for the terminal visual ──
const CODE_LINES = [
  {
    indent: 0,
    text: "# Fetching GitHub profile data...",
    color: "text-zinc-500",
  },
  { indent: 0, text: "", color: "" },
  { indent: 0, text: "user:", color: "text-emerald-400" },
  { indent: 2, text: 'username: "abhinav550"', color: "text-zinc-300" },
  { indent: 2, text: "repos: 42", color: "text-zinc-300" },
  { indent: 2, text: "followers: 1.2K", color: "text-zinc-300" },
  { indent: 2, text: "contributions: 847", color: "text-zinc-300" },
  { indent: 0, text: "", color: "" },
  { indent: 0, text: "languages:", color: "text-emerald-400" },
  { indent: 2, text: "TypeScript: 38.4%", color: "text-sky-400" },
  { indent: 2, text: "Python: 24.7%", color: "text-sky-400" },
  { indent: 2, text: "Go: 18.1%", color: "text-sky-400" },
  { indent: 2, text: "Rust: 11.6%", color: "text-sky-400" },
  { indent: 2, text: "Other: 7.2%", color: "text-sky-400" },
  { indent: 0, text: "", color: "" },
  { indent: 0, text: "cards:", color: "text-emerald-400" },
  { indent: 2, text: "profile_card: generating...", color: "text-zinc-300" },
  { indent: 2, text: "stats_card: generating...", color: "text-zinc-300" },
  { indent: 2, text: "language_card: generating...", color: "text-zinc-300" },
  { indent: 0, text: "", color: "" },
  { indent: 0, text: "output:", color: "text-emerald-400" },
  { indent: 2, text: 'format: "svg"', color: "text-zinc-300" },
  { indent: 2, text: 'theme: "dark"', color: "text-zinc-300" },
  { indent: 2, text: 'cache: "24h"', color: "text-zinc-300" },
  { indent: 0, text: "", color: "" },
  { indent: 0, text: "status: ready", color: "text-emerald-400" },
];

const Landing = () => {
  const { data: appUsersData, isLoading: isUsersLoading } =
    queries.useAppUsers();
  const navigate = useNavigate();

  const statsSectionRef = useRef<HTMLElement | null>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const authState = useAppSelector((state) => state.auth);

  const featureSectionRef = useRef<HTMLElement | null>(null);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);

  const scrambledWord = useTextScramble(
    ["Cards", "Stats", "Profiles", "Visuals"],
    3200,
  );

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate("/dashboard");
    }

    const observerCallback = (
      entries: IntersectionObserverEntry[],
      setter: (v: boolean) => void,
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setter(true);
      });
    };

    const statsObserver = new IntersectionObserver(
      (entries) => observerCallback(entries, setIsStatsVisible),
      { threshold: 0.3 },
    );

    const featuresObserver = new IntersectionObserver(
      (entries) => observerCallback(entries, setIsFeaturesVisible),
      { threshold: 0.15 },
    );

    if (statsSectionRef.current) statsObserver.observe(statsSectionRef.current);
    if (featureSectionRef.current)
      featuresObserver.observe(featureSectionRef.current);

    return () => {
      statsObserver.disconnect();
      featuresObserver.disconnect();
    };
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      {/* ── Background Layer ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 landing-animate-grid-fade"
          style={{
            backgroundImage: `
							linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
							linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
						`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Drifting glow orbs */}
        <div className="landing-animate-glow absolute left-[60%] top-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div
          className="landing-animate-glow absolute left-[30%] top-[60%] h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-20 md:grid-cols-2 md:gap-12 lg:px-12">
        {/* Left: Copy */}
        <div className="flex flex-col items-start justify-center">
          {/* Badge */}
          <div className="landing-animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="landing-animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
            Open Source
          </div>

          {/* Headline */}
          <h1
            className="landing-animate-fade-up landing-delay-1 mt-8 text-4xl font-semibold tracking-tighter text-white md:text-5xl lg:text-6xl"
            style={{ lineHeight: "1.05" }}
          >
            Generate GitHub
            <br />
            <span
              className="inline-block font-mono text-emerald-400"
              style={{ minWidth: "5ch" }}
            >
              {scrambledWord}
            </span>
            <br />
            <span className="text-zinc-500">in seconds.</span>
          </h1>

          {/* Sub copy */}
          <p className="landing-animate-fade-up landing-delay-2 mt-6 max-w-[48ch] text-base leading-relaxed text-zinc-500 md:text-xl">
            Beautiful profile cards, real-time stats, language breakdowns, and
            contribution visualizations — all generated from your GitHub data.
          </p>

          {/* CTA group */}
          <div className="landing-animate-fade-up landing-delay-3 mt-8 flex items-center gap-4">
            <Button
              type="button"
              id="hero-cta-get-started"
              className="group h-12 rounded-full bg-emerald-500 px-7 text-sm font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.97]"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)",
              }}
              onClick={() => {
                if (authState.isAuthenticated) {
                  navigate("/dashboard");
                } else {
                  redirectToGithubOAuth(false);
                }
              }}
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>

            <a
              href="https://github.com/abhinav550-lol/git-readme"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-6 text-sm md:text-md font-medium text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:text-zinc-300 active:scale-[0.97]"
            >
              <GitHubIcon style={{ fontSize: 18 }} />
              <span className="hidden md:block">Star on GitHub</span>
              <span className="md:hidden">★</span>
            </a>
          </div>

          {/* Micro stats */}
          <div className="landing-animate-fade-up landing-delay-4 mt-10 flex items-center gap-6 border-t border-white/6 pt-6">
            <div className="flex flex-col">
              <span className="font-mono text-xl font-medium text-white">
                {isUsersLoading
                  ? "—"
                  : transformToKMB(Number(appUsersData?.data ?? 1000))}
                +
              </span>
              <span className="text-xs text-zinc-600 uppercase tracking-wider">
                Profiles built
              </span>
            </div>
            <div className="h-8 w-px bg-white/8" />
            <div className="flex flex-col">
              <span className="font-mono text-xl font-medium text-white">
                Live
              </span>
              <span className="text-xs text-zinc-600 uppercase tracking-wider">
                Data sync
              </span>
            </div>
            <div className="h-8 w-px bg-white/8" />
            <div className="flex flex-col">
              <span className="font-mono text-xl font-medium text-white">
                4
              </span>
              <span className="text-xs text-zinc-600 uppercase tracking-wider">
                Card types
              </span>
            </div>
          </div>
        </div>

        {/* Right: Animated Terminal */}
        <div className="landing-animate-fade-up landing-delay-3 relative hidden md:block">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            style={{
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="ml-3 font-mono text-[0.65rem] text-zinc-600">
                profile-card-generator.yml
              </span>
            </div>

            {/* Code content */}
            <div className="relative h-[380px] overflow-hidden px-5 py-4">
              {/* Scrolling code */}
              <div className="landing-animate-code-scroll">
                {[...CODE_LINES, ...CODE_LINES].map((line, i) => (
                  <div key={i} className="flex items-center gap-3 py-[3px]">
                    <span className="w-6 text-right font-mono text-[0.65rem] text-zinc-700 select-none">
                      {(i % CODE_LINES.length) + 1}
                    </span>
                    <span
                      className={`font-mono text-[0.78rem] ${line.color}`}
                      style={{ paddingLeft: `${line.indent * 12}px` }}
                    >
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fade overlays */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-900/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-900/80 to-transparent" />
            </div>

            {/* Terminal footer */}
            <div className="flex items-center gap-2 border-t border-white/6 px-5 py-3">
              <Terminal className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-mono text-[0.7rem] text-zinc-500">
                generating profile cards...
              </span>
              <span
                className="h-4 w-[2px] bg-emerald-400"
                style={{
                  animation: "landing-typing-cursor 1s step-end infinite",
                }}
              />
            </div>
          </div>

          {/* Floating decoration */}
          <div
            className="landing-animate-float absolute -right-6 -top-6 rounded-xl border border-white/8 bg-zinc-900/90 p-3 shadow-lg backdrop-blur-md"
            style={{ animationDelay: "1s" }}
          >
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div
            className="landing-animate-float absolute -bottom-4 -left-4 rounded-xl border border-white/8 bg-zinc-900/90 px-3 py-2 shadow-lg backdrop-blur-md"
            style={{ animationDelay: "2.5s" }}
          >
            <span className="font-mono text-[0.7rem] text-emerald-400">
              cards.svg
            </span>
          </div>
        </div>
      </section>

      {/* ── Marquee Strip ── */}
      <div className="relative z-10 overflow-hidden border-y border-white/[0.04] bg-zinc-950/80 py-4 backdrop-blur-md">
        <div className="landing-animate-marquee flex w-max items-center gap-10">
          {[
            "Profile Cards",
            "Stats Cards",
            "Language Breakdown",
            "Contribution Graphs",
            "Real-time Data",
            "Custom Themes",
            "Dynamic Visuals",
            "GitHub Auth",
            "Profile Cards",
            "Stats Cards",
            "Language Breakdown",
            "Contribution Graphs",
            "Real-time Data",
            "Custom Themes",
            "Dynamic Visuals",
            "GitHub Auth",
          ].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-sm text-zinc-600"
            >
              <span className="h-1 w-1 rounded-full bg-emerald-500/60" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features Bento Grid ── */}
      <section
        ref={featureSectionRef}
        className={`relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-12 transition-all duration-700 ease-out ${
          isFeaturesVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mb-14 max-w-xl">
          <p className="text-[0.7rem] font-medium md:text-lg uppercase tracking-[0.3em] text-emerald-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Your GitHub data, visualized.
          </h2>
          <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-zinc-500 md:text-lg">
            Sign in with GitHub. We fetch your stats, languages, and
            contributions — then generate dynamic cards and visualizations you
            can embed anywhere.
          </p>
        </div>

        {/* Bento grid: 2fr 1fr 1fr on desktop */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Card 1: Wide — Dynamic Cards */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/10 md:col-span-2 md:row-span-1">
            <div className="relative z-10">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-2xl font-medium text-white">
                Dynamic profile cards
              </h3>
              <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-zinc-500 md:text-lg">
                Generate beautiful, embeddable profile cards that display your
                GitHub identity — repos, followers, bio, and more — as polished
                visuals.
              </p>
            </div>
            {/* Decorative: faint grid lines inside */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Card 2: Real-time Stats */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/10">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg md:text-2xl font-medium text-white">
              Real-time GitHub stats
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 md:text-lg">
              Contributions, streaks, and commit activity — fetched directly
              from the GitHub API and rendered into stats cards.
            </p>
          </div>

          {/* Card 3: Language Cards */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/10">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="text-lg  md:text-2xl font-medium text-white">
              Language breakdown cards
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 md:text-lg">
              Visualize your top languages with color-coded cards. See exactly
              what your codebase looks like at a glance.
            </p>
          </div>

          {/* Card 4: Auto-sync */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/10">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-lg md:text-2xl font-medium text-white">
              Always up to date
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 md:text-lg">
              Async background jobs keep your cards fresh. Your data stays
              current without lifting a finger.
            </p>
          </div>

          {/* Card 5: Wide — One-click Auth */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/10 md:col-span-2 md:row-span-1">
            <div className="relative z-10">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-2xl font-medium text-white">
                One-click GitHub auth
              </h3>
              <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-zinc-500 md:text-lg">
                Sign in with your GitHub account, and your profile cards are
                generated instantly. Manage sessions, update preferences, and
                customize your output — all from a single dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community / Stats Section ── */}
      <section
        ref={statsSectionRef}
        className={`relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-12 transition-all duration-700 ease-out ${
          isStatsVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
          {/* Inner glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/6 blur-[80px]" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-14">
            {/* Left: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">
                <Users className="h-3 w-3 text-zinc-400" />
                Community
              </div>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Generating cards for{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 font-mono text-emerald-400">
                    {isUsersLoading
                      ? "—"
                      : `${transformToKMB(Number(appUsersData?.data ?? 1000))}+`}
                  </span>
                  <span className="absolute -inset-x-2 -inset-y-0.5 -z-0 rounded-lg bg-emerald-500/8" />
                </span>{" "}
                developers
              </h2>

              <p className="mt-4 max-w-[160ch] text-md md:text-xl leading-relaxed text-zinc-500">
                Developers use GitREADME to generate profile cards and stats
                visualizations that make their GitHub stand out.
              </p>

              <Button
                type="button"
                id="community-cta-join"
                className="mt-6 h-11 rounded-full border border-white/10 bg-white/[0.05] px-6 text-md md:text-xl font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97]"
                onClick={() => {
                  redirectToGithubOAuth(false);
                }}
              >
                Generate yours
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Landing;
