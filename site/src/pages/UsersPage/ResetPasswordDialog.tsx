import type * as TypesGen from "api/typesGenerated";
import { CodeExample } from "components/CodeExample/CodeExample";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { Trans } from "react-i18next";
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
	const description = (
		<>
			<Trans i18nKey="resetPassword.message" ns="users" values={{ username: user?.username || "" }}>
				You will need to send <strong>{{username: user?.username || ""}}</strong> the following password:
			</Trans>
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
			title="Reset password"
			confirmLoading={loading}
			confirmText="Reset password"
			description={description}
		/>
	);
};
