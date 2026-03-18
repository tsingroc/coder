import { useTranslation } from "react-i18next";

// Hook to get translated language strings for LoginPage
export const useLoginLanguage = () => {
	const { t } = useTranslation("login");

	return {
		emailLabel: t("emailLabel"),
		passwordLabel: t("passwordLabel"),
		emailInvalid: t("emailInvalid"),
		emailRequired: t("emailRequired"),
		passwordRequired: t("passwordRequired"),
		passwordSignIn: t("passwordSignIn"),
		githubSignIn: t("githubSignIn"),
		oidcSignIn: t("oidcSignIn"),
	};
};

// Backward compatible export (non-hook version)
// This can be used in non-component contexts, but won't be translated
export const Language = {
	emailLabel: "Email",
	passwordLabel: "Password",
	emailInvalid: "Please enter a valid email address.",
	emailRequired: "Please enter an email address.",
	passwordSignIn: "Sign In",
	githubSignIn: "GitHub",
	oidcSignIn: "OpenID Connect",
};
