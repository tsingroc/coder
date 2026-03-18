import { useTranslation } from "react-i18next";

// Hook to get translated language strings for WorkspacePage (detail view)
export const useWorkspaceDetailLanguage = () => {
	const { t } = useTranslation("workspaceDetail");

	return {
		title: t("title"),
		backToWorkspaces: t("backToWorkspaces"),
		owner: t("owner"),
		organization: t("organization"),
		version: t("version"),
		copyWorkspaceName: t("copyWorkspaceName"),
		dailyUsage: t("dailyUsage"),
		creditsOf: t("creditsOf"),
		seeAffectedWorkspaces: t("seeAffectedWorkspaces"),
		seeAffectedWorkspacesFor: (org: string) =>
			t("seeAffectedWorkspacesFor", { org }),
		deletionOn: (date: string) => t("deletionOn", { date }),
		deletionSoon: t("deletionSoon"),
		scheduleSettings: t("scheduleSettings"),
		restartWorkspace: t("restartWorkspace"),
		restartConfirm: t("restartConfirm"),
		restartDescription: t("restartDescription"),
		failedToBuild: (name: string) => t("failedToBuild", { name }),
		pleaseTryRefreshing: t("pleaseTryRefreshing"),
		unableToProcessData: (name: string) => t("unableToProcessData", { name }),
		unableToGetChanges: (name: string) => t("unableToGetChanges", { name }),
		connectionClosed: t("connectionClosed"),
		errorActivating: (name: string) => t("errorActivating", { name }),
	};
};
