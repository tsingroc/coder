import type { User } from "api/typesGenerated";
import { Avatar } from "components/Avatar/Avatar";
import { GitIcon } from "components/Icons/GitIcon";
import {
	Sidebar as BaseSidebar,
	SidebarHeader,
	SidebarNavItem,
} from "components/Sidebar/Sidebar";
import {
	BellIcon,
	BrushIcon,
	CalendarCogIcon,
	FingerprintIcon,
	KeyIcon,
	LockIcon,
	ShieldIcon,
	UserIcon,
} from "lucide-react";
import { useDashboard } from "modules/dashboard/useDashboard";
import type { FC } from "react";
import { isDevBuild } from "utils/buildInfo";
import { useUserSettingsLanguage } from "./Language";

interface SidebarProps {
	user: User;
}

export const Sidebar: FC<SidebarProps> = ({ user }) => {
	const lang = useUserSettingsLanguage();
	const { entitlements, experiments, buildInfo } = useDashboard();
	const showSchedulePage =
		entitlements.features.advanced_template_scheduling.enabled;

	return (
		<BaseSidebar>
			<SidebarHeader
				avatar={<Avatar fallback={user.username} src={user.avatar_url} />}
				title={user.username}
				subtitle={user.email}
			/>
			<SidebarNavItem href="account" icon={UserIcon}>
				{lang.account}
			</SidebarNavItem>
			<SidebarNavItem href="appearance" icon={BrushIcon}>
				{lang.appearance}
			</SidebarNavItem>
			<SidebarNavItem href="external-auth" icon={GitIcon}>
				{lang.externalAuth}
			</SidebarNavItem>
			{(experiments.includes("oauth2") || isDevBuild(buildInfo)) && (
				<SidebarNavItem href="oauth2-provider" icon={ShieldIcon}>
					{lang.oauth2Apps}
				</SidebarNavItem>
			)}
			{showSchedulePage && (
				<SidebarNavItem href="schedule" icon={CalendarCogIcon}>
					{lang.schedule}
				</SidebarNavItem>
			)}
			<SidebarNavItem href="security" icon={LockIcon}>
				{lang.security}
			</SidebarNavItem>
			<SidebarNavItem href="ssh-keys" icon={FingerprintIcon}>
				{lang.sshKeys}
			</SidebarNavItem>
			<SidebarNavItem href="tokens" icon={KeyIcon}>
				{lang.tokens}
			</SidebarNavItem>
			<SidebarNavItem href="notifications" icon={BellIcon}>
				{lang.notifications}
			</SidebarNavItem>
		</BaseSidebar>
	);
};
