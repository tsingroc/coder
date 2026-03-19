import { getErrorDetail, getErrorMessage, isApiError } from "api/errors";
import { Button } from "components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "components/Dialog/Dialog";
import { useTranslation } from "react-i18next";
import type { FC } from "react";
import { useNavigate } from "react-router";

interface WorkspaceErrorDialogProps {
	open: boolean;
	error?: unknown;
	onClose: () => void;
	showDetail: boolean;
	workspaceOwner: string;
	workspaceName: string;
	templateVersionId: string;
	isDeleting: boolean;
}

export const WorkspaceErrorDialog: FC<WorkspaceErrorDialogProps> = ({
	open,
	error,
	onClose,
	showDetail,
	workspaceOwner,
	workspaceName,
	templateVersionId,
	isDeleting,
}) => {
	const { t } = useTranslation("workspaceDetail");
	const navigate = useNavigate();

	if (!error) {
		return null;
	}

	const handleGoToParameters = () => {
		onClose();
		navigate(
			`/@${workspaceOwner}/${workspaceName}/settings/parameters?templateVersionId=${templateVersionId}`,
		);
	};

	const errorDetail = getErrorDetail(error);
	const validations = isApiError(error)
		? error.response.data.validations
		: undefined;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent variant="destructive">
				<DialogHeader>
					<DialogTitle>
						{t("errorDialog.title")}
						{isDeleting ? t("errorDialog.deleting") : t("errorDialog.building")}
					</DialogTitle>
					<DialogDescription className="flex flex-row gap-4">
						<strong className="text-content-primary">
							{t("errorDialog.messageLabel")}
						</strong>{" "}
						<span>
							{getErrorMessage(error, t("errorDialog.failedToBuild"))}
						</span>
					</DialogDescription>
					{errorDetail && showDetail && (
						<DialogDescription className="flex flex-row gap-9">
							<strong className="text-content-primary">
								{t("errorDialog.detailLabel")}
							</strong>{" "}
							<span>{errorDetail}</span>
						</DialogDescription>
					)}
					{validations && (
						<DialogDescription className="flex flex-row gap-4">
							<strong className="text-content-primary">
								{t("errorDialog.validationsLabel")}
							</strong>{" "}
							<span>
								{validations.map((validation) => validation.detail).join(", ")}
							</span>
						</DialogDescription>
					)}
				</DialogHeader>
				<DialogFooter>
					<Button onClick={handleGoToParameters}>
						{t("errorDialog.reviewSettings")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
