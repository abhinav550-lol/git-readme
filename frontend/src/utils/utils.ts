export const redirectToGithubOAuth = ((elevated : boolean) => {
	window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/auth/github?elevated_perms=${elevated}`;
});



