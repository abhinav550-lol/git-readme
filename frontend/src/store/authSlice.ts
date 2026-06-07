import { createSlice } from '@reduxjs/toolkit'
import {authReducers} from './reducers/authReducers.ts'

export interface authState {
	isAuthenticated : boolean;
	login : string;
	githubId : number;
	perms : string;
}

const initialState: authState = {
	isAuthenticated : false,
	login : "",
	githubId : -1,
	perms : ""
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: authReducers
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
