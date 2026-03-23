import { type Interpolation, type Theme, useTheme } from "@emotion/react";
import Skeleton from "@mui/material/Skeleton";
import type { WorkspaceBuild } from "api/typesGenerated";
import { BuildIcon } from "components/BuildIcon/BuildIcon";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { InfoIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createDayString } from "utils/createDayString";
import {
	getDisplayWorkspaceBuildInitiatedBy,
	systemBuildReasons,
} from "utils/workspace";

export const WorkspaceBuildData = ({ build }: { build: WorkspaceBuild }) => {
	const { t } = useTranslation("workspaceDetail");
	const theme = useTheme();

	// Determine status type based on build job status
	const getStatusType = ():
		| "success"
		| "active"
		| "inactive"
		| "error"
		| "warning" => {
		switch (build.job.status) {
			case "succeeded":
				return "success";
			case "pending":
				return "inactive";
			case "running":
				return "active";
			case "unknown":
			case "failed":
				return "error";
			case "canceling":
				return "warning";
			case "canceled":
				return "inactive";
		}
	};

	const statusType = getStatusType();

	// Convert build reason to translation key (camelCase to kebab-case)
	const getBuildReasonLabel = (reason: string): string => {
		const key = reason.replace(/([A-Z])/g, "-$1").toLowerCase();
		return t(`resources.buildReason.${key}` as any);
	};

	return (
		<div css={styles.root}>
			<BuildIcon
				transition={build.transition}
				css={{
					width: 16,
					height: 16,
					color: theme.roles[statusType].fill.solid,
				}}
			/>
			<div css={{ overflow: "hidden" }}>
				<div
					css={{
						color: theme.palette.text.primary,
						textOverflow: "ellipsis",
						overflow: "hidden",
						whiteSpace: "nowrap",
						display: "flex",
						alignItems: "center",
						gap: 4,
					}}
				>
					<span css={{ textTransform: "capitalize" }}>{build.transition}</span>{" "}
					{t("buildData.by")}{" "}
					<span css={{ fontWeight: 500 }}>
						{getDisplayWorkspaceBuildInitiatedBy(build)}
					</span>
					{!systemBuildReasons.includes(build.reason) &&
						build.transition === "start" && (
							<Tooltip>
								<TooltipTrigger asChild>
									<InfoIcon
										css={(theme) => ({
											color: theme.palette.info.light,
										})}
										className="size-icon-xs -mt-px"
									/>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{getBuildReasonLabel(build.reason)}
								</TooltipContent>
							</Tooltip>
						)}
				</div>
				<div
					css={{
						fontSize: 12,
						color: theme.palette.text.secondary,
					}}
				>
					{createDayString(build.created_at)}
				</div>
			</div>
		</div>
	);
};

export const WorkspaceBuildDataSkeleton = () => {
	return (
		<div css={styles.root}>
			<Skeleton variant="circular" width={16} height={16} />
			<div>
				<Skeleton variant="text" width={94} height={16} />
				<Skeleton
					variant="text"
					width={60}
					height={14}
					css={{ marginTop: 2 }}
				/>
			</div>
		</div>
	);
};

const styles = {
	root: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		lineHeight: "1.5",
	},
} satisfies Record<string, Interpolation<Theme>>;
