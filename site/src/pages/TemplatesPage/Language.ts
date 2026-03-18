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
		subtitle: t("subtitle"),
		createWorkspace: t("buttons.createWorkspace"),
	};
};
