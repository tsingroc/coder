import type { Workspace } from "api/typesGenerated";
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader";
import type { ComponentProps, FC } from "react";
import { useTranslation } from "react-i18next";
import { WorkspaceSettingsForm } from "./WorkspaceSettingsForm";

type WorkspaceSettingsPageViewProps = {
	error: unknown;
	workspace: Workspace;
	onCancel: () => void;
	onSubmit: ComponentProps<typeof WorkspaceSettingsForm>["onSubmit"];
};

export const WorkspaceSettingsPageView: FC<WorkspaceSettingsPageViewProps> = ({
	onCancel,
	onSubmit,
	error,
	workspace,
}) => {
	const { t } = useTranslation("workspaceSettings");

	return (
		<>
			<PageHeader
				css={{
					paddingTop: 0,
				}}
			>
				<PageHeaderTitle>{t("title")}</PageHeaderTitle>
			</PageHeader>

			<WorkspaceSettingsForm
				error={error}
				workspace={workspace}
				onCancel={onCancel}
				onSubmit={onSubmit}
			/>
		</>
	);
};
