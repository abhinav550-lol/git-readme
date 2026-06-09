
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import GitHubIcon from '@mui/icons-material/GitHub';

import { Button } from '@/components/ui/button'

const Landing = () => {
	const demoSectionRef = useRef<HTMLElement | null>(null)
	const [isDemoVisible, setIsDemoVisible] = useState(false)

	useEffect(() => {
		const demoSection = demoSectionRef.current

		if (!demoSection) {
			return
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsDemoVisible(true)
				}
			},
			{
				threshold: 0.35,
				rootMargin: '0px 0px -10% 0px',
			},
		)

		observer.observe(demoSection)

		return () => {
			observer.disconnect()
		}
	}, [])

	return (
		<main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(148,163,184,0.08),transparent_30%),linear-gradient(180deg,#050505_0%,#090909_45%,#111111_100%)]" />
			<div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-size-[72px_72px]" />
			<div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
			<div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

			<section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 sm:py-24 lg:px-12 lg:py-28">
				<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-[0.24em] text-white/70 shadow-[0_0_30px_rgba(255,255,255,0.04)] backdrop-blur-md">
					<Sparkles className="h-3.5 w-3.5 text-white/80" />
					GITREADME
				</div>

				<div className="mt-8 max-w-4xl">
					<h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02]">
						Create stunning GitHub profile READMEs in minutes
					</h1>
					<p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-7 text-white/68 sm:text-lg md:text-xl">
						Design, customize, and generate a professional GitHub profile README that showcases your skills,
						projects, stats, and developer identity.
					</p>
				</div>

				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
					<Button
						type="button"
						className="h-12 rounded-full border border-white/30 bg-white px-6 text-md font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_0_24px_rgba(255,255,255,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/95 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_0_34px_rgba(255,255,255,0.28)] focus-visible:ring-white/60"
						onClick={() => {
							window.location.href = '/dashboard'
						}}
					>
						Get Started
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</section>

			<section
				ref={demoSectionRef}
				className={`relative mx-auto w-full max-w-6xl px-6 pb-24 pt-8 transition-all duration-700 ease-out sm:px-8 lg:px-12 ${
					isDemoVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-10 opacity-0 blur-sm'
				}`}
			>
				<div className="rounded-4xl border border-white/10 bg-white/4 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
					<div className="flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-6 lg:flex-row lg:items-center lg:p-8">
						<div className="flex-1 space-y-4">
							<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
								Demo
							</div>
							<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Watch a quick walkthrough of the README builder
							</h2>
							<p className="max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
								See how easy it is to create a stunning GitHub profile README that showcases your skills,
							</p>
						</div>

						<div className="relative aspect-video w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,#121212_0%,#070707_55%,#101010_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:max-w-2xl">
							<div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]" />
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.12)] backdrop-blur-md">
									<Play className="h-8 w-8 fill-white text-white" />
								</div>
							</div>
							<div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-white/70 backdrop-blur-md">
								Video placeholder
							</div>
						</div>
					</div>
				</div>
			</section>

			<footer className="relative mx-auto w-full max-w-6xl px-6 pb-10 sm:px-8 lg:px-12">
				<div className="border-t border-white/10 pt-6 text-center text-sm text-white/55">
					<p>Developed by abhinav550</p>
					<a
						href="https://github.com/abhinav550-lol"
						target="_blank"
						rel="noreferrer"
						className="mt-2 inline-flex items-center justify-center text-white/75 transition-colors hover:text-white"
					>
						<GitHubIcon /> <span className="ml-1">github.com/abhinav550-lol</span>
					</a>
				</div>
			</footer>
		</main>
	)
}

export default Landing
