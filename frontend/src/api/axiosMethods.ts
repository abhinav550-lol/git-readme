import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

type RequestConfig = Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'withCredentials'>

const mergeConfig = (config?: RequestConfig): AxiosRequestConfig => ({
	...(config ?? {}),
	withCredentials: true,
})

export const axiosGet = async <TResponse = unknown>(
	url: string,
	config?: RequestConfig,
): Promise<TResponse> => {
	const response: AxiosResponse<TResponse> = await axios.get(url, mergeConfig(config))
	return response.data
}

export const axiosPost = async <TResponse = unknown, TPayload = unknown>(
	url: string,
	payload?: TPayload,
	config?: RequestConfig,
): Promise<TResponse> => {
	const response: AxiosResponse<TResponse> = await axios.post(url, payload, mergeConfig(config))
	return response.data
}

export const axiosPut = async <TResponse = unknown, TPayload = unknown>(
	url: string,
	payload?: TPayload,
	config?: RequestConfig,
): Promise<TResponse> => {
	const response: AxiosResponse<TResponse> = await axios.put(url, payload, mergeConfig(config))
	return response.data
}

export const axiosDelete = async <TResponse = unknown, TPayload = unknown>(
	url: string,
	payload?: TPayload,
	config?: RequestConfig,
): Promise<TResponse> => {
	const response: AxiosResponse<TResponse> = await axios.delete(url, {
		...mergeConfig(config),
		data: payload,
	})
	return response.data
}
