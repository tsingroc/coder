import { Avatar } from "components/Avatar/Avatar";
import { FeatureStageBadge } from "components/FeatureStageBadge/FeatureStageBadge";
import {
	Sidebar as BaseSidebar,
	SidebarHeader,
	SidebarNavItem,
} from "components/Sidebar/Sidebar";
import {
	SettingsIcon as GeneralIcon,
	CodeIcon as ParameterIcon,
	TimerIcon as ScheduleIcon,
	Users as SharingIcon,
} from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaceSettings } from "./WorkspaceSettingsLayout";

export const Sidebar: FC = () => {
	const { t } = useTranslation("workspaceSettings");
	const { owner, workspace, permissions } = useWorkspaceSettings();

	return (
		<BaseSidebar>
			<SidebarHeader
				avatar={
					<Avatar
						variant="icon"
						src={workspace.template_icon}
						fallback={workspace.name}
					/>
				}
				title={workspace.name}
				linkTo={`/@${owner}/${workspace.name}`}
				subtitle={workspace.template_display_name ?? workspace.template_name}
			/>

			<SidebarNavItem href="" icon={GeneralIcon}>
				{t("sidebar.general")}
			</SidebarNavItem>
			<SidebarNavItem href="parameters" icon={ParameterIcon}>
				{t("sidebar.parameters")}
			</SidebarNavItem>
			<SidebarNavItem href="schedule" icon={ScheduleIcon}>
				{t("sidebar.schedule")}
			</SidebarNavItem>
			{permissions?.shareWorkspace && (
				<SidebarNavItem href="sharing" icon={SharingIcon}>
					{t("sidebar.sharing")}
					<FeatureStageBadge contentType="beta" size="sm" />
				</SidebarNavItem>
			)}
		</BaseSidebar>
	);
};
