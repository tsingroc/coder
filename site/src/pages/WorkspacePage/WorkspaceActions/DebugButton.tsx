import type { Workspace } from "api/typesGenerated";
import { TopbarButton } from "components/FullPageLayout/Topbar";
import { BugIcon } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { BuildParametersPopover } from "./BuildParametersPopover";
import type { ActionButtonProps } from "./Buttons";

type DebugButtonProps = Omit<ActionButtonProps, "loading"> & {
	workspace: Workspace;
	enableBuildParameters: boolean;
};

export const DebugButton: FC<DebugButtonProps> = ({
	handleAction,
	workspace,
	enableBuildParameters,
}) => {
	const { t } = useTranslation("workspaceDetail");
	const mainAction = (
		<TopbarButton onClick={() => handleAction()}>
			<BugIcon />
			{t("actionsButtons.debug")}
		</TopbarButton>
	);

	if (!enableBuildParameters) {
		return mainAction;
	}

	return (
		<div className="flex gap-1 items-center">
			{mainAction}
			<BuildParametersPopover
				label={t("actionsButtons.debugWithParams")}
				workspace={workspace}
				onSubmit={handleAction}
			/>
		</div>
	);
};
