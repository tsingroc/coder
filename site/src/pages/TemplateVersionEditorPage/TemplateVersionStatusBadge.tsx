import type { TemplateVersion } from "api/typesGenerated";
import { Pill, PillSpinner } from "components/Pill/Pill";
import type { TFunction } from "i18next";
import { CheckIcon, CircleAlertIcon, HourglassIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ThemeRole } from "theme/roles";
import { getPendingStatusLabel } from "utils/provisionerJob";

interface TemplateVersionStatusBadgeProps {
	version: TemplateVersion;
}

export const TemplateVersionStatusBadge: FC<
	TemplateVersionStatusBadgeProps
> = ({ version }) => {
	const { t } = useTranslation("templateDetail");
	const { text, icon, type } = getStatus(version, t);
	return (
		<Pill
			icon={icon}
			type={type}
			title={`${t("status.buildStatus")} ${text}`}
			role="status"
		>
			{text}
		</Pill>
	);
};

const getStatus = (
	version: TemplateVersion,
	t: TFunction<"templateDetail">,
): {
	type?: ThemeRole;
	text: string;
	icon: ReactNode;
} => {
	switch (version.job.status) {
		case "running":
			return {
				type: "active",
				text: t("status.running"),
				icon: <PillSpinner />,
			};
		case "pending":
			return {
				type: "active",
				text: getPendingStatusLabel(version.job),
				icon: <HourglassIcon className="size-icon-sm" />,
			};
		case "canceling":
			return {
				type: "inactive",
				text: t("status.canceling"),
				icon: <PillSpinner />,
			};
		case "canceled":
			return {
				type: "inactive",
				text: t("status.canceled"),
				icon: <CircleAlertIcon className="size-icon-sm" />,
			};
		case "unknown":
		case "failed":
			return {
				type: "error",
				text: t("status.failed"),
				icon: <CircleAlertIcon className="size-icon-sm" />,
			};
		case "succeeded":
			return {
				type: "success",
				text: t("status.succeeded"),
				icon: <CheckIcon className="size-icon-sm" />,
			};
	}
};
