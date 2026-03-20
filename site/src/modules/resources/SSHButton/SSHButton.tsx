import { deploymentSSHConfig } from "api/queries/deployment";
import { ChevronDownIcon } from "components/AnimatedIcons/ChevronDown";
import { Button } from "components/Button/Button";
import { CodeExample } from "components/CodeExample/CodeExample";
import {
	HelpTooltipLink,
	HelpTooltipLinksGroup,
	HelpTooltipText,
} from "components/HelpTooltip/HelpTooltip";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "components/Popover/Popover";
import { Stack } from "components/Stack/Stack";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { docs } from "utils/docs";

interface AgentSSHButtonProps {
	workspaceName: string;
	agentName: string;
	workspaceOwnerUsername: string;
}

export const AgentSSHButton: FC<AgentSSHButtonProps> = ({
	workspaceName,
	agentName,
	workspaceOwnerUsername,
}) => {
	const { t } = useTranslation("workspaceDetail");
	const { data } = useQuery(deploymentSSHConfig());
	const sshSuffix = data?.hostname_suffix;

	return (
		<Popover>
			<PopoverTrigger asChild={true}>
				<Button size="sm" variant="subtle">
					{t("resources.ssh.connectViaSSH")}
					<ChevronDownIcon />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="py-4 px-6 w-80 text-content-secondary mt-[2px] bg-surface-secondary"
			>
				<HelpTooltipText>
					{t("resources.ssh.runCommands")}
				</HelpTooltipText>

				<ol style={{ margin: 0, padding: 0 }}>
					<Stack spacing={0.5} className="mt-3">
						<SSHStep
							helpText={t("resources.ssh.configureSSH")}
							codeExample="coder config-ssh"
						/>
						<SSHStep
							helpText={t("resources.ssh.connectToAgent")}
							codeExample={`ssh ${agentName}.${workspaceName}.${workspaceOwnerUsername}.${sshSuffix}`}
						/>
					</Stack>
				</ol>

				<HelpTooltipLinksGroup>
					<HelpTooltipLink href={docs("/install")}>
						{t("resources.ssh.installCLILink")}
					</HelpTooltipLink>
					<HelpTooltipLink href={docs("/user-guides/workspace-access/vscode")}>
						{t("resources.ssh.vscodeSSHLink")}
					</HelpTooltipLink>
					<HelpTooltipLink
						href={docs("/user-guides/workspace-access/jetbrains")}
					>
						{t("resources.ssh.jetbrainsLink")}
					</HelpTooltipLink>
					<HelpTooltipLink href={docs("/user-guides/desktop")}>
						{t("resources.ssh.desktopLink")}
					</HelpTooltipLink>
					<HelpTooltipLink href={docs("/user-guides/workspace-access#ssh")}>
						{t("resources.ssh.sshConfigLink")}
					</HelpTooltipLink>
				</HelpTooltipLinksGroup>
			</PopoverContent>
		</Popover>
	);
};

interface SSHStepProps {
	helpText: string;
	codeExample: string;
}

const SSHStep: FC<SSHStepProps> = ({ helpText, codeExample }) => (
	<li style={{ listStylePosition: "inside" }}>
		<HelpTooltipText style={{ display: "inline" }}>
			<strong className="text-xs">{helpText}</strong>
		</HelpTooltipText>
		<CodeExample secret={false} code={codeExample} />
	</li>
);
