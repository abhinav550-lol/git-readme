import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosGet } from "./axiosMethods";
import type { Response } from "./response";

export interface Repository {
  name: string;
  description: string | null;
  html_url: string;
}

interface GetReposResponse extends Response<null> {
  repositories: Repository[];
}

interface GetReadmeResponse extends Response<null> {
  readme: string;
}

const fn = {
	logoutUser : async () => {
		const res = await axiosGet<Response<number>>(`${import.meta.env.VITE_BACKEND_URL}/api/app/user-count`);
		return res;
	},
	fetchRepos: async () => {
		const res = await axiosGet<GetReposResponse>(
			`${import.meta.env.VITE_BACKEND_URL}/api/user/repos`,
		);
		return res;
	},
	fetchReadme: async (repoName: string) => {
		const res = await axiosGet<GetReadmeResponse>(
			`${import.meta.env.VITE_BACKEND_URL}/api/user/repos/${repoName}/readme`,
		);
		return res;
	},
}

const queries = {
	useLogout: () => {
		return useQuery({
			queryKey: ['app-users'],
			queryFn: fn.logoutUser,	
		})
	},
	useFetchRepos: () => {
		return useQuery({
			queryKey: ["profile-repos"],
			queryFn: fn.fetchRepos,
		});
	},
}

const mutations = {
	useFetchReadme: () => {
		return useMutation({
			mutationFn: fn.fetchReadme,
		});
	},
}

export { queries, mutations, fn as userApiFn };

