import { useAppSelector } from "../store/hooks";
import { redirectToGithubOAuth } from "@/utils/utils";
import { Outlet, Navigate } from "react-router";


export default function ProtectedRoutes({
  permsType = "normal",
}: {
  permsType?: "normal" | "elevated";
}) {
  const authState = useAppSelector((state) => state.auth);

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (
    permsType === "elevated" &&
    authState.perms !== "elevated"
  ) {
    redirectToGithubOAuth(true);
    return null;
  }

  return <Outlet />;
};