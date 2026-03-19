import { deploymentConfig } from "api/queries/deployment";
import type { Workspace, WorkspaceBuildParameter } from "api/typesGenerated";
import { useAuthenticated } from "hooks/useAuthenticated";
import {
	type ActionType,
	abilitiesByWorkspaceStatus,
} from "modules/workspaces/actions";
import type { WorkspacePermissions } from "modules/workspaces/permissions";
import { WorkspaceMoreActions } from "modules/workspaces/WorkspaceMoreActions/WorkspaceMoreActions";
import { type FC, Fragment, type ReactNode } from "react";
import { useQuery } from "react-query";
import { mustUpdateWorkspace } from "utils/workspace";
import {
	ActivateButton,
	CancelButton,
	DisabledButton,
	FavoriteButton,
	RestartButton,
	StartButton,
	StopButton,
	UpdateButton,
} from "./Buttons";
import { DebugButton } from "./DebugButton";
import { RetryButton } from "./RetryButton";
import { ShareButton } from "./ShareButton";
import { useWorkspaceDetailLanguage } from "../Language";

interface WorkspaceActionsProps {
	workspace: Workspace;
	isUpdating: boolean;
	isRestarting: boolean;
	permissions: WorkspacePermissions;
	handleToggleFavorite: () => void;
	handleStart: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleStop: () => void;
	handleRestart: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleUpdate: () => void;
	handleCancel: () => void;
	handleRetry: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleDebug: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleDormantActivate: () => void;
}

export const WorkspaceActions: FC<WorkspaceActionsProps> = ({
	workspace,
	isUpdating,
	isRestarting,
	permissions,
	handleToggleFavorite,
	handleStart,
	handleStop,
	handleRestart,
	handleUpdate,
	handleCancel,
	handleRetry,
	handleDebug,
	handleDormantActivate,
}) => {
	const lang = useWorkspaceDetailLanguage();
	const {
		permissions: { viewDeploymentConfig },
		user,
	} = useAuthenticated();
	const { data: deployment } = useQuery({
		...deploymentConfig(),
		enabled: viewDeploymentConfig,
	});
	const { actions, canCancel, canAcceptJobs } = abilitiesByWorkspaceStatus(
		workspace,
		{
			canDebug: !!deployment?.config.enable_terraform_debug_mode,
			isOwner: user.roles.some((role) => role.name === "owner"),
		},
	);

	const mustUpdate = mustUpdateWorkspace(
		workspace,
		permissions.updateWorkspaceVersion,
	);
	const tooltipText = getTooltipText(
		workspace,
		mustUpdate,
		permissions.updateWorkspaceVersion,
		lang,
	);

	// A mapping of button type to the corresponding React component
	const buttonMapping: Record<ActionType, ReactNode> = {
		updateAndStart: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning={false}
				requireActiveVersion={false}
			/>
		),
		updateAndStartRequireActiveVersion: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning={false}
				requireActiveVersion={true}
			/>
		),
		updateAndRestart: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning={true}
				requireActiveVersion={false}
			/>
		),
		updateAndRestartRequireActiveVersion: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning={true}
				requireActiveVersion={true}
			/>
		),
		updating: <UpdateButton loading handleAction={handleUpdate} />,
		start: (
			<StartButton
				workspace={workspace}
				handleAction={handleStart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		starting: (
			<StartButton
				loading
				workspace={workspace}
				handleAction={handleStart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		stop: <StopButton handleAction={handleStop} />,
		stopping: <StopButton loading handleAction={handleStop} />,
		restart: (
			<RestartButton
				workspace={workspace}
				handleAction={handleRestart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		restarting: (
			<RestartButton
				loading
				workspace={workspace}
				handleAction={handleRestart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		deleting: <DisabledButton label={lang.status.deleting} />,
		canceling: <DisabledButton label={lang.status.canceling} />,
		deleted: <DisabledButton label={lang.status.deleted} />,
		pending: <DisabledButton label={lang.status.pending} />,
		activate: <ActivateButton handleAction={handleDormantActivate} />,
		activating: <ActivateButton loading handleAction={handleDormantActivate} />,
		retry: (
			<RetryButton
				handleAction={handleRetry}
				workspace={workspace}
				enableBuildParameters={workspace.latest_build.transition === "start"}
			/>
		),
		debug: (
			<DebugButton
				handleAction={handleDebug}
				workspace={workspace}
				enableBuildParameters={workspace.latest_build.transition === "start"}
			/>
		),
	};

	return (
		<div
			css={{ display: "flex", alignItems: "center", gap: 8 }}
			data-testid="workspace-actions"
		>
			{/* Restarting must be handled separately, because it otherwise would appear as stopping */}
			{isUpdating
				? buttonMapping.updating
				: isRestarting
					? buttonMapping.restarting
					: actions.map((action) => (
							<Fragment key={action}>{buttonMapping[action]}</Fragment>
						))}

			{canCancel && <CancelButton handleAction={handleCancel} />}

			<FavoriteButton
				workspaceID={workspace.id}
				isFavorite={workspace.favorite}
				onToggle={handleToggleFavorite}
			/>

			{permissions.shareWorkspace && (
				<ShareButton
					workspace={workspace}
					canUpdatePermissions={permissions.updateWorkspace}
				/>
			)}

			<WorkspaceMoreActions workspace={workspace} disabled={!canAcceptJobs} />
		</div>
	);
};

function getTooltipText(
	workspace: Workspace,
	mustUpdate: boolean,
	canChangeVersions: boolean,
	lang: ReturnType<typeof useWorkspaceDetailLanguage>,
): string {
	if (!mustUpdate && !canChangeVersions) {
		return "";
	}

	if (
		!mustUpdate &&
		canChangeVersions &&
		workspace.template_require_active_version
	) {
		return lang.actions.autoUpdateRequired;
	}

	if (workspace.automatic_updates === "always") {
		return lang.actions.autoUpdateEnabled;
	}

	return "";
}
