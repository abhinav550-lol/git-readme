import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "./axiosMethods";
import type { Response } from "./response";

const fetchers = {
	fetchAppUsers: async () => {
		const res = await axiosGet<Response<number>>(`${import.meta.env.VITE_BACKEND_URL}/api/app/user-count`);
		return res;
	}
}

const queries = {
	useAppUsers: () => {
		return useQuery({
			queryKey: ['app-users'],
			queryFn: fetchers.fetchAppUsers,	
		})
	}
}

export { queries };
