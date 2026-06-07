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
