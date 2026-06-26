import { useEffect } from "react";
import { mutations, type GenerateProfilePayload } from "../api/profileApi";
import { MarkdownPreviewer } from "./parts/profile/markdownPreviewer";
import DashboardNavbar from "./parts/navbar";
import Footer from "./parts/footer";
import { ArrowLeft, AlertTriangle, Loader2, FileX2 } from "lucide-react";
import { Button } from "./ui/button";

interface ProfilePreviewProps {
  sectionsGenerated: Record<keyof GenerateProfilePayload, boolean>;
  onBack: () => void;
}

export function ProfilePreview({
  sectionsGenerated,
  onBack,
}: ProfilePreviewProps) {
  const { mutate, data, isPending, isError, error } =
    mutations.useGenerateProfile();

  const hasAnySectionGenerated = Object.values(sectionsGenerated).some(Boolean);

  useEffect(() => {
    if (!hasAnySectionGenerated) return;

    mutate({
      introduction: sectionsGenerated.introduction,
      techstack: sectionsGenerated.techstack,
      stats: sectionsGenerated.stats,
      repos: sectionsGenerated.repos,
      socials: sectionsGenerated.socials,
    });
  }, []);

  const profileMarkdown = data?.data ?? null;

  /* ── Empty state — no sections were generated ── */
  if (!hasAnySectionGenerated) {
    return (
      <main className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
        <BackgroundLayer />
        <DashboardNavbar />
        <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-28 pb-12 sm:px-6 lg:px-12">
          <div className="mx-auto w-full max-w-2xl">
            <div
              className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-rose-500/5 blur-[60px]" />
              <div
                className="relative z-10 flex flex-col items-center gap-4 p-10 text-center"
                style={{
                  animation:
                    "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
                  <FileX2 className="h-7 w-7 text-rose-400" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                  No sections generated
                </h2>
                <p className="max-w-[45ch] text-sm leading-relaxed text-zinc-400">
                  Generate at least one section before building a full profile.
                  Head back and complete a section first.
                </p>
                <Button
                  type="button"
                  onClick={onBack}
                  className="group mt-2 h-11 cursor-pointer rounded-xl border border-white/8 bg-white/[0.04] px-5 text-sm font-medium text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-white/[0.07] hover:text-zinc-200 active:scale-[0.97]"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  Back to sections
                </Button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      <BackgroundLayer />
      <DashboardNavbar />

      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-28 pb-12 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-3xl">
          {/* ── Header ── */}
          <div
            className="mb-8 flex items-center gap-3"
            style={{
              animation:
                "landing-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <Button
              type="button"
              onClick={onBack}
              className="group h-9 cursor-pointer rounded-xl border border-white/8 bg-white/[0.04] px-3 text-sm font-medium text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-white/[0.07] hover:text-zinc-200 active:scale-[0.97]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Profile Preview
            </h1>
          </div>

          {/* ── Loading state ── */}
          {isPending && (
            <div
              className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[60px]" />
              <div
                className="relative z-10 flex flex-col items-center gap-5 p-16 text-center"
                style={{
                  animation:
                    "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                    Generating your profile
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Combining selected sections into a single README...
                  </p>
                </div>

                {/* Skeleton blocks */}
                <div className="mt-4 w-full max-w-md space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-white/[0.04]" />
                  <div className="h-4 w-full animate-pulse rounded-lg bg-white/[0.04]" />
                  <div className="h-4 w-5/6 animate-pulse rounded-lg bg-white/[0.04]" />
                  <div className="h-4 w-2/3 animate-pulse rounded-lg bg-white/[0.04]" />
                  <div className="h-4 w-4/5 animate-pulse rounded-lg bg-white/[0.04]" />
                </div>
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {isError && (
            <div
              className="relative overflow-hidden rounded-2xl border border-rose-500/15 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(244,63,94,0.1), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-rose-500/5 blur-[60px]" />
              <div
                className="relative z-10 flex flex-col items-center gap-4 p-10 text-center"
                style={{
                  animation:
                    "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
                  <AlertTriangle className="h-7 w-7 text-rose-400" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                  Generation failed
                </h2>
                <p className="max-w-[50ch] text-sm leading-relaxed text-zinc-400">
                  {(error as Error)?.message ||
                    "Something went wrong while generating your profile. Try again."}
                </p>
                <Button
                  type="button"
                  onClick={() =>
                    mutate({
                      introduction: sectionsGenerated.introduction,
                      techstack: sectionsGenerated.techstack,
                      stats: sectionsGenerated.stats,
                      repos: sectionsGenerated.repos,
                      socials: sectionsGenerated.socials,
                    })
                  }
                  className="mt-2 h-11 cursor-pointer rounded-xl bg-emerald-500 px-6 text-sm font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.97]"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)",
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* ── Success — markdown preview ── */}
          {!isPending && !isError && profileMarkdown && (
            <div
              style={{
                animation:
                  "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              <MarkdownPreviewer markdown={profileMarkdown} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ── Shared background layer ── */
function BackgroundLayer() {
  return (
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
  );
}
