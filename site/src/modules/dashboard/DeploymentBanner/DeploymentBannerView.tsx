import type {
	DeploymentStats,
	HealthcheckReport,
	WorkspaceStatus,
} from "api/typesGenerated";
import { Button } from "components/Button/Button";
import { HelpTooltipTitle } from "components/HelpTooltip/HelpTooltip";
import { JetBrainsIcon } from "components/Icons/JetBrainsIcon";
import { RocketIcon } from "components/Icons/RocketIcon";
import { TerminalIcon } from "components/Icons/TerminalIcon";
import { VSCodeIcon } from "components/Icons/VSCodeIcon";
import { Link } from "components/Link/Link";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import {
	AppWindowIcon,
	CircleAlertIcon,
	CloudDownloadIcon,
	CloudUploadIcon,
	GaugeIcon,
	GitCompareArrowsIcon,
	PlayIcon,
	RotateCwIcon,
	SquareIcon,
	WrenchIcon,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import {
	type FC,
	type PropsWithChildren,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";
import { PillSpinner } from "components/Pill/Pill";

interface DeploymentBannerViewProps {
	health?: HealthcheckReport;
	stats?: DeploymentStats;
	fetchStats?: () => void;
}

export const DeploymentBannerView: FC<DeploymentBannerViewProps> = ({
	health,
	stats,
	fetchStats,
}) => {
	const { t } = useTranslation();
	const aggregatedMinutes = useMemo(() => {
		if (!stats) {
			return;
		}
		return dayjs(stats.collected_at).diff(stats.aggregated_from, "minutes");
	}, [stats]);

	const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);
	useEffect(() => {
		if (!stats || !fetchStats) {
			return;
		}

		let timeUntilRefresh = dayjs(stats.next_update_at).diff(
			stats.collected_at,
			"seconds",
		);
		setTimeUntilRefresh(timeUntilRefresh);
		let canceled = false;
		const loop = () => {
			if (canceled) {
				return undefined;
			}
			setTimeUntilRefresh(timeUntilRefresh--);
			if (timeUntilRefresh > 0) {
				return window.setTimeout(loop, 1000);
			}
			fetchStats();
		};
		const timeout = setTimeout(loop, 1000);
		return () => {
			canceled = true;
			clearTimeout(timeout);
		};
	}, [fetchStats, stats]);

	// biome-ignore lint/correctness/useExhaustiveDependencies(timeUntilRefresh): periodic refresh
	const lastAggregated = useMemo(() => {
		if (!stats) {
			return;
		}
		if (!fetchStats) {
			// Storybook!
			return "just now";
		}
		return dayjs().to(dayjs(stats.collected_at));
	}, [timeUntilRefresh, stats, fetchStats]);

	const healthErrors = health ? getHealthErrors(health, t) : [];
	const displayLatency = stats?.workspaces.connection_latency_ms.P50 || -1;

	return (
		<div
			className="sticky bottom-0 z-[1] flex h-9 w-full items-center gap-8
		 		overflow-x-auto overflow-y-hidden whitespace-nowrap border-0 border-t border-solid border-border
				bg-surface-primary pr-4 font-mono text-xs leading-none [scrollbar-width:thin]"
		>
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger asChild>
						{healthErrors.length > 0 ? (
							<Link
								asChild
								className="flex p-3 bg-content-destructive"
								showExternalIcon={false}
							>
								<RouterLink
									to="/health"
									data-testid="deployment-health-trigger"
								>
									<CircleAlertIcon className="text-content-primary" />
								</RouterLink>
							</Link>
						) : (
							<div
								className="flex h-full items-center justify-center pl-3"
								data-testid="deployment-health-trigger"
							>
								<RocketIcon className="size-icon-sm" />
							</div>
						)}
					</TooltipTrigger>
					<TooltipContent
						className="ml-3 mb-1 p-4 text-sm text-content-primary
							border border-solid border-border pointer-events-none"
					>
						{healthErrors.length > 0 ? (
							<>
								<HelpTooltipTitle>
									{t("deploymentBanner.healthDetectedProblems")}
								</HelpTooltipTitle>
								<div className="flex flex-col gap-1">
									{healthErrors.map((error) => (
										<HealthIssue key={error}>{error}</HealthIssue>
									))}
								</div>
							</>
						) : (
							t("deploymentBanner.healthStatus")
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<div className="flex items-center">
				<div className="mr-4 text-content-primary">{t("workspaces")}</div>
				<div className="flex gap-2 text-content-secondary">
					<WorkspaceBuildValue
						status="pending"
						count={stats?.workspaces.pending}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="starting"
						count={stats?.workspaces.building}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="running"
						count={stats?.workspaces.running}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="stopped"
						count={stats?.workspaces.stopped}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="failed"
						count={stats?.workspaces.failed}
					/>
				</div>
			</div>

			<div className="flex items-center">
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="mr-4 text-content-primary">
								{t("transmission")}
							</div>
						</TooltipTrigger>
						<TooltipContent>
							{t("deploymentBanner.activityInLastMinutes", {
								minutes: aggregatedMinutes ?? 0,
							})}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<div className="flex gap-2 text-content-secondary">
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<CloudDownloadIcon className="size-icon-xs" />
									{stats ? prettyBytes(stats.workspaces.rx_bytes) : "-"}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{t("deploymentBanner.dataSentToWorkspaces")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<CloudUploadIcon className="size-icon-xs" />
									{stats ? prettyBytes(stats.workspaces.tx_bytes) : "-"}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{t("deploymentBanner.dataSentFromWorkspaces")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<GaugeIcon className="size-icon-xs" />
									{displayLatency > 0
										? `${displayLatency?.toFixed(2)} ms`
										: "-"}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{displayLatency < 0
									? t("deploymentBanner.noRecentConnections")
									: t("deploymentBanner.averageLatency")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="flex items-center">
				<div className="mr-4 text-content-primary">
					{t("activeConnections")}
				</div>

				<div className="flex gap-2 text-content-secondary">
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<VSCodeIcon className="size-icon-xs [&_*]:fill-current" />
									{typeof stats?.session_count.vscode === "undefined"
										? "-"
										: stats?.session_count.vscode}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{t("deploymentBanner.vscodeEditors")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<JetBrainsIcon className="size-icon-xs [&_*]:fill-current" />
									{typeof stats?.session_count.jetbrains === "undefined"
										? "-"
										: stats?.session_count.jetbrains}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{t("deploymentBanner.jetbrainsEditors")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<TerminalIcon className="size-icon-xs" />
									{typeof stats?.session_count.ssh === "undefined"
										? "-"
										: stats?.session_count.ssh}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{t("deploymentBanner.sshSessions")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<AppWindowIcon className="size-icon-xs" />
									{typeof stats?.session_count.reconnecting_pty === "undefined"
										? "-"
										: stats?.session_count.reconnecting_pty}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{t("deploymentBanner.webTerminalSessions")}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="ml-auto flex mr-3 items-center gap-8 text-content-primary">
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-1">
								<GitCompareArrowsIcon className="size-icon-xs" />
								{lastAggregated}
							</div>
						</TooltipTrigger>
						<TooltipContent
							className="max-w-xs"
							collisionPadding={{ right: 20 }}
						>
							{t("deploymentBanner.lastAggregated")}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="font-mono [&_svg]:mr-1"
								onClick={() => {
									if (fetchStats) {
										fetchStats();
									}
								}}
								variant="subtle"
								size="icon"
							>
								<RotateCwIcon />
								{timeUntilRefresh}s
							</Button>
						</TooltipTrigger>
						<TooltipContent
							className="max-w-xs"
							collisionPadding={{ right: 20 }}
						>
							{t("deploymentBanner.countdownToRefresh")}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
};

interface WorkspaceBuildValueProps {
	status: WorkspaceStatus;
	count?: number;
}

const WorkspaceBuildValue: FC<WorkspaceBuildValueProps> = ({
	status,
	count,
}) => {
	const { t } = useTranslation();

	// Local version of getDisplayWorkspaceStatus
	const getStatusDisplay = (workspaceStatus: WorkspaceStatus) => {
		switch (workspaceStatus) {
			case "running":
				return {
					text: t("workspaceDetail.status.running"),
					icon: <PlayIcon className="size-icon-xs" />,
				};
			case "starting":
				return {
					text: t("building"),
					icon: <WrenchIcon className="size-icon-xs" />,
				};
			case "stopping":
				return {
					text: t("workspaceDetail.status.stopping"),
					icon: <PillSpinner />,
				};
			case "stopped":
				return {
					text: t("workspaceDetail.status.stopped"),
					icon: <SquareIcon className="size-icon-xs" />,
				};
			case "deleting":
				return {
					text: t("workspaceDetail.status.deleting"),
					icon: <PillSpinner />,
				};
			case "deleted":
				return {
					text: t("workspaceDetail.status.deleted"),
					icon: <CircleAlertIcon className="size-icon-xs" />,
				};
			case "canceling":
				return {
					text: t("workspaceDetail.status.canceling"),
					icon: <PillSpinner />,
				};
			case "canceled":
				return {
					text: t("workspaceDetail.status.canceled"),
					icon: <CircleAlertIcon className="size-icon-xs" />,
				};
			case "failed":
				return {
					text: t("workspaceDetail.status.failed"),
					icon: <CircleAlertIcon className="size-icon-xs" />,
				};
			case "pending":
				return {
					text: t("workspaceDetail.status.pending"),
					icon: <PillSpinner />,
				};
			default:
				return {
					text: t("workspaceDetail.status.loading"),
					icon: <PillSpinner />,
				};
		}
	};

	const displayStatus = getStatusDisplay(status);
	const statusText = displayStatus.text;
	const icon = displayStatus.icon;

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Link asChild showExternalIcon={false}>
						<RouterLink
							to={`/workspaces?filter=${encodeURIComponent(`status:${status}`)}`}
						>
							<div className="flex items-center gap-1 text-xs">
								{icon}
								{typeof count === "undefined" ? "-" : count}
							</div>
						</RouterLink>
					</Link>
				</TooltipTrigger>
				<TooltipContent>{`${statusText} ${t("workspaces")}`}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const ValueSeparator: FC = () => {
	return <div className="text-content-disabled self-center">/</div>;
};

const HealthIssue: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex items-center gap-1">
			<CircleAlertIcon className="size-icon-sm text-border-destructive" />
			{children}
		</div>
	);
};

const getHealthErrors = (health: HealthcheckReport, t: TFunction) => {
	const warnings: string[] = [];
	const sections = [
		"access_url",
		"database",
		"derp",
		"websocket",
		"workspace_proxy",
	] as const;
	const messages: Record<(typeof sections)[number], string> = {
		access_url: t("deploymentBanner.accessUrlError"),
		database: t("deploymentBanner.databaseError"),
		derp: t("deploymentBanner.derpError"),
		websocket: t("deploymentBanner.websocketError"),
		workspace_proxy: t("deploymentBanner.workspaceProxyError"),
	} as const;

	for (const section of sections) {
		if (health[section].severity === "error" && !health[section].dismissed) {
			warnings.push(messages[section]);
		}
	}

	return warnings;
};
