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