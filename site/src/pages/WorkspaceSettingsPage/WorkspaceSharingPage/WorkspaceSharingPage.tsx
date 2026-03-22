import { checkAuthorization } from "api/queries/authCheck";
import { Link } from "components/Link/Link";
import type { WorkspacePermissions } from "modules/workspaces/permissions";
import { workspaceChecks } from "modules/workspaces/permissions";
import { useWorkspaceSharing } from "modules/workspaces/WorkspaceSharingForm/useWorkspaceSharing";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { docs } from "utils/docs";
import { pageTitle } from "utils/page";
import { useWorkspaceSettings } from "../WorkspaceSettingsLayout";
import { WorkspaceSharingPageView } from "./WorkspaceSharingPageView";

const WorkspaceSharingPage: FC = () => {
	const { t } = useTranslation("workspaceSettings");
	const { workspace } = useWorkspaceSettings();
	const sharing = useWorkspaceSharing(workspace);

	const checks = workspaceChecks(workspace);
	const permissionsQuery = useQuery({
		...checkAuthorization<WorkspacePermissions>({ checks }),
	});
	const permissions = permissionsQuery.data;
	const canUpdatePermissions = Boolean(permissions?.updateWorkspace);

	const error =
		sharing.error ?? permissionsQuery.error ?? sharing.mutationError;

	return (
		<div className="flex flex-col gap-12">
			<title>{pageTitle(workspace.name, t("sidebar.sharing"))}</title>

			<header className="flex flex-col">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl m-0">{t("sharing.title")}</h1>
					<p className="flex flex-row gap-1 text-sm text-content-secondary font-medium m-0">
						{t("sharing.description")}{" "}
						<Link href={docs("/user-guides/shared-workspaces")}>
							{t("sharing.viewDocs")}
						</Link>
					</p>
				</div>
			</header>

			<WorkspaceSharingPageView
				workspace={workspace}
				workspaceACL={sharing.workspaceACL}
				canUpdatePermissions={canUpdatePermissions}
				error={error}
				onAddUser={sharing.addUser}
				isAddingUser={sharing.isAddingUser}
				onUpdateUser={sharing.updateUser}
				updatingUserId={sharing.updatingUserId}
				onRemoveUser={sharing.removeUser}
				onAddGroup={sharing.addGroup}
				isAddingGroup={sharing.isAddingGroup}
				onUpdateGroup={sharing.updateGroup}
				updatingGroupId={sharing.updatingGroupId}
				onRemoveGroup={sharing.removeGroup}
				hasRemovedMember={sharing.hasRemovedMember}
			/>
		</div>
	);
};

export default WorkspaceSharingPage;
