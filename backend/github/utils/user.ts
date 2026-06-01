import axios from "axios";
import appError from "../../error/appError.js";


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


