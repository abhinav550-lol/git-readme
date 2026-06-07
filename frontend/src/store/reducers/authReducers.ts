import type { PayloadAction } from "@reduxjs/toolkit";
import type { authState } from "../authSlice";

const authReducers = {
	setAuth : (state: any, action: PayloadAction<authState>) => {
		state.isAuthenticated = action.payload.isAuthenticated;
		state.login = action.payload.login;
		state.githubId = action.payload.githubId;
		state.perms = action.payload.perms;
	},
	clearAuth : (state: any) => {
		state.isAuthenticated = false;
		state.login = "";
		state.githubId = -1;
		state.perms = "";
	}
}

export {authReducers};