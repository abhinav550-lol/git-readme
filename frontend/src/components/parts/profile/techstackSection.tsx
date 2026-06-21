import { useState } from "react";
import { mutations } from "@/api/profileApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle, RotateCcw, Plus, X, Laptop } from "lucide-react";
import { MarkdownPreviewer } from "./markdownPreviewer";
import { showToast } from "@/utils/toast";

const SUGGESTIONS = [
	"JavaScript",
	"TypeScript",
	"React",
	"Vue",
	"Next.js",
	"Node.js",
	"Python",
	"Go",
	"Rust",
	"Docker",
	"Kubernetes",
	"PostgreSQL",
	"MongoDB",
	"GraphQL",
	"AWS",
	"Git",
];

export function techstackSection({
	onGeneratedChange,
}: {
	onGeneratedChange?: (generated: boolean) => void;
}) {
	const [languages, setLanguages] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [generatedTechStack, setGeneratedTechStack] = useState<string | null>(null);

	const { mutate, isPending, isError, error } = mutations.useGenerateTechStack();

	const isGenerated = generatedTechStack !== null;

	const handleAddLanguage = (lang: string) => {
		const cleanLang = lang.trim();
		if (!cleanLang) return;

		if (languages.length >= 25) {
			showToast.warning("Maximum of 25 technologies allowed!");
			return;
		}

		// Prevent duplicates (case-insensitive)
		if (languages.some((l) => l.toLowerCase() === cleanLang.toLowerCase())) {
			showToast.warning(`${cleanLang} is already added!`);
			return;
		}

		setLanguages((prev) => [...prev, cleanLang]);
		setInputValue("");
	};

	const handleRemoveLanguage = (lang: string) => {
		setLanguages((prev) => prev.filter((l) => l.toLowerCase() !== lang.toLowerCase()));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddLanguage(inputValue);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (languages.length === 0) return;

		mutate(
			{ languages },
			{
				onSuccess: (data) => {
					setGeneratedTechStack(data.techStack);
					onGeneratedChange?.(true);
				},
				onError: (err: any) => {
					const errorMsg =
						err?.message ||
						err?.response?.data?.message ||
						"Failed to generate tech stack. Please try again.";
					showToast.error(errorMsg);
				},
			},
		);
	};

	const handleReset = () => {
		setGeneratedTechStack(null);
		onGeneratedChange?.(false);
	};

	return (
		<section id="techstack-section" className="w-full">
			<div className="mx-auto w-full max-w-2xl">
				{/* Section header */}
				<div className="mb-8">
					<div className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
						<Laptop className="h-3.5 w-3.5 text-emerald-400" />
						Step 2
					</div>

					<h2
						className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl"
						style={{ lineHeight: "1.15" }}
					>
						Select your <span className="text-emerald-400">tech stack.</span>
					</h2>
					<p className="mt-3 max-w-[52ch] text-base leading-relaxed text-zinc-500">
						Select the technologies you work with. We'll generate a beautifully
						formatted badges section for your GitHub profile README.
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
						<div className="space-y-4">
							<Label htmlFor="tech-input" className="text-sm font-medium text-zinc-300">
								Languages & Technologies
							</Label>

							{/* Custom input */}
							<div className="flex gap-2">
								<input
									id="tech-input"
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={handleKeyDown}
									disabled={isGenerated || isPending}
									placeholder="Type and press Enter (e.g. React, Rails, MySQL...)"
									className="flex-1 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<Button
									type="button"
									onClick={() => handleAddLanguage(inputValue)}
									disabled={isGenerated || isPending || !inputValue.trim() || languages.length >= 25}
									className="h-11 rounded-xl bg-zinc-800 border border-white/8 hover:bg-zinc-700 text-zinc-300 active:scale-[0.98] cursor-pointer shrink-0 px-4"
								>
									<Plus className="h-4 w-4 mr-1" />
									Add
								</Button>
							</div>

							{/* Active badge list */}
							{languages.length > 0 && (
								<div className="mt-4">
									<span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 block mb-2">
										Selected ({languages.length} / 25 max)
									</span>
									<div className="flex flex-wrap gap-2">
										{languages.map((lang) => (
											<span
												key={lang}
												className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-400 transition-all duration-200"
											>
												{lang}
												{!isGenerated && !isPending && (
													<button
														type="button"
														onClick={() => handleRemoveLanguage(lang)}
														className="rounded-full p-0.5 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
													>
														<X className="h-3.5 w-3.5" />
													</button>
												)}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Suggestions list */}
							{!isGenerated && (
								<div className="pt-4 border-t border-white/5 space-y-2.5">
									<span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 block">
										Quick Suggested Technologies
									</span>
									<div className="flex flex-wrap gap-2">
										{SUGGESTIONS.map((sug) => {
											const isSelected = languages.some(
												(l) => l.toLowerCase() === sug.toLowerCase(),
											);
											return (
												<button
													key={sug}
													type="button"
													disabled={isPending}
													onClick={() => {
														if (isSelected) {
															handleRemoveLanguage(sug);
														} else {
															handleAddLanguage(sug);
														}
													}}
													className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
														isSelected
															? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
															: "border-white/8 bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-zinc-200"
													}`}
												>
													{sug}
												</button>
											);
										})}
									</div>
								</div>
							)}
						</div>

						{/* Error message */}
						{isError && (
							<div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3">
								<AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
								<span className="text-sm text-red-400/90">
									{(error as Error)?.message ||
										"Failed to generate tech stack. Please try again."}
								</span>
							</div>
						)}

						{/* Submit / Reset button */}
						<div className="mt-6 pt-4 border-t border-white/5">
							{!isGenerated ? (
								<Button
									type="submit"
									id="techstack-generate-btn"
									disabled={languages.length === 0 || isPending}
									className="group h-12 w-full rounded-xl bg-emerald-500 px-7 text-sm font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-emerald-500 cursor-pointer"
									style={{
										boxShadow:
											languages.length > 0 && !isPending
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
											Generating Tech Stack...
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
											Generate Tech Stack
										</>
									)}
								</Button>
							) : (
								<Button
									type="button"
									id="techstack-reset-btn"
									onClick={handleReset}
									className="group h-10 rounded-xl border border-white/10 bg-white/[0.05] px-6 text-sm font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] cursor-pointer"
								>
									<RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-90" />
									Edit Tech Stack
								</Button>
							)}
						</div>
					</form>
				</div>

				{/* Generated output */}
				{isGenerated && <MarkdownPreviewer markdown={generatedTechStack} />}
			</div>
		</section>
	);
}