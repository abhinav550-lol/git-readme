import { useEffect, useState } from "react";
import { mutations, type GenerateProfilePayload } from "../api/profileApi";
import { MarkdownPreviewer } from "./parts/profile/markdownPreviewer";
import DashboardNavbar from "./parts/navbar";
import Footer from "./parts/footer";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  FileX2,
  ExternalLink,
  Pencil,
  Eye,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAppSelector } from "../store/hooks";

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

  const {
    mutate: putReadme,
    isPending: isPutPending,
    isError: isPutError,
    error: putError,
  } = mutations.usePutReadme();

  const login = useAppSelector((state) => state.auth.login);

  const [isEditing, setIsEditing] = useState(false);
  const [editableMarkdown, setEditableMarkdown] = useState<string | null>(null);

  const hasAnySectionGenerated = Object.values(sectionsGenerated).some(Boolean);

  useEffect(() => {
    if (!hasAnySectionGenerated) return;

    mutate(
      {
        introduction: sectionsGenerated.introduction,
        techstack: sectionsGenerated.techstack,
        stats: sectionsGenerated.stats,
        repos: sectionsGenerated.repos,
        socials: sectionsGenerated.socials,
      },
      {
        onSuccess: (res) => {
          setEditableMarkdown(res?.data ?? null);
        },
      },
    );
  }, []);

  const profileMarkdown = editableMarkdown ?? data?.data ?? null;

  const handlePushToGitHub = () => {
    if (!profileMarkdown) return;

    putReadme(
      { readmeContent: profileMarkdown },
      {
        onSuccess: () => {
          window.open(`https://github.com/${login}`, "_blank");
        },
      },
    );
  };

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

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
            <h1 className="flex-1 text-xl font-semibold tracking-tight text-zinc-100">
              Profile Preview
            </h1>

            {/* Edit / Preview toggle — only when content is loaded */}
            {!isPending && !isError && profileMarkdown && (
              <Button
                type="button"
                id="toggle-edit-markdown"
                onClick={handleToggleEdit}
                className={`group h-9 cursor-pointer rounded-xl border px-4 text-sm font-medium backdrop-blur-md transition-all duration-300 active:scale-[0.97] ${
                  isEditing
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                    : "border-white/8 bg-white/[0.04] text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/12 hover:bg-white/[0.07] hover:text-zinc-200"
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Preview
                  </>
                ) : (
                  <>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit Markdown
                  </>
                )}
              </Button>
            )}
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

          {/* ── Success — markdown preview + push to GitHub ── */}
          {!isPending && !isError && profileMarkdown && (
            <div
              style={{
                animation:
                  "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              {isEditing ? (
                <div
                  className="overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Editor header */}
                  <div className="flex items-center gap-2 border-b border-white/6 bg-zinc-950/40 px-5 py-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Edit Markdown
                    </span>
                  </div>
                  <textarea
                    id="markdown-editor"
                    value={profileMarkdown}
                    onChange={(e) => setEditableMarkdown(e.target.value)}
                    spellCheck={false}
                    className="w-full resize-none bg-transparent p-6 font-mono text-sm leading-relaxed text-zinc-300 placeholder-zinc-600 outline-none selection:bg-emerald-500/20"
                    style={{ minHeight: "400px", maxHeight: "70vh" }}
                  />
                </div>
              ) : (
                <MarkdownPreviewer markdown={profileMarkdown} />
              )}

              {/* ── Push to GitHub action bar ── */}
              <div className="mt-6 flex flex-col items-center gap-3">
                {/* PUT error inline */}
                {isPutError && (
                  <div
                    className="w-full rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-center text-sm text-rose-300"
                    style={{
                      animation:
                        "landing-fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
                    }}
                  >
                    <AlertTriangle className="mr-1.5 inline-block h-4 w-4 text-rose-400" />
                    {(putError as Error)?.message ||
                      "Failed to push profile to GitHub. Try again."}
                  </div>
                )}

                <Button
                  type="button"
                  id="push-to-github"
                  onClick={handlePushToGitHub}
                  disabled={isPutPending}
                  className="group h-12 cursor-pointer rounded-xl bg-emerald-500 px-8 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)",
                  }}
                >
                  {isPutPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pushing to GitHub...
                    </>
                  ) : (
                    <>
                      Push Profile to GitHub
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-zinc-500">
                  Updates your{" "}
                  <span className="font-medium text-zinc-400">
                    {login}/{login}
                  </span>{" "}
                  repository README.md
                </p>
              </div>
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
