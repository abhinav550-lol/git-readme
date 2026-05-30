import axios from "axios";
import appError from "../error/appError.js";

export interface GithubRepo {
	name : string;
	html_url : string;
	description: string | null;
}

export interface GithubReadmeSection {
	repo : GithubRepo;
	readmeContent : string;
}


export async function getUserCreationDate(username: string): Promise<string> {
	/**
	 *
	 * @param username
	 * @returns account creation date in yyyy-mm-dd format
	 *
	 * This function fetches GitHub user data and returns the created_at date
	 * formatted as yyyy-mm-dd. It throws an appError if the user is not found
	 * or the date format is invalid.
	 */
	try{
  const response = await axios.get(`https://api.github.com/users/${username}`, {
	headers: {
	  ...(process.env.GITHUB_TOKEN && {
		Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
	  }),
	},
  });

  const data = await response.data;
  if (!data?.created_at) throw new appError(404, "User not found");
  
  const date = data.created_at.slice(0, 10); //yyyy-mm-dd format

  const regex = /(\d{4})-(\d{2})-(\d{2})/;
  const match = date.match(regex);
  if (!match) throw new appError(500, "Invalid date format");

  return date;
} catch (error) {
  console.error("Error fetching user creation date:", error);
  throw new appError(500, "Failed to fetch user creation date");
}
}


/** Get Public Repos  */
export async function getPublicRepos(username: string) {
	/**
	 *
	 * @param username
	 * @returns list of public repositories for the user
	 *
	 * This function fetches all public repositories for a GitHub user by
	 * paging through the GitHub API until no more repos are returned.
	 */
  const repos = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;
		let data = [];

		try {
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				},
			});

			data = Array.isArray(response.data) ? response.data : [];
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const status = err.response?.status ?? 500;
				throw new appError(
					status,
					`Failed to fetch repositories for user ${username}`,
				);
			}

			throw new appError(500, `Failed to fetch repositories for user ${username}`);
		}

    if (data.length === 0) break; // no more repos

    repos.push(...data);
    page++;
  }

  return repos;
}


/**
 * 
 * @param accessToken 
 * @returns repos list of the user
 * 
 * This function fetches all repositories of a user using their GitHub access token. It makes a GET request to the GitHub API endpoint for user repositories, including the access token in the Authorization header. The response is returned as a JSON object containing the list of repositories.
 */
export async function getAllUserRepositories(accessToken : string) : Promise<GithubRepo[]> {
		const response = await axios.get(
			"https://api.github.com/user/repos?per_page=100",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json"
				}
			}
		);

		return response.data;
}

/** 
 * @param username 
 * @param repoName 
 * @param accessToken
 * @return string containing the README.md content or an empty string
 * 
 * This function fetches the README.md file from a specified GitHub repository. It sends a GET request to the GitHub API endpoint for repository contents, including the access token in the Authorization header. If the response contains a content field, it returns the decoded content; otherwise, it returns an empty string.
 */
export async function getRepoReadme(username : string , repoName : string , accessToken: string ): Promise<string> {
	const response = await axios.get(
		`https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json"
			},
			validateStatus: (status) => status === 200 || status === 404 
		},
		
	);

	return response.data?.content ? Buffer.from(response.data.content, "base64").toString("utf-8") : "";
}


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