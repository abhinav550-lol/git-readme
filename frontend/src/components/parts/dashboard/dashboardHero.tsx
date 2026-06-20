import { useAppSelector } from "@/store/hooks";
import { ArrowRight, Info, Sparkles } from "lucide-react";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardHero() {
const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  return (
    <section className="relative z-10 flex min-h-[100vh] items-center justify-center px-6 lg:px-12 top-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Badge */}
        <div className="landing-animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Hello, {authState.login}
        </div>

        {/* Headline */}
        <h1
          className="landing-animate-fade-up landing-delay-1 mt-8 text-4xl font-semibold tracking-tighter text-white md:text-5xl lg:text-6xl"
          style={{ lineHeight: "1.08" }}
        >
          Build your
          <br />
          <span className="text-emerald-400">GitHub profile.</span>
        </h1>

        {/* Subtext */}
        <p className="landing-animate-fade-up landing-delay-2 mt-6 max-w-[52ch] text-base leading-relaxed text-zinc-500 md:text-xl">
          Build a beautiful GitHub profile README that showcases who you are,
          what you've built, and where to find you—then push it straight to
          GitHub with minimal clicks.
        </p>

        {/* CTA */}
        <div className="landing-animate-fade-up landing-delay-3 mt-10">
          <Button
            type="button"
            id="dashboard-hero-cta"
            className="group h-13 rounded-full bg-emerald-500 px-8 text-md md:text-xl font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.97] cursor-pointer"
            style={{
              boxShadow:
                "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)",
            }}
            onClick={() => navigate('/generate-profile')}
          >
            Start Generating
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
        </div>

        {/* Info note */}
        <div className="landing-animate-fade-up landing-delay-4 mt-5 flex items-center gap-2 rounded-lg px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
          <span className="text-sm md:text-base text-zinc-600">
            This action might require repository access on GitHub
          </span>
        </div>
      </div>
    </section>
  );
}
