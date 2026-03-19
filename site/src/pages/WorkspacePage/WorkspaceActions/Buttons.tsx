import type { Workspace, WorkspaceBuildParameter } from "api/typesGenerated";
import { TopbarButton } from "components/FullPageLayout/Topbar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import {
	BanIcon,
	CloudIcon,
	PlayIcon,
	PowerIcon,
	RotateCcwIcon,
	SquareIcon,
	StarIcon,
	StarOffIcon,
} from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { BuildParametersPopover } from "./BuildParametersPopover";

export interface ActionButtonProps {
	loading?: boolean;
	handleAction: (buildParameters?: WorkspaceBuildParameter[]) => void;
	disabled?: boolean;
	tooltipText?: string;
	isRunning?: boolean;
	requireActiveVersion?: boolean;
}

export const UpdateButton: FC<ActionButtonProps> = ({
	handleAction,
	loading,
	isRunning,
	requireActiveVersion,
}) => {
	const { t } = useTranslation("workspaceDetail");

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<TopbarButton
					data-testid="workspace-update-button"
					disabled={loading}
					onClick={() => handleAction()}
				>
					{requireActiveVersion ? <PlayIcon /> : <CloudIcon />}
					{loading
						? `${t("status.updating")}…`
						: isRunning
							? t("updateAndRestart")
							: t("actions.update")}
				</TopbarButton>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="max-w-xs">
				{requireActiveVersion
					? t("actions.autoUpdateRequired")
					: isRunning
						? t("actions.update")
						: t("actions.update")}
			</TooltipContent>
		</Tooltip>
	);
};

export const ActivateButton: FC<ActionButtonProps> = ({
	handleAction,
	loading,
}) => {
	const { t } = useTranslation("workspaceDetail");

	return (
		<TopbarButton disabled={loading} onClick={() => handleAction()}>
			<PowerIcon />
			{loading ? <>{t("status.starting")}…</> : t("actions.start")}
		</TopbarButton>
	);
};

interface ActionButtonPropsWithWorkspace extends ActionButtonProps {
	workspace: Workspace;
}

export const StartButton: FC<ActionButtonPropsWithWorkspace> = ({
	handleAction,
	workspace,
	loading,
	disabled,
	tooltipText,
}) => {
	const { t } = useTranslation("workspaceDetail");

	let mainButton = (
		<TopbarButton
			data-testid="workspace-start"
			onClick={() => handleAction()}
			disabled={disabled || loading}
		>
			<PlayIcon />
			{loading ? <>{t("status.starting")}…</> : t("actions.start")}
		</TopbarButton>
	);

	if (tooltipText) {
		mainButton = (
			<Tooltip>
				<TooltipTrigger asChild>{mainButton}</TooltipTrigger>
				<TooltipContent side="bottom" className="max-w-xs">
					{tooltipText}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<div className="flex gap-1 items-center">
			{mainButton}
			<BuildParametersPopover
				label={t("restartWithParams")}
				workspace={workspace}
				disabled={loading}
				onSubmit={handleAction}
			/>
		</div>
	);
};

export const StopButton: FC<ActionButtonProps> = ({
	handleAction,
	loading,
}) => {
	const { t } = useTranslation("workspaceDetail");

	return (
		<TopbarButton
			disabled={loading}
			onClick={() => handleAction()}
			data-testid="workspace-stop-button"
		>
			<SquareIcon />
			{loading ? <>{t("status.stopping")}…</> : t("actions.stop")}
		</TopbarButton>
	);
};

export const RestartButton: FC<ActionButtonPropsWithWorkspace> = ({
	handleAction,
	loading,
	workspace,
}) => {
	const { t } = useTranslation("workspaceDetail");

	return (
		<div className="flex gap-1 items-center">
			<TopbarButton
				onClick={() => handleAction()}
				data-testid="workspace-restart-button"
				disabled={loading}
			>
				<RotateCcwIcon />
				{loading ? `${t("status.updating")}…` : t("restart")}
			</TopbarButton>
			<BuildParametersPopover
				label={t("restartWithParams")}
				workspace={workspace}
				disabled={loading}
				onSubmit={handleAction}
			/>
		</div>
	);
};

export const CancelButton: FC<ActionButtonProps> = ({ handleAction }) => {
	const { t } = useTranslation("workspaceDetail");

	return (
		<TopbarButton onClick={() => handleAction()}>
			<BanIcon />
			{t("status.canceling")}
		</TopbarButton>
	);
};

interface DisabledButtonProps {
	label: string;
}

export const DisabledButton: FC<DisabledButtonProps> = ({ label }) => {
	return (
		<TopbarButton disabled>
			<BanIcon />
			{label}
		</TopbarButton>
	);
};

interface FavoriteButtonProps {
	onToggle: (workspaceID: string) => void;
	workspaceID: string;
	isFavorite: boolean;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
	onToggle,
	workspaceID,
	isFavorite,
}) => {
	const { t } = useTranslation("workspaceDetail");

	return (
		<TopbarButton onClick={() => onToggle(workspaceID)}>
			{isFavorite ? <StarOffIcon /> : <StarIcon />}
			{isFavorite ? t("share") : t("favorite")}
		</TopbarButton>
	);
};
