import type * as TypesGen from "api/typesGenerated";
import { CheckIcon } from "components/AnimatedIcons/Check";
import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "components/DropdownMenu/DropdownMenu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { useClipboard } from "hooks/useClipboard";
import {
	CircleUserIcon,
	CopyIcon,
	LogOutIcon,
	MonitorDownIcon,
	SquareArrowOutUpRightIcon,
} from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SupportIcon } from "../SupportIcon";

interface UserDropdownContentProps {
	user: TypesGen.User;
	buildInfo?: TypesGen.BuildInfoResponse;
	supportLinks: readonly TypesGen.LinkConfig[];
	onSignOut: () => void;
}

export const UserDropdownContent: FC<UserDropdownContentProps> = ({
	user,
	buildInfo,
	supportLinks,
	onSignOut,
}) => {
	const { t } = useTranslation();
	const { showCopiedSuccess, copyToClipboard } = useClipboard();

	return (
		<>
			<DropdownMenuItem
				className="flex items-center gap-3 [&_img]:w-full [&_img]:h-full"
				asChild
			>
				<Link to="/settings/account">
					<div className="flex flex-col">
						<span className="text-content-primary">{user.username}</span>
						<span className="text-xs font-semibold">{user.email}</span>
					</div>
				</Link>
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild>
				<Link to="/install">
					<MonitorDownIcon />
					<span>{t("userDropdown.installCLI")}</span>
				</Link>
			</DropdownMenuItem>
			<DropdownMenuItem asChild>
				<Link to="/settings/account">
					<CircleUserIcon />
					<span>{t("userDropdown.account")}</span>
				</Link>
			</DropdownMenuItem>
			<DropdownMenuItem onClick={onSignOut}>
				<LogOutIcon />
				<span>{t("userDropdown.signOut")}</span>
			</DropdownMenuItem>
			{supportLinks && supportLinks.length > 0 && (
				<>
					<DropdownMenuSeparator />
					{supportLinks.map((link) => (
						<DropdownMenuItem key={link.name} asChild>
							<a href={link.target} target="_blank" rel="noreferrer">
								{link.icon && <SupportIcon icon={link.icon} />}
								<span>{link.name}</span>
							</a>
						</DropdownMenuItem>
					))}
				</>
			)}
			<DropdownMenuSeparator />
			<Tooltip disableHoverableContent>
				<TooltipTrigger asChild>
					<DropdownMenuItem className="text-xs" asChild>
						<a
							href={buildInfo?.external_url}
							className="flex items-center gap-2"
							target="_blank"
							rel="noreferrer"
						>
							<span className="flex-1">{buildInfo?.version}</span>
							<SquareArrowOutUpRightIcon className="!size-icon-xs" />
						</a>
					</DropdownMenuItem>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					{t("userDropdown.browseSourceCode")}
				</TooltipContent>
			</Tooltip>
			{buildInfo?.deployment_id && (
				<Tooltip disableHoverableContent>
					<TooltipTrigger asChild>
						<DropdownMenuItem
							className="text-xs"
							onSelect={(e) => {
								e.preventDefault();
								copyToClipboard(buildInfo.deployment_id);
							}}
						>
							<span className="truncate flex-1">{buildInfo.deployment_id}</span>
							{showCopiedSuccess ? (
								<CheckIcon className="!size-icon-xs ml-auto" />
							) : (
								<CopyIcon className="!size-icon-xs ml-auto" />
							)}
						</DropdownMenuItem>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{showCopiedSuccess
							? t("userDropdown.copied")
							: t("userDropdown.copyDeploymentId")}
					</TooltipContent>
				</Tooltip>
			)}
			<DropdownMenuItem className="text-xs" disabled>
				<span>
					{t("userDropdown.copyright", { year: new Date().getFullYear() })}
				</span>
			</DropdownMenuItem>
		</>
	);
};
