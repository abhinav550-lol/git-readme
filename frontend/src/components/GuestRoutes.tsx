import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const GuestRoutes = () => {
	const authState = useAppSelector((state) => state.auth);
	const navigate = useNavigate();
	
	useEffect(() => {
		if(authState.isAuthenticated) {
			navigate('/dashboard');
		}
	} , [authState.isAuthenticated, navigate]);

	return (
		!authState.isAuthenticated && <Outlet />
	)
}

export default GuestRoutes
