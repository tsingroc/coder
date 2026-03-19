import type { Workspace } from "api/typesGenerated";
import { PillSpinner } from "components/Pill/Pill";
import {
	StatusIndicator,
	StatusIndicatorDot,
	type StatusIndicatorProps,
} from "components/StatusIndicator/StatusIndicator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import type { TFunction } from "i18next";
import {
	CircleAlertIcon,
	HourglassIcon,
	PlayIcon,
	SquareIcon,
} from "lucide-react";
import type React from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { getPendingStatusLabel } from "utils/provisionerJob";
import type { DisplayWorkspaceStatusType } from "utils/workspace";

const variantByStatusType: Record<
	DisplayWorkspaceStatusType,
	StatusIndicatorProps["variant"]
> = {
	active: "pending",
	inactive: "inactive",
	success: "success",
	error: "failed",
	danger: "warning",
	warning: "warning",
};

type WorkspaceStatusIndicatorProps = {
	workspace: Workspace;
	children?: React.ReactNode;
};

const getWorkspaceStatusText = (
	workspaceStatus: Workspace["latest_build"]["status"],
	provisionerJob: Workspace["latest_build"]["job"],
	t: TFunction<"workspaceDetail">,
): {
	text: string;
	type: DisplayWorkspaceStatusType;
	icon: React.ReactNode;
} => {
	switch (workspaceStatus) {
		case undefined:
			return {
				text: t("statusIndicator.loading"),
				type: "active",
				icon: <PillSpinner />,
			} as const;
		case "running":
			return {
				type: "success",
				text: t("status.running"),
				icon: <PlayIcon />,
			} as const;
		case "starting":
			return {
				type: "active",
				text: t("status.starting"),
				icon: <PillSpinner />,
			} as const;
		case "stopping":
			return {
				type: "inactive",
				text: t("status.stopping"),
				icon: <PillSpinner />,
			} as const;
		case "stopped":
			return {
				type: "inactive",
				text: t("status.stopped"),
				icon: <SquareIcon />,
			} as const;
		case "deleting":
			return {
				type: "danger",
				text: t("status.deleting"),
				icon: <PillSpinner />,
			} as const;
		case "deleted":
			return {
				type: "danger",
				text: t("status.deleted"),
				icon: <CircleAlertIcon aria-hidden="true" className="size-icon-sm" />,
			} as const;
		case "canceling":
			return {
				type: "inactive",
				text: t("status.canceling"),
				icon: <PillSpinner />,
			} as const;
		case "canceled":
			return {
				type: "inactive",
				text: t("status.canceled"),
				icon: <CircleAlertIcon aria-hidden="true" className="size-icon-sm" />,
			} as const;
		case "failed":
			return {
				type: "error",
				text: t("status.failed"),
				icon: <CircleAlertIcon aria-hidden="true" className="size-icon-sm" />,
			} as const;
		case "pending":
			return {
				type: "active",
				text: getPendingStatusLabel(provisionerJob),
				icon: <HourglassIcon className="size-icon-sm" />,
			} as const;
	}
};

export const WorkspaceStatusIndicator: FC<WorkspaceStatusIndicatorProps> = ({
	workspace,
	children,
}) => {
	const { t } = useTranslation("workspaceDetail");
	let { text, type } = getWorkspaceStatusText(
		workspace.latest_build.status,
		workspace.latest_build.job,
		t,
	);

	if (!workspace.health.healthy) {
		type = "warning";
	}

	const statusIndicator = (
		<StatusIndicator variant={variantByStatusType[type]}>
			<StatusIndicatorDot />
			<span className="sr-only">{t("statusIndicator.srLabel")}</span> {text}
			{children}
		</StatusIndicator>
	);

	if (workspace.health.healthy) {
		return statusIndicator;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<StatusIndicator variant={variantByStatusType[type]}>
					<StatusIndicatorDot />
					<span className="sr-only">{t("statusIndicator.srLabel")}</span> {text}
					{children}
				</StatusIndicator>
			</TooltipTrigger>
			<TooltipContent>
				{t("health.runningBut")} {t("health.singleAgentNotConnected")}
			</TooltipContent>
		</Tooltip>
	);
};
