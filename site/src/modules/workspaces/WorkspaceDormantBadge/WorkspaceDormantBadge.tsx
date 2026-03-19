import type { Workspace } from "api/typesGenerated";
import { Badge } from "components/Badge/Badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { useTranslation } from "react-i18next";
import type { FC } from "react";
import {
	DATE_FORMAT,
	formatDateTime,
	relativeTimeWithoutSuffix,
} from "utils/time";

type WorkspaceDormantBadgeProps = {
	workspace: Workspace;
};

export const WorkspaceDormantBadge: FC<WorkspaceDormantBadgeProps> = ({
	workspace,
}) => {
	const { t } = useTranslation("workspaceDetail");

	return workspace.deleting_at ? (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge role="status" variant="destructive" size="xs">
					{t("dormantBadge.deletionPending")}
				</Badge>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="max-w-xs">
				{t("dormantBadge.tooltipPending", {
					time: relativeTimeWithoutSuffix(workspace.last_used_at),
					date: formatDateTime(
						workspace.deleting_at,
						DATE_FORMAT.FULL_DATETIME,
					),
				})}
			</TooltipContent>
		</Tooltip>
	) : (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge role="status" variant="warning" size="xs">
					{t("dormantBadge.dormant")}
				</Badge>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="max-w-xs">
				{t("dormantBadge.tooltipDormant", {
					time: relativeTimeWithoutSuffix(workspace.last_used_at),
				})}
			</TooltipContent>
		</Tooltip>
	);
};
