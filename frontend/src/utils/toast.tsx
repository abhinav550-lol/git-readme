import { toast, type ToastOptions, type TypeOptions } from 'react-toastify'

export type AppToastType = Extract<TypeOptions, 'success' | 'info' | 'warning' | 'error' | 'default'>

export function appToast(
	message: string,
	type: AppToastType = 'info',
	options?: ToastOptions,
) {
	if (type === 'default') {
		return toast(message, options)
	}

	return toast[type](message, options)
}

export function showToast(
	message: string,
	type: AppToastType = 'info',
	options?: ToastOptions,
) {
	return appToast(message, type, options)
}

showToast.error = (message: string, options?: ToastOptions) => {
	return appToast(message, 'error', options)
}

showToast.success = (message: string, options?: ToastOptions) => {
	return appToast(message, 'success', options)
}

showToast.info = (message: string, options?: ToastOptions) => {
	return appToast(message, 'info', options)
}

showToast.warning = (message: string, options?: ToastOptions) => {
	return appToast(message, 'warning', options)
}

