import { ChevronDownIcon } from "components/AnimatedIcons/ChevronDown";
import { Button } from "components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "components/DropdownMenu/DropdownMenu";
import { linkToAuditing } from "modules/navigation";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

interface DeploymentDropdownProps {
	canViewDeployment: boolean;
	canViewOrganizations: boolean;
	canViewAuditLog: boolean;
	canViewConnectionLog: boolean;
	canViewHealth: boolean;
	canViewAIBridge: boolean;
}

export const DeploymentDropdown: FC<DeploymentDropdownProps> = ({
	canViewDeployment,
	canViewOrganizations,
	canViewAuditLog,
	canViewConnectionLog,
	canViewHealth,
	canViewAIBridge,
}) => {
	const { t } = useTranslation();
	if (
		!canViewAuditLog &&
		!canViewConnectionLog &&
		!canViewOrganizations &&
		!canViewDeployment &&
		!canViewHealth &&
		!canViewAIBridge
	) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="lg">
					{t("adminSettings")}
					<ChevronDownIcon className="text-content-primary" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-[180px] min-w-auto">
				<DeploymentDropdownContent
					canViewDeployment={canViewDeployment}
					canViewOrganizations={canViewOrganizations}
					canViewAuditLog={canViewAuditLog}
					canViewConnectionLog={canViewConnectionLog}
					canViewHealth={canViewHealth}
					canViewAIBridge={canViewAIBridge}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const DeploymentDropdownContent: FC<DeploymentDropdownProps> = ({
	canViewDeployment,
	canViewOrganizations,
	canViewAuditLog,
	canViewHealth,
	canViewConnectionLog,
	canViewAIBridge,
}) => {
	const { t } = useTranslation();

	return (
		<nav>
			{canViewDeployment && (
				<DropdownMenuItem asChild>
					<Link to="/deployment">{t("deployment")}</Link>
				</DropdownMenuItem>
			)}
			{canViewOrganizations && (
				<DropdownMenuItem asChild>
					<Link to="/organizations">{t("organizations")}</Link>
				</DropdownMenuItem>
			)}
			{canViewAuditLog && (
				<DropdownMenuItem asChild>
					<Link to={linkToAuditing}>{t("auditLogs")}</Link>
				</DropdownMenuItem>
			)}
			{canViewConnectionLog && (
				<DropdownMenuItem asChild>
					<Link to="/connectionlog">{t("connectionLogs")}</Link>
				</DropdownMenuItem>
			)}
			{canViewAIBridge && (
				<DropdownMenuItem asChild>
					<Link to="/aibridge">{t("aiBridgeLogs")}</Link>
				</DropdownMenuItem>
			)}
			{canViewHealth && (
				<DropdownMenuItem asChild>
					<Link to="/health">{t("healthcheck")}</Link>
				</DropdownMenuItem>
			)}
		</nav>
	);
};
