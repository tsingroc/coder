import type { Workspace } from "api/typesGenerated";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { WorkspaceDormantBadge } from "../WorkspaceDormantBadge/WorkspaceDormantBadge";
import { WorkspaceStatusIndicator } from "../WorkspaceStatusIndicator/WorkspaceStatusIndicator";

dayjs.extend(relativeTime);

type WorkspaceStatusProps = {
	workspace: Workspace;
};

export const WorkspaceStatus: FC<WorkspaceStatusProps> = ({ workspace }) => {
	const { t } = useTranslation("workspaceDetail");

	// Localized version of lastUsedMessage
	const getLastUsedMessage = (lastUsedAt: string | Date): string => {
		const time = dayjs(lastUsedAt);
		const now = dayjs();
		let message = time.fromNow();

		if (time.isAfter(now.subtract(1, "hour"))) {
			message = t("resources.timeAgo.now");
		} else if (time.isAfter(now.subtract(100, "year"))) {
			message = time.fromNow();
		} else {
			message = t("resources.timeAgo.never");
		}

		return message;
	};

	return (
		<div className="flex flex-col">
			<WorkspaceStatusIndicator workspace={workspace}>
				{workspace.dormant_at && (
					<WorkspaceDormantBadge workspace={workspace} />
				)}
			</WorkspaceStatusIndicator>
			<time
				dateTime={workspace.last_used_at}
				className="text-xs font-medium text-content-secondary ml-6 whitespace-nowrap"
			>
				{getLastUsedMessage(workspace.last_used_at)}
			</time>
		</div>
	);
};
