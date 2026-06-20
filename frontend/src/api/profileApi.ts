import { useMutation } from "@tanstack/react-query";
import { axiosPost } from "./axiosMethods";
import type { Response } from "./response";

interface GenerateIntroductionPayload {
	info: string;
	temperature: number;
}

interface GenerateIntroductionResponse extends Response<null> {
	introduction: string;
}

const fn = {
	generateIntroduction: async (payload: GenerateIntroductionPayload) => {
		const res = await axiosPost<GenerateIntroductionResponse, GenerateIntroductionPayload>(
			`${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-introduction`,
			payload,
		);
		return res;
	},
};

const mutations = {
	useGenerateIntroduction: () => {
		return useMutation({
			mutationFn: fn.generateIntroduction,
		});
	},
};

export { mutations };
