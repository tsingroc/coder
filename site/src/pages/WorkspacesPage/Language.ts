import { useTranslation } from "react-i18next";

// Hook to get translated language strings for WorkspacesPage
export const useWorkspaceLanguage = () => {
	const { t } = useTranslation("workspace");

	return {
		pageTitle: t("pageTitle"),
		yourWorkspacesButton: t("yourWorkspacesButton"),
		allWorkspacesButton: t("allWorkspacesButton"),
		runningWorkspacesButton: t("runningWorkspacesButton"),
		seeAllTemplates: t("seeAllTemplates"),
		template: t("template"),
		newWorkspace: t("newWorkspace"),
		bulkActions: t("bulkActions"),
		start: t("start"),
		stop: t("stop"),
		update: t("update"),
		delete: t("delete"),
		pageNotFound: t("pageNotFound"),
		pageNotFoundDescription: t("pageNotFoundDescription"),
		backToFirstPage: t("backToFirstPage"),
		workspace: t("workspace"),
		workspaces: t("workspaces"),
	};
};
