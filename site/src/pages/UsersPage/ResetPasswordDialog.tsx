import type * as TypesGen from "api/typesGenerated";
import { CodeExample } from "components/CodeExample/CodeExample";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { useTranslation } from "react-i18next";
import type { FC, JSX } from "react";

interface ResetPasswordDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	user?: TypesGen.User;
	newPassword?: string;
	loading: boolean;
}

export const ResetPasswordDialog: FC<ResetPasswordDialogProps> = ({
	open,
	onClose,
	onConfirm,
	user,
	newPassword,
	loading,
}) => {
	const { t } = useTranslation("users");

	const description = (
		<>
			<p>
				You will need to send <strong>{user?.username || ""}</strong> the following password:
			</p>
			<CodeExample
				secret={false}
				code={newPassword ?? ""}
				css={{
					minHeight: "auto",
					userSelect: "all",
					width: "100%",
					marginTop: 24,
				}}
			/>
		</>
	);

	return (
		<ConfirmDialog
			type="info"
			hideCancel={false}
			open={open}
			onConfirm={onConfirm}
			onClose={onClose}
			title={t("resetPassword.title")}
			confirmLoading={loading}
			confirmText={t("resetPassword.confirmText")}
			description={description}
		/>
	);
};
