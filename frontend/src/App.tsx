
import 'react-toastify/dist/ReactToastify.css'

import { axiosGet } from './api/axiosMethods'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import LoadingComponent from './components/Loading'

import {setAuth, type authState} from './store/authSlice'
import { useAppDispatch } from './store/hooks'
import type { Response } from './api/response'
import Dashboard from './components/Dashboard'
import ProtectedRoutes from './components/ProtectedRoutes'


function App() {
	const dispatch = useAppDispatch();
	
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function checkAuth() {
      try {
		const res = await axiosGet<Response<authState>>(`${import.meta.env.VITE_BACKEND_URL}/api/user/auth/me`);
		console.log('App.jsx:' + JSON.stringify(res));
		if(!res.data || !res.success) {
			return ;
		}

		dispatch(setAuth(res.data));
      } catch (error) {
        console.log('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
		<Route path="/" element={<ProtectedRoutes permsType="normal"/>}>
			<Route path='dashboard' element={<Dashboard />} />
		</Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
