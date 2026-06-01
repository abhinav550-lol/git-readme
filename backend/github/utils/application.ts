/** Creates the link for contribution stats card link based on the type and theme
 * Classic - https://github-readme-streak-stats.herokuapp.com/?user=abhinav550-lol&theme=dark
 * Mordern - ${process.env.API_BASE_URL}/api/profile/card/contribution-stats?username=<username>&color_scheme=<dark | light>
 */
export function createContributionStatsLink(type: string, username: string, theme: string) : string {
	switch(type){
		case "classic":
			const adjusted_theme = theme === "dark" ? "dark" : "default";
			return `https://github-readme-streak-stats.herokuapp.com?user=${username}&theme=${adjusted_theme}`;
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

/**
 * 
 * @param profileData 
 * @returns A markdown string that combines all the non-empty sections of the profile with horizontal rules as separators. 
 * 
 */
export function generateProfileMarkdown(
  profileData: { section: string; content: string | null }[]
) {
  return profileData
    .filter((sectionData) => sectionData.content !== null && sectionData.content.trim() !== "")
    .map((sectionData) => sectionData.content!.trim())
    .join("\n\n---\n\n");
}