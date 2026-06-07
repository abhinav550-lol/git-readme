import { appToast } from "@/utils/toast";
import { useAppSelector } from "../store/hooks";
import { useEffect } from "react";
import { redirectToGithubOAuth } from "@/utils/utils";
import { Outlet } from "react-router";

const ProtectedRoutes = ({
	permsType = "normal",
}: {
	permsType?: "normal" | "elevated";
}) => {
	const authState = useAppSelector((state) => state.auth);
	const message =
		permsType === "elevated"
			? "Please provide repository access to proceed."
			: "Please login to access this page";

	useEffect(() => {
		console.log("ProtectedRoutes.jsx: authState changed: " + JSON.stringify(authState));
		if (
			!authState.isAuthenticated ||
			(permsType === "elevated" && authState.perms !== "elevated")
		) {
			appToast(message, "error");
			setTimeout(() => {
				redirectToGithubOAuth(permsType === "elevated");
			}, 2000);
		}
	}, [authState]);
	return authState.isAuthenticated ? <Outlet/> : null;
};

export default ProtectedRoutes;
