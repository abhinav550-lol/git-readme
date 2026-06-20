import GitHubIcon from '@mui/icons-material/GitHub'

const Footer = () => {
	return (
		<footer className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 lg:px-12">
			<div className="flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-6 sm:flex-row">
				<p className="text-sm text-zinc-600">
					Built by <span className="text-zinc-400">abhinav550</span>
				</p>
				<a
					href="https://github.com/abhinav550-lol"
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-300"
				>
					<GitHubIcon style={{ fontSize: 16 }} />
					github.com/abhinav550-lol
				</a>
			</div>
		</footer>
	)
}

export default Footer
