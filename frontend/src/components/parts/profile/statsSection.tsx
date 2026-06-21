import { useState, useEffect } from "react";
import { mutations } from "@/api/profileApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle, RotateCcw, BarChart2, LayoutGrid, Sun, Moon, Info } from "lucide-react";
import { MarkdownPreviewer } from "./markdownPreviewer";
import { showToast } from "@/utils/toast";
import { useAppSelector } from "@/store/hooks";

export function statsSection({
	onGeneratedChange,
}: {
	onGeneratedChange?: (generated: boolean) => void;
}) {
	const [type, setType] = useState<"modern" | "classic">("modern");
	const [theme, setTheme] = useState<"dark" | "light">("dark");
	const [generatedStats, setGeneratedStats] = useState<string | null>(null);

	// Tracking image loading states for premium skeleton loader experience
	const [loadingImg1, setLoadingImg1] = useState(true);
	const [loadingImg2, setLoadingImg2] = useState(true);

	const username = useAppSelector((state) => state.auth.login) || "octocat";
	const { mutate, isPending, isError, error } = mutations.useGenerateStats();

	const isGenerated = generatedStats !== null;

	// Reset image loading states when configuration changes
	useEffect(() => {
		setLoadingImg1(true);
		setLoadingImg2(true);
	}, [type, theme]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutate(
			{ type, theme },
			{
				onSuccess: (data) => {
					setGeneratedStats(data.statsSection);
					onGeneratedChange?.(true);
					showToast.success("GitHub stats section generated successfully!");
				},
				onError: (err: any) => {
					const errorMsg =
						err?.message ||
						err?.response?.data?.message ||
						"Failed to generate stats section. Please try again.";
					showToast.error(errorMsg);
				},
			},
		);
	};

	const handleReset = () => {
		setGeneratedStats(null);
		onGeneratedChange?.(false);
	};

	const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

	// Generate preview URLs
	const classicTheme = theme === "light" ? "default" : theme;

	const img1Url =
		type === "modern"
			? `${backendUrl}/api/profile/card/contribution-stats?username=${username}&color_scheme=${theme}`
			: `https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${username}&theme=${classicTheme}`;

	const img2Url =
		type === "modern"
			? `${backendUrl}/api/profile/card/language-stats?username=${username}&color_scheme=${theme}`
			: `https://github-readme-streak-stats.herokuapp.com?user=${username}&theme=${classicTheme}`;

	return (
		<section id="stats-section" className="w-full">
			<div className="mx-auto w-full max-w-2xl">
				{/* Section header */}
				<div className="mb-8">
					<div className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
						<BarChart2 className="h-3.5 w-3.5 text-emerald-400" />
						Step 3
					</div>

					<h2
						className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl"
						style={{ lineHeight: "1.15" }}
					>
						GitHub <span className="text-emerald-400">stats section.</span>
					</h2>
					<p className="mt-3 max-w-[52ch] text-base leading-relaxed text-zinc-500">
						Display your repository stats, streak, and language usage. Choose between modern (custom generated) or classic styling.
					</p>
				</div>

				{/* Form card */}
				<div
					className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md mb-8"
					style={{
						boxShadow:
							"0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
					}}
				>
					{/* Glow effect */}
					<div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[60px]" />

					<form onSubmit={handleSubmit} className="relative z-10 p-6 md:p-8 space-y-6">
						{/* Configuration Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Style/Preset Selection */}
							<div className="space-y-3">
								<Label className="text-sm font-medium text-zinc-300">Card Style</Label>
								<div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
									<button
										type="button"
										disabled={isGenerated || isPending}
										onClick={() => setType("modern")}
										className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
											type === "modern"
												? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.05)]"
												: "text-zinc-500 hover:text-zinc-300 border border-transparent"
										}`}
									>
										<Sparkles className="h-3.5 w-3.5" />
										Modern
									</button>
									<button
										type="button"
										disabled={isGenerated || isPending}
										onClick={() => setType("classic")}
										className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
											type === "classic"
												? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.05)]"
												: "text-zinc-500 hover:text-zinc-300 border border-transparent"
										}`}
									>
										<LayoutGrid className="h-3.5 w-3.5" />
										Classic
									</button>
								</div>
							</div>

							{/* Theme Selection */}
							<div className="space-y-3">
								<Label className="text-sm font-medium text-zinc-300">Theme Preset</Label>
								<div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
									<button
										type="button"
										disabled={isGenerated || isPending}
										onClick={() => setTheme("dark")}
										className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
											theme === "dark"
												? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.05)]"
												: "text-zinc-500 hover:text-zinc-300 border border-transparent"
										}`}
									>
										<Moon className="h-3.5 w-3.5" />
										Dark
									</button>
									<button
										type="button"
										disabled={isGenerated || isPending}
										onClick={() => setTheme("light")}
										className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
											theme === "light"
												? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.05)]"
												: "text-zinc-500 hover:text-zinc-300 border border-transparent"
										}`}
									>
										<Sun className="h-3.5 w-3.5" />
										Light
									</button>
								</div>
							</div>
						</div>

						{/* Interactive Previews container */}
						<div className="space-y-3 pt-2">
							<Label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
								Live Preview <span className="text-[10px] text-zinc-500">({type === "modern" ? "Custom SVGs" : "Third-Party Cards"})</span>
							</Label>
							<div className="grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-black/30 p-4 min-h-[160px] relative overflow-hidden">
								
								{/* Card 1 Preview */}
								<div className="relative w-full flex justify-center items-center rounded-lg bg-zinc-950/40 border border-white/5 p-2 overflow-hidden min-h-[120px]">
									{loadingImg1 && (
										<div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
											<div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
										</div>
									)}
									<img
										src={img1Url}
										alt="GitHub Stats Card 1"
										className={`max-w-full h-auto object-contain transition-all duration-300 ${
											loadingImg1 ? "opacity-0 scale-95" : "opacity-100 scale-100"
										}`}
										onLoad={() => setLoadingImg1(false)}
										onError={() => setLoadingImg1(false)}
									/>
								</div>

								{/* Card 2 Preview */}
								<div className="relative w-full flex justify-center items-center rounded-lg bg-zinc-950/40 border border-white/5 p-2 overflow-hidden min-h-[120px]">
									{loadingImg2 && (
										<div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
											<div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
										</div>
									)}
									<img
										src={img2Url}
										alt="GitHub Stats Card 2"
										className={`max-w-full h-auto object-contain transition-all duration-300 ${
											loadingImg2 ? "opacity-0 scale-95" : "opacity-100 scale-100"
										}`}
										onLoad={() => setLoadingImg2(false)}
										onError={() => setLoadingImg2(false)}
									/>
								</div>
							</div>
							
							{type === "classic" && (
								<div className="flex items-start gap-2 text-zinc-500 text-xs px-1">
									<Info className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
									<span>Classic cards depend on external providers. They might take a few moments to generate and load dynamically.</span>
								</div>
							)}
						</div>

						{/* Error message */}
						{isError && (
							<div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3">
								<AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
								<span className="text-sm text-red-400/90">
									{(error as Error)?.message ||
										"Failed to generate stats section. Please try again."}
								</span>
							</div>
						)}

						{/* Submit / Reset button */}
						<div className="mt-6 pt-4 border-t border-white/5">
							{!isGenerated ? (
								<Button
									type="submit"
									id="stats-generate-btn"
									disabled={isPending}
									className="group h-12 w-full rounded-xl bg-emerald-500 px-7 text-sm font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-emerald-500 cursor-pointer"
									style={{
										boxShadow: !isPending
											? "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)"
											: "none",
									}}
								>
									{isPending ? (
										<>
											<svg
												className="h-4 w-4 animate-spin mr-2"
												viewBox="0 0 24 24"
												fill="none"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												/>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
												/>
											</svg>
											Generating Stats Section...
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
											Generate Stats Section
										</>
									)}
								</Button>
							) : (
								<Button
									type="button"
									id="stats-reset-btn"
									onClick={handleReset}
									className="group h-10 rounded-xl border border-white/10 bg-white/[0.05] px-6 text-sm font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] cursor-pointer"
								>
									<RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-90" />
									Change Stats Settings
								</Button>
							)}
						</div>
					</form>
				</div>

				{/* Generated output */}
				{isGenerated && <MarkdownPreviewer markdown={generatedStats} />}
			</div>
		</section>
	);
}