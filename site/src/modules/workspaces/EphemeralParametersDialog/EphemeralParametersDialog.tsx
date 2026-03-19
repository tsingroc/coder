import type { TemplateVersionParameter } from "api/typesGenerated";
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

interface EphemeralParametersDialogProps {
	open: boolean;
	onClose: () => void;
	onContinue: () => void;
	ephemeralParameters: TemplateVersionParameter[];
	workspaceOwner: string;
	workspaceName: string;
	templateVersionId: string;
}

export const EphemeralParametersDialog: FC<EphemeralParametersDialogProps> = ({
	open,
	onClose,
	onContinue,
	ephemeralParameters,
	workspaceOwner,
	workspaceName,
	templateVersionId,
}) => {
	const { t } = useTranslation("workspaceDetail");
	const navigate = useNavigate();

	const handleGoToParameters = () => {
		onClose();
		navigate(
			`/@${workspaceOwner}/${workspaceName}/settings/parameters?templateVersionId=${templateVersionId}`,
		);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("ephemeralParametersDialog.title")}</DialogTitle>
					<DialogDescription>
						{t("ephemeralParametersDialog.description", {
							count: ephemeralParameters.length,
						})}
					</DialogDescription>
					<DialogDescription>
						<ul className="list-none pl-6 space-y-2">
							{ephemeralParameters.map((param) => (
								<li key={param.name}>
									<p className="text-content-primary m-0 font-bold">
										{param.display_name || param.name}
									</p>
									{param.description && (
										<p className="m-0 text-sm text-content-secondary">
											{param.description}
										</p>
									)}
								</li>
							))}
						</ul>
					</DialogDescription>
					<DialogDescription>
						{t("ephemeralParametersDialog.question")}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={onContinue} variant="outline">
						{t("ephemeralParametersDialog.continue")}
					</Button>
					<Button
						data-testid="workspace-parameters"
						onClick={handleGoToParameters}
					>
						{t("ephemeralParametersDialog.goToWorkspaceParameters")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
