import axios from "axios";
import appError from "../error/appError.js";

export async function getGithubUserByToken(access_token : string){
	try {
		const response = await axios.get("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${access_token}`,
				Accept: "application/vnd.github+json",
			},
		});

		return response.data ?? null;
	} catch {
		return null;
	}
}

export async function getGithubEmailByToken(access_token : string) : Promise<string | null>{
		let email: string | null = null;

		try {
			const response = await axios.get("https://api.github.com/user/emails", {
				headers: {
					Authorization: `Bearer ${access_token}`,
					Accept: "application/vnd.github+json",
				},
			});

			const emails = response.data;
			if (Array.isArray(emails)) {
				const primaryVerifiedEmail = emails.find(
					(item: { email?: string; primary?: boolean; verified?: boolean }) =>
						item.primary && item.verified,
				);
				email = primaryVerifiedEmail?.email ?? null;
			}
		} catch {
			return null;
		}

		return email;
}

export async function getGithubIdByUsername(username: string): Promise<string | null> {
	try {
		const response = await axios.get(
			`https://api.github.com/users/${username}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				},
			},
		);

		if (response?.data?.id == null) return null;
		return String(response.data.id);
	} catch (err) {
		if (axios.isAxiosError(err) && err.response) {
			throw new appError(err.response.status, "Failed to resolve GitHub user id");
		}
		throw new appError(500, "Failed to resolve GitHub user id");
	}
}


/** Creates the link for contribution stats card link based on the type and theme
 * Classic - https://github-readme-streak-stats.herokuapp.com/?user=<username>&theme=<github_dark | default>
 * Mordern - ${process.env.API_BASE_URL}/api/profile/card/contribution-stats?username=<username>&color_scheme=<dark | light>
 */
export function createContributionStatsLink(type: string, username: string, theme: string) : string {
	switch(type){
		case "classic":
			const adjusted_theme = theme === "dark" ? "github_dark" : "default";
			return `https://github-readme-streak-stats.herokuapp.com?username=${username}&theme=${adjusted_theme}`;
		case "modern":
			return `${process.env.API_BASE_URL}/api/profile/card/contribution-stats?username=${username}&color_scheme=${theme}`;
		default:
			return `${process.env.API_BASE_URL}/api/profile/card/contribution-stats?username=${username}&color_scheme=${theme}`;
	}
}


/** Creates the link for contribution stats card link based on the type and theme
 * Classic - http://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username={username}&theme={theme_name}
 * Mordern - ${process.env.API_BASE_URL}/api/profile/card/language-stats?username=<username>&color_scheme=<dark | light>
 */
export function createLanguageStatsLink(type: string, username: string, theme: string) : string {
	switch(type){
		case "classic":
			const adjusted_theme = theme === "dark" ? "github_dark" : "default";
			return `https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${username}&theme=${adjusted_theme}`;
		case "modern":
			return `${process.env.API_BASE_URL}/api/profile/card/language-stats?username=${username}&color_scheme=${theme}`;
		default:
			return `${process.env.API_BASE_URL}/api/profile/card/language-stats?username=${username}&color_scheme=${theme}`;
	}
}