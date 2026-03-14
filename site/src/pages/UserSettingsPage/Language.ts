import { useTranslation } from "react-i18next";

// Hook to get translated language strings for UserSettings pages
export const useUserSettingsLanguage = () => {
	const { t } = useTranslation("userSettings");

	return {
		title: t("title"),
		account: t("account"),
		accountDescription: t("accountDescription"),
		appearance: t("appearance"),
		externalAuth: t("externalAuth"),
		oauth2Apps: t("oauth2Apps"),
		schedule: t("schedule"),
		security: t("security"),
		securityDescription: t("securityDescription"),
		sshKeys: t("sshKeys"),
		tokens: t("tokens"),
		notifications: t("notifications"),
		email: t("email"),
		username: t("username"),
		fullName: t("fullName"),
		updateProfile: t("updateProfile"),
		changePassword: t("changePassword"),
		oldPassword: t("oldPassword"),
		newPassword: t("newPassword"),
		confirmPassword: t("confirmPassword"),
		passwordUpdated: t("passwordUpdated"),
	};
};
