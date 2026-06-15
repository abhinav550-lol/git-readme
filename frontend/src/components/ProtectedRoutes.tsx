import { useAppSelector } from "../store/hooks";
import { useEffect } from "react";
import { redirectToGithubOAuth } from "@/utils/utils";
import { Outlet, useNavigate } from "react-router";

const ProtectedRoutes = ({
	permsType = "normal",
}: {
	permsType?: "normal" | "elevated";
}) => {
	const authState = useAppSelector((state) => state.auth);
	const navigate = useNavigate();	
	
	useEffect(() => {
		console.log("ProtectedRoutes.jsx: authState changed: " + JSON.stringify(authState));
		
		if(!authState.isAuthenticated){
			navigate('/')
		}

		if (
			(permsType === "elevated" && authState.perms !== "elevated")
		) {
			redirectToGithubOAuth(permsType === "elevated");
		}
	}, [authState]);
	return authState.isAuthenticated ? <Outlet/> : null;
};

export default ProtectedRoutes;
