import { useState } from "react";
import { mutations } from "@/api/profileApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import { MarkdownPreviewer } from "./markdownPreviewer";


export function introductionSection({
	onGeneratedChange,
}: {
	onGeneratedChange?: (generated: boolean) => void;
}) {
	const [info, setInfo] = useState("");
	const [temperature, setTemperature] = useState(0.5);
	const [generatedIntro, setGeneratedIntro] = useState<string | null>(null);

	const { mutate, isPending, isError, error } =
		mutations.useGenerateIntroduction();

	const isGenerated = generatedIntro !== null;
	const isValid = info.trim().length >= 20;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;

		mutate(
			{ info: info.trim(), temperature },
			{
				onSuccess: (data) => {
					setGeneratedIntro(data.introduction);
					onGeneratedChange?.(true);
				},
			},
		);
	};

	const handleReset = () => {
		setGeneratedIntro(null);
		setInfo("");
		setTemperature(0.5);
		onGeneratedChange?.(false);
	};

	return (
		<section id="introduction-section" className="w-full">
			<div className="mx-auto w-full max-w-2xl">
				{/* Section header */}
				<div className="mb-8">
					<div className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
						<Sparkles className="h-3.5 w-3.5 text-emerald-400" />
						Step 1
					</div>

					<h2
						className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl"
						style={{ lineHeight: "1.15" }}
					>
						Write your{" "}
						<span className="text-emerald-400">introduction.</span>
					</h2>
					<p className="mt-3 max-w-[52ch] text-base leading-relaxed text-zinc-500">
						Tell us about yourself — your skills, interests, and what
						you're working on. We'll generate a polished introduction
						for your profile README.
					</p>
				</div>

				{/* Form card */}
				<div
					className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
					style={{
						boxShadow:
							"0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
					}}
				>
					{/* Subtle inner glow */}
					<div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[60px]" />

					<form onSubmit={handleSubmit} className="relative z-10 p-6 md:p-8">
						{/* Info textarea */}
						<div className="space-y-3">
							<Label
								htmlFor="introduction-info"
								className="text-sm font-medium text-zinc-300"
							>
								About you
							</Label>
							<div className="relative">
								<textarea
									id="introduction-info"
									value={info}
									onChange={(e) => setInfo(e.target.value)}
									disabled={isGenerated || isPending}
									placeholder="Full-stack developer specializing in MERN stack and AI enthusiast..."
									rows={5}
									className="w-full resize-none rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
								/>
								{/* Character count */}
								<div className="mt-1.5 flex items-center justify-end">
									<span
										className={`text-xs font-medium tracking-wide transition-colors duration-200 ${
											info.trim().length >= 20
												? "text-emerald-500/70"
												: info.trim().length > 0
													? "text-amber-500/70"
													: "text-zinc-600"
										}`}
									>
										{info.trim().length} / 20 min
									</span>
								</div>
							</div>
						</div>

						{/* Temperature slider */}
						<div className="mt-6 space-y-3">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="introduction-temperature"
									className="text-sm font-medium text-zinc-300"
								>
									Creativity
								</Label>
								<span className="rounded-lg border border-white/6 bg-white/[0.03] px-2.5 py-1 font-mono text-xs font-medium text-emerald-400">
									{temperature.toFixed(1)}
								</span>
							</div>

							<div className="relative">
								<input
									id="introduction-temperature"
									type="range"
									min={0}
									max={1}
									step={0.1}
									value={temperature}
									onChange={(e) =>
										setTemperature(parseFloat(e.target.value))
									}
									disabled={isGenerated || isPending}
									className="introduction-slider w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<div className="mt-2 flex items-center justify-between">
									<span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-600">
										Precise
									</span>
									<span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-600">
										Creative
									</span>
								</div>
							</div>
						</div>

						{/* Error message */}
						{isError && (
							<div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3">
								<AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
								<span className="text-sm text-red-400/90">
									{(error as Error)?.message ||
										"Failed to generate introduction. Please try again."}
								</span>
							</div>
						)}

						{/* Submit / Reset button */}
						<div className="mt-6">
							{!isGenerated ? (
								<Button
									type="submit"
									id="introduction-generate-btn"
									disabled={!isValid || isPending}
									className="group h-12 w-full rounded-xl bg-emerald-500 px-7 text-sm font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-emerald-500 cursor-pointer"
									style={{
										boxShadow: isValid && !isPending
											? "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)"
											: "none",
									}}
								>
									{isPending ? (
										<>
											<svg
												className="h-4 w-4 animate-spin"
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
											Generating...
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
											Generate Introduction
										</>
									)}
								</Button>
							) : (
								<Button
									type="button"
									id="introduction-reset-btn"
									onClick={handleReset}
									className="group h-10 rounded-xl border border-white/10 bg-white/[0.05] px-6 text-sm font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] cursor-pointer"
								>
									<RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-90" />
									Regenerate
								</Button>
							)}
						</div>
					</form>
				</div>

				{/* Generated output */}
				{isGenerated && (
					<MarkdownPreviewer markdown={generatedIntro} />
				)}
			</div>

			{/* Slider custom styles */}
			<style>{`
				.introduction-slider {
					-webkit-appearance: none;
					appearance: none;
					height: 6px;
					border-radius: 999px;
					background: linear-gradient(
						to right,
						rgba(16, 185, 129, 0.3) 0%,
						rgba(16, 185, 129, 0.08) 100%
					);
					outline: none;
				}

				.introduction-slider::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 18px;
					height: 18px;
					border-radius: 50%;
					background: #10b981;
					border: 2px solid rgba(0, 0, 0, 0.3);
					box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15),
						0 2px 8px rgba(0, 0, 0, 0.3);
					cursor: pointer;
					transition: box-shadow 0.2s ease, transform 0.15s ease;
				}

				.introduction-slider::-webkit-slider-thumb:hover {
					box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.2),
						0 2px 12px rgba(0, 0, 0, 0.4);
					transform: scale(1.1);
				}

				.introduction-slider::-moz-range-thumb {
					width: 18px;
					height: 18px;
					border-radius: 50%;
					background: #10b981;
					border: 2px solid rgba(0, 0, 0, 0.3);
					box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15),
						0 2px 8px rgba(0, 0, 0, 0.3);
					cursor: pointer;
				}

				.introduction-slider:disabled::-webkit-slider-thumb {
					cursor: not-allowed;
				}

				.introduction-slider:disabled::-moz-range-thumb {
					cursor: not-allowed;
				}
			`}</style>
		</section>
	);
}
