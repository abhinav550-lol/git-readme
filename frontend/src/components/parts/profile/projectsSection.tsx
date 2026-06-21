import { useState, useEffect } from "react";
import { mutations } from "@/api/profileApi";
import { queries as userQueries, userApiFn, type Repository } from "@/api/userApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	FolderGit2,
	ExternalLink,
	FileText,
	Check,
	Search,
	AlertCircle,
	Sparkles,
	RotateCcw,
	X,
} from "lucide-react";
import { MarkdownPreviewer } from "./markdownPreviewer";
import { showToast } from "@/utils/toast";
import MarkdownPreview from "@uiw/react-markdown-preview";

export function projectsSection({
	onGeneratedChange,
}: {
	onGeneratedChange?: (generated: boolean) => void;
}) {
	const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null);

	// README viewer states
	const [viewingRepo, setViewingRepo] = useState<Repository | null>(null);
	const [readmeContent, setReadmeContent] = useState<string | null>(null);
	const [loadingReadme, setLoadingReadme] = useState(false);
	const [readmeError, setReadmeError] = useState<string | null>(null);

	// Multi-step generation loader states
	const [isFetchingReadmes, setIsFetchingReadmes] = useState(false);
	const [generationStep, setGenerationStep] = useState<"fetching" | "generating" | null>(null);

	// Fetch repositories query
	const { data, isLoading, isError, error, refetch } = userQueries.useFetchRepos();

	const repositories = data?.repositories || [];

	// Generate section mutation
	const generateMutation = mutations.useGenerateRepos();

	// Repository validation states
	const [checkingRepos, setCheckingRepos] = useState<Record<string, boolean>>({});
	const [repoReadmeStatus, setRepoReadmeStatus] = useState<Record<string, boolean | "checking">>({});

	// Batch validate all repositories' readme presence in background
	useEffect(() => {
		if (repositories.length === 0) return;

		let active = true;

		const checkReadmes = async () => {
			const batchSize = 4;
			for (let i = 0; i < repositories.length; i += batchSize) {
				if (!active) break;
				const batch = repositories.slice(i, i + batchSize);
				await Promise.all(
					batch.map(async (repo) => {
						if (repoReadmeStatus[repo.name] !== undefined) return;
						setRepoReadmeStatus((prev) => ({ ...prev, [repo.name]: "checking" }));
						try {
							const res = await userApiFn.fetchReadme(repo.name);
							const hasReadme = res.success && !!res.readme && res.readme.trim().length > 0;
							if (active) {
								setRepoReadmeStatus((prev) => ({ ...prev, [repo.name]: hasReadme }));
							}
						} catch {
							if (active) {
								setRepoReadmeStatus((prev) => ({ ...prev, [repo.name]: false }));
							}
						}
					})
				);
			}
		};

		checkReadmes();

		return () => {
			active = false;
		};
	}, [repositories]);

	const isGenerated = generatedMarkdown !== null;

	// Auto-initialize selected repos if they exist in generated content or similar, 
	// but here we just manage it locally as step state.
	const handleToggleSelect = async (repo: Repository) => {
		if (isGenerated || generateMutation.isPending || isFetchingReadmes || checkingRepos[repo.name] || repoReadmeStatus[repo.name] === false) return;

		const isAlreadySelected = selectedRepos.some((r) => r.name === repo.name);
		if (isAlreadySelected) {
			setSelectedRepos((prev) => prev.filter((r) => r.name !== repo.name));
		} else {
			if (selectedRepos.length >= 8) {
				showToast.warning("Maximum of 8 repositories can be selected!");
				return;
			}

			// If viewing in modal, check the loaded readmeContent directly to save network roundtrip
			if (viewingRepo && viewingRepo.name === repo.name) {
				if (!readmeContent || !readmeContent.trim()) {
					showToast.error(`Repository "${repo.name}" has no README.md content.`);
					return;
				}
				setSelectedRepos((prev) => [...prev, repo]);
				return;
			}

			setCheckingRepos((prev) => ({ ...prev, [repo.name]: true }));
			try {
				const res = await userApiFn.fetchReadme(repo.name);
				if (res.success && res.readme && res.readme.trim()) {
					setSelectedRepos((prev) => [...prev, repo]);
				} else {
					showToast.error(`Repository "${repo.name}" has no README.md content.`);
				}
			} catch (err: any) {
				showToast.error(`Repository "${repo.name}" has no README.md or failed to load.`);
			} finally {
				setCheckingRepos((prev) => ({ ...prev, [repo.name]: false }));
			}
		}
	};

	const loadReadme = async (repoName: string) => {
		setLoadingReadme(true);
		setReadmeError(null);
		setReadmeContent(null);
		try {
			const res = await userApiFn.fetchReadme(repoName);
			if (res.success) {
				setReadmeContent(res.readme);
			} else {
				setReadmeError(res.message || "Failed to fetch README content.");
			}
		} catch (err: any) {
			const errMsg = err?.message || err?.response?.data?.message || "Failed to load README.";
			setReadmeError(errMsg);
		} finally {
			setLoadingReadme(false);
		}
	};

	const handleOpenReadme = (repo: Repository) => {
		setViewingRepo(repo);
		loadReadme(repo.name);
	};

	const handleCloseReadme = () => {
		setViewingRepo(null);
		setReadmeContent(null);
		setReadmeError(null);
		setLoadingReadme(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedRepos.length === 0) return;

		setIsFetchingReadmes(true);
		setGenerationStep("fetching");

		try {
			// Fetch READMEs for all selected repos in parallel
			const reposWithReadmes = await Promise.all(
				selectedRepos.map(async (repo) => {
					try {
						const readmeRes = await userApiFn.fetchReadme(repo.name);
						return {
							repo: {
								name: repo.name,
								description: repo.description,
								html_url: repo.html_url,
							},
							readmeContent: readmeRes.readme || "",
						};
					} catch (fetchErr) {
						// Fallback if README fetch fails for a single repo
						return {
							repo: {
								name: repo.name,
								description: repo.description,
								html_url: repo.html_url,
							},
							readmeContent: "",
						};
					}
				}),
			);

			setGenerationStep("generating");
			setIsFetchingReadmes(false);

			generateMutation.mutate(
				{ repos: reposWithReadmes },
				{
					onSuccess: (data) => {
						setGeneratedMarkdown(data?.repoSection || "");
						showToast.success("Featured projects section generated successfully!");
						setGenerationStep(null);
						onGeneratedChange?.(true);
					},
					onError: (err: any) => {
						const errorMsg =
							err?.message ||
							err?.response?.data?.message ||
							"Failed to generate projects section. Please try again.";
						showToast.error(errorMsg);
						setGenerationStep(null);
					},
				},
			);
		} catch (err: any) {
			showToast.error("Failed to collect repository details. Please try again.");
			setIsFetchingReadmes(false);
			setGenerationStep(null);
		}
	};

	const handleReset = () => {
		setGeneratedMarkdown(null);
		setSelectedRepos([]);
		setSearchQuery("");
		onGeneratedChange?.(false);
	};

	// Filter repositories based on search input
	const filteredRepos = repositories.filter((repo) =>
		repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<section id="projects-section" className="w-full">
			<div className="mx-auto w-full max-w-2xl">
				{/* Section header */}
				<div className="mb-8">
					<div className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
						<FolderGit2 className="h-3.5 w-3.5 text-emerald-400" />
						Step 4
					</div>

					<h2
						className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl"
						style={{ lineHeight: "1.15" }}
					>
						Featured <span className="text-emerald-400">projects.</span>
					</h2>
					<p className="mt-3 max-w-[52ch] text-base leading-relaxed text-zinc-500">
						Select up to 8 of your public repositories. We'll read their READMEs to generate a polished featured projects section.
					</p>
				</div>

				{/* Selection and Configuration Card */}
				<div
					className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md mb-6"
					style={{
						boxShadow:
							"0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
					}}
				>
					{/* Glow effect */}
					<div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[60px]" />

					<form onSubmit={handleSubmit} className="relative z-10 p-6 md:p-8">
						{!isGenerated ? (
							<div className="space-y-6">
								{/* Selection Header Counters */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<Label className="text-sm font-medium text-zinc-300">
										Select Repositories
									</Label>
									<span
										className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
											selectedRepos.length > 0
												? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
												: "border-white/8 bg-white/[0.02] text-zinc-500"
										}`}
									>
										Selected ({selectedRepos.length} / 8 max)
									</span>
								</div>

								{/* Search Filter */}
								<div className="relative">
									<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
									<input
										type="text"
										placeholder="Filter repositories by name..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full rounded-xl border border-white/8 bg-white/[0.03] pl-10 pr-4 py-3 text-sm leading-relaxed text-zinc-200 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10"
									/>
								</div>

								{/* Repo Picker List */}
								{isLoading ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{Array.from({ length: 4 }).map((_, i) => (
											<div
												key={i}
												className="h-[160px] rounded-xl border border-white/5 bg-white/[0.01] p-5 space-y-4 animate-pulse"
											>
												<div className="flex justify-between items-start">
													<div className="h-5 bg-zinc-800 rounded w-2/3" />
													<div className="h-4 bg-zinc-800 rounded w-4" />
												</div>
												<div className="space-y-2">
													<div className="h-3 bg-zinc-800 rounded w-full" />
													<div className="h-3 bg-zinc-800 rounded w-5/6" />
												</div>
												<div className="pt-3 border-t border-white/5 flex justify-between">
													<div className="h-3 bg-zinc-800 rounded w-1/4" />
													<div className="h-3 bg-zinc-800 rounded w-1/5" />
												</div>
											</div>
										))}
									</div>
								) : isError ? (
									<div className="flex flex-col items-center justify-center py-10 px-4 border border-red-500/10 bg-red-500/[0.02] rounded-xl text-center">
										<AlertCircle className="h-8 w-8 text-red-400 mb-3" />
										<span className="text-sm font-semibold text-red-400">
											Failed to load repositories
										</span>
										<span className="text-xs text-zinc-500 mt-1 max-w-[40ch]">
											{(error as Error)?.message || "Please verify your GitHub connection."}
										</span>
										<button
											type="button"
											onClick={() => refetch()}
											className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
										>
											Retry Fetching
										</button>
									</div>
								) : filteredRepos.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
										{filteredRepos.map((repo) => {
											const isSelected = selectedRepos.some((r) => r.name === repo.name);
											const isChecking = checkingRepos[repo.name] || repoReadmeStatus[repo.name] === "checking";
											const hasNoReadme = repoReadmeStatus[repo.name] === false;
											return (
												<div
													key={repo.name}
													onClick={() => !isChecking && !hasNoReadme && handleToggleSelect(repo)}
													className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
														hasNoReadme
															? "border-zinc-900 bg-zinc-950/20 opacity-35 grayscale cursor-not-allowed"
															: isChecking
																? "border-zinc-850 bg-zinc-900/30 opacity-70 cursor-wait"
																: isSelected
																	? "border-emerald-500/30 bg-emerald-500/[0.04] shadow-[0_4px_20px_rgba(16,185,129,0.08)] cursor-pointer"
																	: "border-white/6 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04] cursor-pointer"
													}`}
												>
													{hasNoReadme && (
														<div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 p-4">
															<div className="bg-zinc-900 border border-red-500/20 rounded-xl p-3 text-center shadow-2xl w-full max-w-[180px] transform scale-95 group-hover:scale-100 transition-transform duration-200">
																<AlertCircle className="h-4.5 w-4.5 text-red-400 mx-auto mb-1.5" />
																<span className="block text-[10px] font-bold uppercase tracking-wider text-red-400">
																	No README
																</span>
																<span className="block text-[9px] text-zinc-500 mt-0.5 leading-normal">
																	Repository has no readme
																</span>
															</div>
														</div>
													)}
													<div>
														<div className="flex items-start justify-between gap-2">
															<h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors duration-200 break-all text-sm pr-4">
																{repo.name}
															</h3>
															<a
																href={repo.html_url}
																target="_blank"
																rel="noopener noreferrer"
																onClick={(e) => e.stopPropagation()}
																className="text-zinc-500 hover:text-white transition-colors shrink-0 p-1 hover:bg-white/5 rounded"
															>
																<ExternalLink className="h-3.5 w-3.5" />
															</a>
														</div>
														<p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
															{repo.description || "No description provided."}
														</p>
													</div>

													<div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
														<button
															type="button"
															disabled={isChecking}
															onClick={(e) => {
																e.stopPropagation();
																handleOpenReadme(repo);
															}}
															className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
														>
															<FileText className="h-3.5 w-3.5" />
															View README
														</button>

														<div className="flex items-center gap-1.5">
															<span
																className={`text-[10px] font-medium tracking-wider uppercase ${
																	isChecking
																		? "text-zinc-500 animate-pulse"
																		: isSelected
																			? "text-emerald-400"
																			: "text-zinc-500"
																}`}
															>
																{isChecking ? "Checking..." : isSelected ? "Selected" : "Select"}
															</span>
															<div
																className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
																	isSelected
																		? "border-emerald-500 bg-emerald-500 text-zinc-950"
																		: "border-white/20 bg-transparent"
																}`}
															>
																{isChecking ? (
																	<svg className="animate-spin h-2.5 w-2.5 text-zinc-400" viewBox="0 0 24 24" fill="none">
																		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
																		<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
																	</svg>
																) : isSelected ? (
																	<Check className="h-3 w-3 stroke-[3]" />
																) : null}
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
										<FolderGit2 className="h-10 w-10 text-zinc-600 mb-3" />
										<p className="text-sm text-zinc-400 font-medium">No repositories found</p>
										<p className="text-xs text-zinc-600 mt-1 text-center max-w-[32ch]">
											{searchQuery
												? "Try refining your search query."
												: "We couldn't find any public repositories on your GitHub account."}
										</p>
									</div>
								)}
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="text-sm font-medium text-zinc-300">
										Generated Section Layout
									</Label>
									<span className="text-xs font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full">
										Active ({selectedRepos.length} Repos)
									</span>
								</div>
								<div className="text-zinc-400 text-xs py-2 leading-relaxed">
									Your featured project section has been successfully generated. Below is a preview of the output Markdown file code.
								</div>
							</div>
						)}

						{/* Error message */}
						{generateMutation.isError && (
							<div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3">
								<AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
								<span className="text-sm text-red-400/90">
									{(generateMutation.error as Error)?.message ||
										"Failed to generate projects section. Please try again."}
								</span>
							</div>
						)}

						{/* Submit / Reset button */}
						<div className="mt-6 pt-4 border-t border-white/5">
							{!isGenerated ? (
								<Button
									type="submit"
									id="projects-generate-btn"
									disabled={selectedRepos.length === 0 || generateMutation.isPending || isFetchingReadmes}
									className="group h-12 w-full rounded-xl bg-emerald-500 px-7 text-sm font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-emerald-500 cursor-pointer"
									style={{
										boxShadow:
											selectedRepos.length > 0 && !generateMutation.isPending
												? "0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)"
												: "none",
									}}
								>
									<Sparkles className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
									Generate Projects Section
								</Button>
							) : (
								<Button
									type="button"
									id="projects-reset-btn"
									onClick={handleReset}
									className="group h-10 rounded-xl border border-white/10 bg-white/[0.05] px-6 text-sm font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] cursor-pointer"
								>
									<RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-90" />
									Edit Selected Projects
								</Button>
							)}
						</div>
					</form>
				</div>

				{/* Generated output preview */}
				{isGenerated && <MarkdownPreviewer markdown={generatedMarkdown} />}
			</div>

			{/* Multi-step loading Overlay */}
			{(isFetchingReadmes || generateMutation.isPending) && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
					<div className="text-center max-w-sm px-6">
						<div className="relative w-16 h-16 mx-auto mb-6">
							<div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
							<div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
							<Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400 animate-pulse" />
						</div>
						<h3 className="text-lg font-semibold text-white">
							{generationStep === "fetching"
								? "Fetching repository contents..."
								: "Generating projects section..."}
						</h3>
						<p className="text-xs text-zinc-500 mt-2 leading-relaxed">
							{generationStep === "fetching"
								? `Downloading README files for your selected repositories (${selectedRepos.length} total).`
								: "Analyzing README files to compile your featured projects layout."}
						</p>
					</div>
				</div>
			)}

			{/* README Viewer Dialog Modal */}
			{viewingRepo && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 cursor-pointer animate-in fade-in"
						onClick={handleCloseReadme}
					/>

					{/* Dialog Content */}
					<div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
						{/* Header */}
						<div className="flex items-center justify-between border-b border-white/6 px-6 py-4 bg-zinc-950/40">
							<div className="flex items-center gap-2.5 min-w-0">
								<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
									<FolderGit2 className="h-4 w-4" />
								</div>
								<span className="font-semibold text-white truncate pr-4 text-sm sm:text-base">
									{viewingRepo.name} README.md
								</span>
							</div>
							<div className="flex items-center gap-3 shrink-0">
								<button
									type="button"
									disabled={loadingReadme || (!selectedRepos.some((r) => r.name === viewingRepo.name) && (!readmeContent || !readmeContent.trim()))}
									onClick={() => handleToggleSelect(viewingRepo)}
									className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-200 border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
										selectedRepos.some((r) => r.name === viewingRepo.name)
											? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
											: "bg-white/[0.04] text-zinc-300 border-white/8 hover:bg-white/[0.08] hover:border-white/12"
									}`}
								>
									{selectedRepos.some((r) => r.name === viewingRepo.name) ? "Selected" : "Select Repo"}
								</button>
								<button
									onClick={handleCloseReadme}
									className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						</div>

						{/* Readme content container */}
						<div className="p-6 overflow-y-auto flex-1 bg-zinc-950/20" data-color-mode="dark">
							{loadingReadme ? (
								<div className="flex flex-col items-center justify-center py-20">
									<div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" />
									<span className="text-xs text-zinc-500 font-medium">Fetching README content...</span>
								</div>
							) : readmeError ? (
								<div className="flex flex-col items-center justify-center py-12 px-4 border border-red-500/10 bg-red-500/[0.02] rounded-xl text-center">
									<AlertCircle className="h-8 w-8 text-red-400 mb-3" />
									<span className="text-sm font-semibold text-red-400">
										Failed to load README
									</span>
									<span className="text-xs text-zinc-500 mt-1 max-w-[40ch]">{readmeError}</span>
									<button
										type="button"
										onClick={() => loadReadme(viewingRepo.name)}
										className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
									>
										Try Again
									</button>
								</div>
							) : readmeContent !== null ? (
								<div className="prose prose-invert max-w-none">
									{readmeContent.trim() ? (
										<MarkdownPreview
											source={readmeContent}
											style={{
												backgroundColor: "transparent",
												fontFamily: "inherit",
											}}
											wrapperElement={{
												"data-color-mode": "dark",
											}}
										/>
									) : (
										<div className="text-center py-12 text-zinc-500 text-sm">
											This repository's README.md file is empty.
										</div>
									)}
								</div>
							) : (
								<div className="text-center py-12 text-zinc-500 text-sm">
									No README content could be resolved.
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</section>
	);
}