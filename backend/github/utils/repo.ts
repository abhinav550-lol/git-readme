import axios from "axios";
import appError from "../../error/appError.js";

export interface GithubRepo {
	name: string;
	html_url: string;
	description: string | null;
}

export interface GithubReadmeSection {
	repo: GithubRepo;
	readmeContent: string;
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
export async function getAllUserRepositories(accessToken: string): Promise<GithubRepo[]> {
	const response = await axios.get(
		"https://api.github.com/user/repos?per_page=100",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json"
			}
		}
	);

	console.log(response.data)

	const publicRepos = response.data.filter((repo: any) => !repo.private).map((repo: any) => ({

		name: repo.name,
		html_url: repo.html_url,
		description: repo.description
	}));
	return publicRepos;
}

/** 
 * @param username 
 * @param repoName 
 * @param accessToken
 * @return string containing the README.md content or an empty string
 * 
 * This function fetches the README.md file from a specified GitHub repository. It sends a GET request to the GitHub API endpoint for repository contents, including the access token in the Authorization header. If the response contains a content field, it returns the decoded content; otherwise, it returns an empty string.
 */
export async function getRepoReadme(username: string, repoName: string, accessToken: string): Promise<string> {
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

	const readme = response.data?.content ? Buffer.from(response.data.content, "base64").toString("utf-8") : "";
	return readme;
}

export function cleanRepoReadme(readme: string) {
	return readme
		// remove images
		.replace(/!\[.*?\]\(.*?\)/g, "")
		// remove badges/links-heavy markdown images
		.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
		// remove code blocks
		.replace(/```[\s\S]*?```/g, "")
		// remove html tags
		.replace(/<[^>]*>/g, "")
		// remove markdown headings symbols
		.replace(/^#+\s*/gm, "")
		// remove excessive whitespace
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

/** 
 * Checks if a repository exists for a given user.
 * @param username 
 * @param repoName 
 * @param accessToken 
 * @returns Promise resolving to a boolean indicating if the repository exists.
 */
export async function checkIfRepoExists(username: string, repoName: string, accessToken: string): Promise<boolean> {
	const response = await axios.get(
		`https://api.github.com/repos/${username}/${repoName}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json"
			},
			validateStatus: (status) => status === 200 || status === 404
		}
	);

	return response.status === 200;
}


/** 
 * Creates a new repository for a given user.
 * @param username 
 * @param repoName 
 * @param accessToken 
 * @returns Promise resolving when the repository is created.
 */
export async function createRepo(username: string, repoName: string, accessToken: string): Promise<boolean> {
	const response = await axios.post(
		"https://api.github.com/user/repos",
		{
			name: repoName,
			description: "A personalized GitHub profile README showcasing skills, projects, achievements, and developer presence. Generated with GitReadme.",
			private: false
		},
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json"
			}
		}
	);

	return response.status === 201 || response.status === 200 || response.status === 422;
}

/**
 * Updates the README.md file of a specified GitHub repository.
 * @param username 
 * @param repoName 
 * @param readmeContent 
 * @param accessToken 
 * @returns Promise resolving to a boolean indicating if the update was successful.
 */
export async function updateRepoReadme(username: string, repoName: string, readmeContent: string, accessToken: string): Promise<boolean> {
	let sha: string = "";
	const existingReadmeResponse = await axios.get(
			`https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json"
				},
				validateStatus: (status) => status === 200 || status === 404
			},
		);

		if (existingReadmeResponse.status === 200) {
			const existingReadme = existingReadmeResponse.data;
			sha = existingReadme.sha;
		}

	const response = await axios.put(
		`https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
		{
			message: "README.md via GitReadme",
			content: Buffer.from(readmeContent, "utf-8").toString("base64"),
			sha: sha ?? ""
		},
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json"
			}
		}
	);

	return response.status === 200 || response.status === 201;
}
