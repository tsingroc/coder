import type { Workspace } from "api/typesGenerated";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

interface WorkspaceBuildCancelDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	workspace: Workspace;
}

export const WorkspaceBuildCancelDialog: FC<
	WorkspaceBuildCancelDialogProps
> = ({ open, onClose, onConfirm, workspace }) => {
	const { t } = useTranslation("workspaceDetail");

	const action =
		workspace.latest_build.status === "pending"
			? t("buildCancelDialog.removeBuildQueue")
			: t("buildCancelDialog.stopBuildProcess");

	return (
		<ConfirmDialog
			open={open}
			title={t("buildCancelDialog.title")}
			description={t("buildCancelDialog.description", {
				name: workspace.name,
				action: action,
			})}
			confirmText={t("buildCancelDialog.confirm")}
			cancelText={t("buildCancelDialog.cancel")}
			onClose={onClose}
			onConfirm={onConfirm}
			type="delete"
		/>
	);
};
