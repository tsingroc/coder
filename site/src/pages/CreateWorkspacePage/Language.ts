import { useTranslation } from "react-i18next";

// Hook to get translated language strings for CreateWorkspacePage
export const useCreateWorkspaceLanguage = () => {
	const { t } = useTranslation("createWorkspace");

	return {
		title: t("title"),
		newWorkspace: t("newWorkspace"),
		general: t("general"),
		adminOnlyMessage: t("adminOnlyMessage"),
		userMessage: t("userMessage"),
		workspaceName: t("workspaceName"),
		versionId: t("versionId"),
		versionPreset: t("versionPreset"),
		owner: t("owner"),
		needSuggestion: t("needSuggestion"),
		externalAuth: t("externalAuth"),
		externalAuthDescription: t("externalAuthDescription"),
		externalAuthError: t("externalAuthError"),
		cancel: t("cancel"),
		create: t("create"),
		back: t("back"),
		viewSource: t("viewSource"),
		viewDocs: t("viewDocs"),
		selectPreset: t("selectPreset"),
		duplicateWarning: t("duplicateWarning"),
		dynamicParametersTooltip: t("dynamicParametersTooltip"),
		createWorkspaceForm: t("createWorkspaceForm"),
	};
};
