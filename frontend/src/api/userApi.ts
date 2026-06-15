import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "./axiosMethods";
import type { Response } from "./response";

const fn = {
	logoutUser : async () => {
		const res = await axiosGet<Response<number>>(`${import.meta.env.VITE_BACKEND_URL}/api/app/user-count`);
		return res;
	}
}

const queries = {
	useLogout: () => {
		return useQuery({
			queryKey: ['app-users'],
			queryFn: fn.logoutUser,	
		})
	}
}

export { queries };
