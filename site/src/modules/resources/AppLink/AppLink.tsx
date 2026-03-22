import type * as TypesGen from "api/typesGenerated";
import { DropdownMenuItem } from "components/DropdownMenu/DropdownMenu";
import { Link } from "components/Link/Link";
import { Markdown } from "components/Markdown/Markdown";
import { Spinner } from "components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { useProxy } from "contexts/ProxyContext";
import {
	Building2Icon,
	CircleAlertIcon,
	GlobeIcon,
	type LucideIcon,
	SquareArrowOutUpRightIcon,
	UsersIcon,
} from "lucide-react";
import { isExternalApp, needsSessionToken } from "modules/apps/apps";
import { useAppLink } from "modules/apps/useAppLink";
import { type FC, type ReactNode, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { AgentButton } from "../AgentButton";
import { BaseIcon } from "./BaseIcon";

export const DisplayAppNameMap: Record<TypesGen.DisplayApp, string> = {
	port_forwarding_helper: "Ports",
	ssh_helper: "SSH",
	vscode: "VS Code Desktop",
	vscode_insiders: "VS Code Insiders",
	web_terminal: "Terminal",
};

// Helper function to get localized app name
export const getDisplayAppName = (
	app: TypesGen.DisplayApp,
	t: TFunction<"workspaceDetail">,
): string => {
	const keyMap: Record<TypesGen.DisplayApp, string> = {
		port_forwarding_helper: "resources.portForwarding.title",
		ssh_helper: "resources.ssh.title",
		vscode: "applications.vscodeDesktop",
		vscode_insiders: "applications.vscodeInsiders",
		web_terminal: "applications.terminal",
	};
	return (t as any)(keyMap[app] || app);
};

interface AppLinkProps {
	workspace: TypesGen.Workspace;
	app: TypesGen.WorkspaceApp;
	agent: TypesGen.WorkspaceAgent;
	grouped?: boolean;
}

export const AppLink: FC<AppLinkProps> = ({
	app,
	workspace,
	agent,
	grouped,
}) => {
	const { t } = useTranslation("workspaceDetail");
	const { proxy } = useProxy();
	const host = proxy.preferredWildcardHostname;
	const [iconError, setIconError] = useState(false);
	const link = useAppLink(app, { agent, workspace });

	// canClick is ONLY false when it's a subdomain app and the admin hasn't
	// enabled wildcard access URL or the session token is being fetched.
	//
	// To avoid bugs in the healthcheck code locking users out of apps, we no
	// longer block access to apps if they are unhealthy/initializing.
	let canClick = true;
	let primaryTooltip: ReactNode = "";
	let icon = !iconError && (
		<BaseIcon app={app} onIconPathError={() => setIconError(true)} />
	);

	if (app.health === "initializing") {
		icon = <Spinner loading />;
		primaryTooltip = t("applications.starting");
	}

	if (app.health === "unhealthy") {
		icon = (
			<CircleAlertIcon
				aria-hidden="true"
				className="size-icon-sm text-content-warning"
			/>
		);
		primaryTooltip = t("applications.unhealthy");
	}

	if (!host && app.subdomain) {
		canClick = false;
		icon = (
			<CircleAlertIcon
				aria-hidden="true"
				className="size-icon-sm text-content-secondary"
			/>
		);
		primaryTooltip = t("appsWarning.message");
	}

	if (app.subdomain_name && app.subdomain_name.length > 63) {
		icon = (
			<CircleAlertIcon
				aria-hidden="true"
				className="size-icon-sm text-content-warning"
			/>
		);
		primaryTooltip = (
			<>
				{t("resources.portForwarding.hostnameTooLong")}
				<Link
					href="https://coder.com/docs/user-guides/workspace-access/port-forwarding#dashboard"
					target="_blank"
					size="sm"
				>
					{t("resources.portForwarding.documentation")}
				</Link>
			</>
		);
	}

	if (isExternalApp(app) && needsSessionToken(app) && !link.hasToken) {
		canClick = false;
	}

	if (
		agent.lifecycle_state === "starting" &&
		agent.startup_script_behavior === "blocking"
	) {
		canClick = false;
	}

	const canShare = app.sharing_level !== "owner";
	const { shareTooltip, shareIcon: ShareIcon } = canShare
		? app.external
			? {
					shareTooltip: t("resources.portForwarding.openExternalUrl"),
					shareIcon: SquareArrowOutUpRightIcon,
				}
			: getShareDetails(app.sharing_level, t)
		: {
				shareTooltip: null,
				shareIcon: null,
			};

	const button = grouped ? (
		<DropdownMenuItem asChild>
			<a
				href={canClick ? link.href : undefined}
				onClick={link.onClick}
				target={app.open_in === "tab" ? "_blank" : undefined}
				rel={app.open_in === "tab" ? "noreferrer" : undefined}
			>
				{icon}
				{link.label}
				{ShareIcon && <ShareIcon />}
			</a>
		</DropdownMenuItem>
	) : (
		<AgentButton asChild>
			<a
				href={canClick ? link.href : undefined}
				onClick={link.onClick}
				target={app.open_in === "tab" ? "_blank" : undefined}
				rel={app.open_in === "tab" ? "noreferrer" : undefined}
			>
				{icon}
				{link.label}
				{ShareIcon && <ShareIcon />}
			</a>
		</AgentButton>
	);

	if (primaryTooltip || app.tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent className="max-w-xs">
					{primaryTooltip ? (
						primaryTooltip
					) : app.tooltip ? (
						<Markdown className="text-content-secondary prose-sm font-medium wrap-anywhere">
							{app.tooltip}
						</Markdown>
					) : null}
					{shareTooltip}
				</TooltipContent>
			</Tooltip>
		);
	}

	return button;
};

const shareDetails: {
	[SharingLevel in TypesGen.WorkspaceAppSharingLevel as Exclude<
		SharingLevel,
		"owner"
	>]: { shareTooltip: string; shareIcon: LucideIcon };
} = {
	authenticated: {
		shareTooltip: "Shared with all authenticated users",
		shareIcon: UsersIcon,
	},
	organization: {
		shareTooltip: "Shared with organization members",
		shareIcon: Building2Icon,
	},
	public: {
		shareTooltip: "Shared publicly",
		shareIcon: GlobeIcon,
	},
};

// Helper function to get localized share details
const getShareDetails = (
	sharingLevel: TypesGen.WorkspaceAppSharingLevel,
	t: TFunction<"workspaceDetail">,
): { shareTooltip: string; shareIcon: LucideIcon } => {
	const details = shareDetails[sharingLevel as Exclude<typeof sharingLevel, "owner">];
	if (!details) {
		return { shareTooltip: "", shareIcon: Building2Icon };
	}
	const tooltipKeyMap: Record<typeof sharingLevel, string> = {
		authenticated: "resources.portForwarding.sharedAuthenticated",
		organization: "resources.portForwarding.sharedOrganization",
		public: "resources.portForwarding.sharedPublic",
		owner: "",
	};
	return {
		...details,
		shareTooltip: (t as any)(tooltipKeyMap[sharingLevel] || details.shareTooltip),
	};
};
