import MarkdownPreview from "@uiw/react-markdown-preview";
import { Copy, Check, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MarkdownPreviewerProps {
	markdown: string;
}

export function MarkdownPreviewer({ markdown }: MarkdownPreviewerProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(markdown);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<div
			className="mt-6 overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/40 shadow-lg backdrop-blur-md"
			style={{
				animation: "landing-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
			}}
		>
			{/* Previewer Header */}
			<div className="flex items-center justify-between border-b border-white/6 px-5 py-3 bg-zinc-950/40">
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
						<FileText className="h-3.5 w-3.5" />
					</div>
					<span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
						README Preview
					</span>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleCopy}
					className="h-8 rounded-lg border-white/6 bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
				>
					{copied ? (
						<>
							<Check className="h-3.5 w-3.5 text-emerald-400" />
							<span className="text-xs font-medium text-emerald-400">Copied</span>
						</>
					) : (
						<>
							<Copy className="h-3.5 w-3.5" />
							<span className="text-xs font-medium">Copy Markdown</span>
						</>
					)}
				</Button>
			</div>

			{/* Markdown Container */}
			<div className="p-6 overflow-x-auto" data-color-mode="dark">
				<MarkdownPreview
					source={markdown}
					style={{
						backgroundColor: "transparent",
						fontFamily: "inherit",
					}}
					wrapperElement={{
						"data-color-mode": "dark",
					}}
				/>
			</div>
		</div>
	);
}
