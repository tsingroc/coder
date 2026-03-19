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
		stopIn: (duration: string) => t("stopIn", { duration }),
		subtractHour: t("subtractHour"),
		addHour: t("addHour"),
		updateAndRestart: t("updateAndRestart"),
		restart: t("restart"),
		restartWithParams: t("restartWithParams"),
		favorite: t("favorite"),
		share: t("share"),
		resourcesTab: t("resourcesTab"),
		historyTab: t("historyTab"),
		ready: t("ready"),
		connectViaSSH: t("connectViaSSH"),
		appsWarning: {
			title: t("appsWarning.title"),
			message: t("appsWarning.message"),
			message2: t("appsWarning.message2"),
			message3: t("appsWarning.message3"),
			learnMore: t("appsWarning.learnMore"),
		},
		vscodeDesktop: t("vscodeDesktop"),
		terminal: t("terminal"),
		logs: t("logs"),
		downloadLogs: t("downloadLogs"),
		buildTimeline: t("buildTimeline"),
	};
};
