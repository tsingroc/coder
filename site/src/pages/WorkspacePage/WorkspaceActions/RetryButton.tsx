import type { Workspace } from "api/typesGenerated";
import { TopbarButton } from "components/FullPageLayout/Topbar";
import { RotateCcwIcon } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { BuildParametersPopover } from "./BuildParametersPopover";
import type { ActionButtonProps } from "./Buttons";

type RetryButtonProps = Omit<ActionButtonProps, "loading"> & {
	enableBuildParameters: boolean;
	workspace: Workspace;
};

export const RetryButton: FC<RetryButtonProps> = ({
	handleAction,
	workspace,
	enableBuildParameters,
}) => {
	const { t } = useTranslation("workspaceDetail");
	const mainAction = (
		<TopbarButton onClick={() => handleAction()}>
			<RotateCcwIcon />
			{t("actionsButtons.retry")}
		</TopbarButton>
	);

	if (!enableBuildParameters) {
		return mainAction;
	}

	return (
		<div className="flex gap-1 items-center">
			{mainAction}
			<BuildParametersPopover
				label={t("actionsButtons.retryWithParams")}
				workspace={workspace}
				onSubmit={handleAction}
			/>
		</div>
	);
};
