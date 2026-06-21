import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const GuestRoutes = () => {
	const authState = useAppSelector((state) => state.auth);
	const navigate = useNavigate();

	console.log(authState.isAuthenticated);

	useEffect(() => {
		if (authState.isAuthenticated) {
			navigate('/dashboard')
		}
	})

	return <Outlet />;
};

export default GuestRoutes;