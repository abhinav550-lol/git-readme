import { useState, type JSX } from "react";
import { ProfilePreview } from "./profilePreview";
import { introductionSection as IntroductionSection } from "./parts/profile/introductionSection";
import { techstackSection as TechstackSection } from "./parts/profile/techstackSection";
import { statsSection as StatsSection } from "./parts/profile/statsSection";
import { projectsSection as ProjectsSection } from "./parts/profile/projectsSection";
import { socialsSection as SocialsSection } from "./parts/profile/socialsSections";
import DashboardNavbar from "./parts/navbar";
import Footer from "./parts/footer";
import { ArrowLeft, ArrowRight, Check, Circle, CircleDot } from "lucide-react";
import { Button } from "./ui/button";

/* ─── Section keys used for the visibility map ─── */
type SectionKey = "introduction" | "techstack" | "stats" | "repos" | "socials";

/* ─── Section map: step → [label, sectionKey, Component] ─── */
const stateToSectionMap: Record<
  number,
  [string, SectionKey, (props: any) => JSX.Element]
> = {
  1: ["Introduction", "introduction", IntroductionSection],
  2: ["Tech Stack", "techstack", TechstackSection],
  3: ["Stats", "stats", StatsSection],
  4: ["Projects", "repos", ProjectsSection],
  5: ["Socials", "socials", SocialsSection],
};

const TOTAL_STEPS = Object.keys(stateToSectionMap).length;

export function ProfileGeneration() {
  const [view, setView] = useState<"steps" | "preview">("steps");
  const [section, setSection] = useState<number>(1);

  /* Track which sections are generated */
  const [sectionsGenerated, setSectionsGenerated] = useState<
    Record<SectionKey, boolean>
  >({
    introduction: false,
    techstack: false,
    stats: false,
    repos: false,
    socials: false,
  });

  /* ── Navigation handlers ── */
  const onNext = () => setSection((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const onBack = () => setSection((prev) => Math.max(prev - 1, 1));

  /* ── Current section data ── */
  const [, currentKey, CurrentComponent] = stateToSectionMap[section];
  const isFirstSection = section === 1;
  const isLastSection = section === TOTAL_STEPS;

  /* ── Profile Preview view ── */
  if (view === "preview") {
    return (
      <ProfilePreview
        sectionsGenerated={sectionsGenerated}
        onBack={() => setView("steps")}
      />
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      {/* ── Background Layer ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
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
        <div className="landing-animate-glow absolute left-[60%] top-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div
          className="landing-animate-glow absolute left-[30%] top-[60%] h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <DashboardNavbar />

      {/* ── Main content ── */}
      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-28 pb-12 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-2xl">
          {/* ── Step progress indicator ── */}
          <div className="mb-10 flex items-center justify-center gap-5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const step = i + 1;
              const [label, key] = stateToSectionMap[step];
              const isActive = step === section;
              const isGenerated = sectionsGenerated[key];

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setSection(step)}
                  className="group relative flex items-center justify-center cursor-pointer"
                >
                  {/* Step dot */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : isGenerated
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                          : "border-white/8 bg-white/[0.03] text-zinc-500"
                    }`}
                  >
                    {isGenerated ? (
                      <Check className="h-4 w-4" />
                    ) : isActive ? (
                      <CircleDot className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Hover tooltip ── absolute, no layout impact */}
                  <span
                    className={`pointer-events-none absolute top-full mt-2.5 whitespace-nowrap rounded-lg border border-white/8 bg-zinc-900/90 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-1 ${
                      isActive
                        ? "text-emerald-400"
                        : isGenerated
                          ? "text-zinc-300"
                          : "text-zinc-400"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Section card ── */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Inner glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[60px]" />

            <div className="relative z-10 p-6 md:p-8">
              {/* ── Active section component ── */}
              <div
                key={section}
                style={{
                  animation:
                    "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <CurrentComponent
                  onGeneratedChange={(generated: boolean) =>
                    setSectionsGenerated((prev) => ({
                      ...prev,
                      [currentKey]: generated,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* ── Navigation bar ── */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {/* Back button */}
            <Button
              type="button"
              id="profile-nav-back"
              onClick={onBack}
              disabled={isFirstSection}
              className="group h-11 rounded-xl border border-white/8 bg-white/[0.04] px-5 text-sm font-medium text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-white/[0.07] hover:text-zinc-200 active:scale-[0.97] disabled:opacity-30 disabled:hover:bg-white/[0.04] disabled:hover:text-zinc-400 cursor-pointer"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back
            </Button>

            <div className="flex items-center gap-2.5">
              {/* Next / Finish button */}
              <Button
                type="button"
                id="profile-nav-next"
                onClick={isLastSection ? () => setView("preview") : onNext}
                className={`group h-11 rounded-xl px-6 text-sm font-medium transition-all duration-300 active:scale-[0.97] cursor-pointer ${
                  isLastSection
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    : "bg-white/[0.08] text-zinc-200 hover:bg-white/[0.12] hover:text-white"
                }`}
                style={
                  isLastSection
                    ? {
                        boxShadow:
                          "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)",
                      }
                    : undefined
                }
              >
                {isLastSection ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
