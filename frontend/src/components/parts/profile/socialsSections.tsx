import { useState } from "react";
import { mutations } from "@/api/profileApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Sparkles,
	AlertCircle,
	RotateCcw,
	Plus,
	Trash2,
	Globe,
	Mail,
	Share2
} from "lucide-react";
import { MarkdownPreviewer } from "./markdownPreviewer";
import { showToast } from "@/utils/toast";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
		<path d="M9 18c-4.51 2-5-2-7-2" />
	</svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
	</svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
		<rect width="4" height="12" x="2" y="9" />
		<circle cx="4" cy="4" r="2" />
	</svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
		<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
		<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
	</svg>
);

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="M18 8a6 6 0 0 0-12 0c0 7 3 9 3 9h6s3-2 3-9Z" />
		<path d="M9 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
		<path d="M15 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
	</svg>
);

interface SocialLinkItem {
	id: string;
	name: string;
	url: string;
	isCustom: boolean;
}

const INITIAL_PLATFORMS = [
	{ id: "1", name: "GitHub", url: "", isCustom: false },
	{ id: "2", name: "Twitter", url: "", isCustom: false },
	{ id: "3", name: "LinkedIn", url: "", isCustom: false },
	{ id: "4", name: "Instagram", url: "", isCustom: false },
	{ id: "5", name: "Discord", url: "", isCustom: false },
	{ id: "6", name: "Gmail", url: "", isCustom: false },
];

const getPlatformIcon = (name: string) => {
	switch (name.toLowerCase()) {
		case "github":
			return GithubIcon;
		case "twitter":
		case "x":
			return TwitterIcon;
		case "linkedin":
			return LinkedinIcon;
		case "instagram":
			return InstagramIcon;
		case "discord":
			return DiscordIcon;
		case "gmail":
		case "email":
			return Mail;
		default:
			return Globe;
	}
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const validateLink = (name: string, url: string): string | null => {
	const trimmedUrl = url.trim();
	if (!trimmedUrl) return null;

	// Check email/Gmail
	if (name.toLowerCase() === "gmail" || name.toLowerCase() === "email") {
		let checkUrl = trimmedUrl;
		if (checkUrl.startsWith("mailto:")) {
			checkUrl = checkUrl.replace("mailto:", "");
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (emailRegex.test(checkUrl)) {
			return null;
		}
	}

	// Prepend protocol to test standard URL constructor if missing
	let checkUrl = trimmedUrl;
	if (!/^https?:\/\//i.test(checkUrl) && !/^mailto:/i.test(checkUrl)) {
		checkUrl = `https://${checkUrl}`;
	}

	try {
		const parsed = new URL(checkUrl);
		if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
			return null;
		}
		return "Invalid protocol. Use http, https, or mailto.";
	} catch (_) {
		return "Invalid URL format.";
	}
};

const sanitizeUrlForPayload = (name: string, url: string): string => {
	const trimmedUrl = url.trim();

	if (name.toLowerCase() === "gmail" || name.toLowerCase() === "email") {
		if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUrl)) {
			return `mailto:${trimmedUrl}`;
		}
	}

	if (!/^https?:\/\//i.test(trimmedUrl) && !/^mailto:/i.test(trimmedUrl)) {
		return `https://${trimmedUrl}`;
	}

	return trimmedUrl;
};

