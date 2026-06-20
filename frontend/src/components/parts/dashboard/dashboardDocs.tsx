import { ArrowRight, BarChart3, Palette, GitBranch, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'


export function DashboardDocs(){
	const navigate = useNavigate()

	return (
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
	)
}