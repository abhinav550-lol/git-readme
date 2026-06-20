import { LogOut, FileCode2 } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { clearAuth } from '@/store/authSlice'
import { axiosPost } from '@/api/axiosMethods'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DashboardNavbar = () => {
	const authState = useAppSelector((state) => state.auth)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const handleLogout = async () => {
		try {
			await axiosPost(`${import.meta.env.VITE_BACKEND_URL}/api/user/auth/github/logout`)
			dispatch(clearAuth())
			navigate('/')
		} catch (error) {
			console.error('Logout failed:', error)
			toast.error('Logout failed. Please try again.')
		}
	}

	return (
		<nav className="dashboard-navbar-animate-in absolute top-5 inset-x-0 z-50 mx-auto w-[calc(100%-2.5rem)] max-w-5xl">
			<div
				className="flex items-center justify-between rounded-2xl border border-white/8 bg-zinc-900/60 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
				style={{
					boxShadow:
						'0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
				}}
			>
				{/* Left: Brand */}
				<a
					href="/dashboard"
					className="flex items-center gap-2 text-white transition-opacity duration-200 hover:opacity-80"
				>
					<span className="text-lg font-semibold tracking-tight">
						Git<span className="text-emerald-400">README</span>
					</span>
				</a>

				{/* Right: Nav items */}
				<div className="flex items-center gap-1 sm:gap-2">
					{/* Docs */}
					<div
						onClick={() => {navigate('/docs')}}
						className="group flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-zinc-200 cursor-pointer"
					>
						<FileCode2 className="h-4 w-4 text-zinc-500 transition-colors duration-200 group-hover:text-emerald-400" />
						<span className="hidden sm:inline">&lt;&gt;</span>
						<span className="hidden sm:inline">Docs</span>
					</div>

					{/* Divider */}
					<div className="mx-1 h-5 w-px bg-white/8 sm:mx-2" />

					{/* User login */}
					<div className=" items-center gap-2 rounded-xl px-3 py-2 hidden md:flex">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40"></span>
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
						</span>
						<span className="text-sm font-medium text-zinc-300">
							@{authState.login}
						</span>
					</div>

					{/* Divider */}
					<div className="mx-1 h-5 w-px bg-white/8 sm:mx-2 hidden md:flex" />

					{/* Logout */}
					<button
						type="button"
						onClick={handleLogout}
						className="group flex items-center gap-1.5 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2 text-sm font-medium  shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 border-red-500/20 bg-red-500/[0.06] active:scale-[0.97] cursor-pointer"
					>
						<LogOut className="h-3.5 w-3.5 transition-colors duration-200 text-red-400" />
						<span className="hidden sm:inline text-red-400">Logout</span>
					</button>
				</div>
			</div>
		</nav>
	)
}

export default DashboardNavbar
