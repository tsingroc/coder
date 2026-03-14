import { useTranslation } from "react-i18next";

export const useLanguage = () => {
	const { t } = useTranslation("templates");

	return {
		developerCount: (activeCount: number): string => {
			return t("developerCount", { count: activeCount });
		},
		nameLabel: t("table.name"),
		buildTimeLabel: t("table.buildTime"),
		usedByLabel: t("table.usedBy"),
		lastUpdatedLabel: t("table.lastUpdated"),
		templateTooltipTitle: t("tooltip.title"),
		templateTooltipText: t("tooltip.text"),
		templateTooltipLink: t("tooltip.link"),
		title: t("title"),
		createTemplate: t("buttons.createTemplate"),
		newTemplate: t("buttons.createTemplate"),
		subtitle: "Select a template to create a workspace.", // This will be translated later
		createWorkspace: "Create workspace", // This will be translated later
	};
};
