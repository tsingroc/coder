import {
	workspaceByOwnerAndName,
	workspacePermissions,
} from "api/queries/workspaces";
import type { Workspace } from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Loader } from "components/Loader/Loader";
import { Margins } from "components/Margins/Margins";
import { Stack } from "components/Stack/Stack";
import type { WorkspacePermissions } from "modules/workspaces/permissions";
import { createContext, type FC, Suspense, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Outlet, useParams } from "react-router";
import { pageTitle } from "utils/page";
import { Sidebar } from "./Sidebar";

type WorkspaceSettingsContext = {
	owner: string;
	workspace: Workspace;
	permissions?: WorkspacePermissions;
};

const WorkspaceSettings = createContext<WorkspaceSettingsContext | undefined>(
	undefined,
);

export function useWorkspaceSettings() {
	const { t } = useTranslation("workspaceSettings");
	const value = useContext(WorkspaceSettings);
	if (!value) {
		throw new Error(t("general.hookCanOnlyBeUsedFromWorkspaceSettingsPage"));
	}

	return value;
}

export const WorkspaceSettingsLayout: FC = () => {
	const { t } = useTranslation("workspaceSettings");
	const params = useParams() as {
		workspace: string;
		username: string;
	};
	const workspaceName = params.workspace;
	const username = params.username.replace("@", "");
	const workspaceQuery = useQuery(
		workspaceByOwnerAndName(username, workspaceName),
	);

	const permissionsQuery = useQuery(workspacePermissions(workspaceQuery.data));

	if (workspaceQuery.isLoading) {
		return <Loader />;
	}

	const error = workspaceQuery.error || permissionsQuery.error;

	return (
		<>
			<title>{pageTitle(workspaceName, t("sidebar.general"))}</title>

			<Margins>
				<Stack css={{ padding: "48px 0" }} direction="row" spacing={10}>
					{error ? (
						<ErrorAlert error={error} />
					) : (
						workspaceQuery.data && (
							<WorkspaceSettings.Provider
								value={{
									owner: username,
									workspace: workspaceQuery.data,
									permissions: permissionsQuery.data,
								}}
							>
								<Sidebar />
								<Suspense fallback={<Loader />}>
									<div className="w-full">
										<Outlet />
									</div>
								</Suspense>
							</WorkspaceSettings.Provider>
						)
					)}
				</Stack>
			</Margins>
		</>
	);
};