export function socialsSection({
	onGeneratedChange,
}: {
	onGeneratedChange?: (generated: boolean) => void;
}) {
	const [links, setLinks] = useState<SocialLinkItem[]>(INITIAL_PLATFORMS);
	const [generatedSocials, setGeneratedSocials] = useState<string | null>(null);

	const { mutate, isPending, isError, error } = mutations.useGenerateSocials();

	const isGenerated = generatedSocials !== null;

	// Check if we have at least one non-empty link, and no validation errors on filled links
	const filledLinks = links.filter((l) => l.url.trim() !== "");
	const hasAtLeastOneFilled = filledLinks.length > 0;
	const hasValidationErrors = links.some((l) => validateLink(l.name, l.url) !== null);
	const isValid = hasAtLeastOneFilled && !hasValidationErrors;

	const handleAddCustom = () => {
		if (links.length >= 15) {
			showToast.warning("Maximum of 15 social links allowed!");
			return;
		}
		setLinks((prev) => [
			...prev,
			{ id: generateId(), name: "", url: "", isCustom: true },
		]);
	};

	const handleRemoveLink = (id: string) => {
		setLinks((prev) => prev.filter((l) => l.id !== id));
	};

	const handleUpdateLink = (id: string, key: "name" | "url", value: string) => {
		setLinks((prev) =>
			prev.map((l) => (l.id === id ? { ...l, [key]: value } : l))
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;

		const socialLinks = filledLinks.map((l) => ({
			name: l.name.trim() || "Social Link",
			url: sanitizeUrlForPayload(l.name, l.url),
		}));

		mutate(
			{ socialLinks },
			{
				onSuccess: (data) => {
					setGeneratedSocials(data.socialSection);
					onGeneratedChange?.(true);
					showToast.success("Socials section generated successfully!");
				},
				onError: (err: any) => {
					const errorMsg =
						err?.message ||
						err?.response?.data?.message ||
						"Failed to generate socials. Please try again.";
					showToast.error(errorMsg);
				},
			},
		);
	};

	const handleReset = () => {
		setGeneratedSocials(null);
		onGeneratedChange?.(false);
	};

	return (
		<section id="socials-section" className="w-full">
			<div className="mx-auto w-full max-w-2xl">
				{/* Section header */}
				<div className="mb-8">
					<div className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
						<Share2 className="h-3.5 w-3.5 text-emerald-400" />
						Step 5
					</div>

					<h2
						className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl"
						style={{ lineHeight: "1.15" }}
					>
						Add your <span className="text-emerald-400">social links.</span>
					</h2>
					<p className="mt-3 max-w-[52ch] text-base leading-relaxed text-zinc-500">
						Add links to your social media profiles. We'll generate a beautiful, responsive grid of badges for your README.
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
					{/* Glow effect */}
					<div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[60px]" />

					<form onSubmit={handleSubmit} className="relative z-10 p-6 md:p-8">
						<div className="space-y-4">
							<Label className="text-sm font-medium text-zinc-300 block mb-2">
								Social Media Profiles
							</Label>

							<div className="space-y-3.5">
								{links.map((link) => {
									const Icon = getPlatformIcon(link.name);
									const validationError = validateLink(link.name, link.url);
									const isFieldEmpty = link.url.trim() === "";

									return (
										<div
											key={link.id}
											className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-white/[0.01] p-3.5 transition-all duration-300 hover:border-white/10"
										>
											<div className="flex items-center gap-3">
												{/* Left side: Platform name/edit */}
												<div className="flex items-center gap-2 shrink-0 min-w-[120px]">
													<Icon className="h-4 w-4 text-emerald-400" />
													{link.isCustom ? (
														<input
															type="text"
															value={link.name}
															onChange={(e) =>
																handleUpdateLink(link.id, "name", e.target.value)
															}
															disabled={isGenerated || isPending}
															placeholder="Custom name"
															className="w-24 rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1 text-xs text-zinc-200 outline-none focus:border-emerald-500/30"
														/>
													) : (
														<span className="text-sm font-medium text-zinc-300">
															{link.name}
														</span>
													)}
												</div>

												{/* Center: URL input */}
												<div className="flex-1">
													<input
														type="text"
														value={link.url}
														onChange={(e) =>
															handleUpdateLink(link.id, "url", e.target.value)
														}
														disabled={isGenerated || isPending}
														placeholder={
															link.name.toLowerCase() === "gmail"
																? "email@example.com"
																: "https://..."
														}
														className="w-full rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-300 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
													/>
												</div>

												{/* Right: Actions */}
												<div className="shrink-0 flex items-center">
													{(!isGenerated && !isPending) && (
														<button
															type="button"
															onClick={() => handleRemoveLink(link.id)}
															className="rounded-lg p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
															title="Remove link"
														>
															<Trash2 className="h-4 w-4" />
														</button>
													)}
												</div>
											</div>

											{/* Input specific error */}
											{!isFieldEmpty && validationError && (
												<div className="flex items-center gap-1.5 text-[11px] text-red-400 px-1 mt-0.5">
													<AlertCircle className="h-3 w-3 shrink-0" />
													<span>{validationError}</span>
												</div>
											)}
										</div>
									);
								})}
							</div>

							{/* Add custom link button */}
							{!isGenerated && (
								<div className="pt-2">
									<Button
										type="button"
										onClick={handleAddCustom}
										disabled={isPending || links.length >= 15}
										className="h-10 rounded-xl bg-zinc-800 border border-white/8 hover:bg-zinc-700 text-zinc-300 active:scale-[0.98] cursor-pointer"
									>
										<Plus className="h-4 w-4 mr-1.5" />
										Add Custom Link
									</Button>
								</div>
							)}
						</div>

						{/* Global/API Error message */}
						{isError && (
							<div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3">
								<AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
								<span className="text-sm text-red-400/90">
									{(error as Error)?.message ||
										"Failed to generate socials. Please try again."}
								</span>
							</div>
						)}

						{/* Submit / Reset button */}
						<div className="mt-6 pt-4 border-t border-white/5">
							{!isGenerated ? (
								<Button
									type="submit"
									id="socials-generate-btn"
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
											Generating Socials...
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
											Generate Socials Section
										</>
									)}
								</Button>
							) : (
								<Button
									type="button"
									id="socials-reset-btn"
									onClick={handleReset}
									className="group h-10 rounded-xl border border-white/10 bg-white/[0.05] px-6 text-sm font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] cursor-pointer"
								>
									<RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-90" />
									Edit Social Links
								</Button>
							)}
						</div>
					</form>
				</div>

				{/* Generated output */}
				{isGenerated && <MarkdownPreviewer markdown={generatedSocials} />}
			</div>
		</section>
	);
}