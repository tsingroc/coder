import { useTranslation } from "react-i18next";
import type * as TypesGen from "api/typesGenerated";
import {
	CircleAlertIcon,
	HourglassIcon,
	PlayIcon,
	SquareIcon,
} from "lucide-react";
import { PillSpinner } from "components/Pill/Pill";
import { getPendingStatusLabel } from "./provisionerJob";

/**
 * Hook that provides translated strings for workspace utility functions.
 * Use this to get localized versions of workspace status, build status, etc.
 */
export const useWorkspaceLanguage = () => {
	const { t } = useTranslation("workspaceDetail");

	return {
		// Build status labels
		buildStatus: {
			succeeded: t("resources.buildStatus.succeeded"),
			pending: t("resources.buildStatus.pending"),
			running: t("resources.buildStatus.running"),
			canceling: t("resources.buildStatus.canceling"),
			canceled: t("resources.buildStatus.canceled"),
			failed: t("resources.buildStatus.failed"),
		},

		// Build reason labels
		buildReason: (reason: TypesGen.BuildReason): string => {
			// Convert camelCase to kebab-case for translation keys
			const key = reason.replace(/([A-Z])/g, "-$1").toLowerCase();
			return t(`resources.buildReason.${key}`);
		},

		// Workspace status labels (these are at root level, not under resources)
		workspaceStatus: {
			loading: t("status.loading"),
			running: t("status.running"),
			starting: t("status.starting"),
			stopping: t("status.stopping"),
			stopped: t("status.stopped"),
			deleting: t("status.deleting"),
			deleted: t("status.deleted"),
			canceling: t("status.canceling"),
			canceled: t("status.canceled"),
			failed: t("status.failed"),
		},

		// Time ago messages
		timeAgo: {
			now: t("resources.timeAgo.now"),
			never: t("resources.timeAgo.never"),
		},

		// Duration labels
		duration: {
			inProgress: t("resources.buildStatus.inProgress"),
			seconds: t("resources.buildStatus.seconds"),
		},

		// Agent version
		agentVersion: {
			unknown: t("resources.buildStatus.unknown"),
		},

		// System build reason label
		systemBuildReason: t("resources.buildReason.system"),
	};
};

export type DisplayWorkspaceStatusType =
	| "success"
	| "active"
	| "inactive"
	| "error"
	| "warning"
	| "danger";

type DisplayWorkspaceStatus = {
	text: string;
	type: DisplayWorkspaceStatusType;
	icon: React.ReactNode;
};

/**
 * Hook version of getDisplayWorkspaceStatus that uses translations.
 */
export const useDisplayWorkspaceStatus = () => {
	const { t } = useTranslation("workspaceDetail");

	return (
		workspaceStatus: TypesGen.WorkspaceStatus,
		provisionerJob?: TypesGen.ProvisionerJob,
	): DisplayWorkspaceStatus => {
		switch (workspaceStatus) {
			case undefined:
				return {
					text: t("status.loading"),
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
};
