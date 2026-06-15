import DashboardNavbar from './parts/DashboardNavbar'
import Footer from './parts/Footer'
import { ArrowRight, Sparkles, Info, BarChart3, Palette, GitBranch, Layers } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const authState = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

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
					backgroundSize: '64px 64px',
				}}
			/>
			<div className="landing-animate-glow absolute left-[60%] top-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
			<div className="landing-animate-glow absolute left-[30%] top-[60%] h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]" style={{ animationDelay: '3s' }} />
		</div>

		<DashboardNavbar />

		{/* ── Hero Section ── */}
		<section className="relative z-10 flex min-h-[100vh] items-center justify-center px-6 lg:px-12">
			<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
				{/* Badge */}
				<div className="landing-animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
					<Sparkles className="h-3.5 w-3.5 text-emerald-400" />
					Hello, {authState.login}
				</div>

				{/* Headline */}
				<h1 className="landing-animate-fade-up landing-delay-1 mt-8 text-4xl font-semibold tracking-tighter text-white md:text-5xl lg:text-6xl" style={{ lineHeight: '1.08' }}>
					Build your<br />
					<span className="text-emerald-400">GitHub profile.</span>
				</h1>

				{/* Subtext */}
				<p className="landing-animate-fade-up landing-delay-2 mt-6 max-w-[52ch] text-base leading-relaxed text-zinc-500 md:text-xl">
					Build a beautiful GitHub profile README that showcases who you are, what you've built, and where to find you—then push it straight to GitHub with minimal clicks.
				</p>

				{/* CTA */}
				<div className="landing-animate-fade-up landing-delay-3 mt-10">
					<Button
						type="button"
						id="dashboard-hero-cta"
						className="group h-13 rounded-full bg-emerald-500 px-8 text-md md:text-xl font-medium text-zinc-950 transition-all duration-300 hover:bg-emerald-400 active:scale-[0.97] cursor-pointer"
						style={{
							boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.3), 0 8px 30px rgba(16, 185, 129, 0.15)',
						}}
						onClick={() => {
							document.getElementById('generation-section')?.scrollIntoView({ behavior: 'smooth' })
						}}
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

		{/* ── Explore Section ── */}
		<section id="generation-section" className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 lg:px-12">
			<div className="relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
				{/* Inner glow */}
				<div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/6 blur-[80px]" />

				<div className="relative z-10 p-10 md:p-14">
					{/* Section label */}
					<p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-emerald-400 md:text-xs">
						Explore
					</p>

					<h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
						Your GitHub, visualized.
					</h2>

					<p className="mt-3 max-w-[55ch] text-sm leading-relaxed text-zinc-500 md:text-base">
						Dive into your contributions, language stats, and profile cards — all generated dynamically from your GitHub data. Check out the docs to learn how each card works.
					</p>

					{/* Feature pills */}
					<div className="mt-8 flex flex-wrap gap-3">
						{[
							{ icon: GitBranch, label: 'Contributions', color: 'text-emerald-400 bg-emerald-500/10' },
							{ icon: Palette, label: 'Languages', color: 'text-sky-400 bg-sky-500/10' },
							{ icon: BarChart3, label: 'Stats Cards', color: 'text-amber-400 bg-amber-500/10' },
							{ icon: Layers, label: 'Profile Cards', color: 'text-violet-400 bg-violet-500/10' },
						].map((item) => (
							<div
								key={item.label}
								className="flex items-center gap-2 rounded-full border border-white/6 bg-white/[0.03] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
							>
								<item.icon className={`h-4 w-4 ${item.color.split(' ')[0]}`} />
								<span className="text-sm font-medium text-zinc-300">{item.label}</span>
							</div>
						))}
					</div>

					{/* Docs button */}
					<Button
						type="button"
						id="explore-docs-cta"
						className="mt-8 h-11 rounded-full border border-white/10 bg-white/[0.05] px-6 text-sm md:text-base font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] cursor-pointer"
						onClick={() => navigate('/docs')}
					>
						Read the Docs
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</section>

		<Footer />
	</main>
  )
}

export default Dashboard
