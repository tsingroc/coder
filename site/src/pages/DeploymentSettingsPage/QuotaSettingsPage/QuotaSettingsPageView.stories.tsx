import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	templateQuotaDefaultsKey,
	userQuotaOverridesKey,
	userTemplateQuotasKey,
} from "api/queries/quotas";
import type { FC } from "react";
import { useQueryClient } from "react-query";
import { QuotaSettingsPageView } from "./QuotaSettingsPageView";

const withQuotaData =
	(
		quotas: unknown[],
		userOverrides: unknown[] = [],
		userQuotas?: Record<string, unknown>,
	) =>
	(Story: FC) => {
		const queryClient = useQueryClient();
		queryClient.setQueryData(templateQuotaDefaultsKey(), quotas);
		queryClient.setQueryData(userQuotaOverridesKey, userOverrides);
		if (userQuotas) {
			for (const [key, value] of Object.entries(userQuotas)) {
				queryClient.setQueryData(userTemplateQuotasKey(key), value);
			}
		}
		return <Story />;
	};

const templateQuotas = [
	{
		template_id: "template-1",
		template_name: "dev-template",
		template_display_name: "Development Environment",
		template_icon: "",
		default_quota: 10,
		updated_at: new Date().toISOString(),
	},
	{
		template_id: "template-2",
		template_name: "prod-template",
		template_display_name: "Production Environment",
		template_icon: "",
		default_quota: 5,
		updated_at: new Date().toISOString(),
	},
];

const userOverrides = [
	{
		user_id: "user-1",
		username: "alice",
		email: "alice@example.com",
		avatar_url: "",
		template_id: "template-1",
		template_name: "dev-template",
		template_display_name: "Development Environment",
		template_icon: "",
		workspace_quota: 20,
		updated_at: new Date().toISOString(),
	},
	{
		user_id: "user-1",
		username: "alice",
		email: "alice@example.com",
		avatar_url: "",
		template_id: "template-2",
		template_name: "prod-template",
		template_display_name: "Production Environment",
		template_icon: "",
		workspace_quota: 3,
		updated_at: new Date().toISOString(),
	},
	{
		user_id: "user-2",
		username: "bob",
		email: "bob@example.com",
		avatar_url: "",
		template_id: "template-1",
		template_name: "dev-template",
		template_display_name: "Development Environment",
		template_icon: "",
		workspace_quota: 15,
		updated_at: new Date().toISOString(),
	},
];

const userQuotaDetails: Record<string, unknown> = {
	"user-1": {
		user_id: "user-1",
		quotas: [
			{
				template_id: "template-1",
				quota: 20,
				default_quota: 10,
				current_workspaces: 5,
				is_custom: true,
			},
			{
				template_id: "template-2",
				quota: 3,
				default_quota: 5,
				current_workspaces: 1,
				is_custom: true,
			},
		],
	},
	"user-2": {
		user_id: "user-2",
		quotas: [
			{
				template_id: "template-1",
				quota: 15,
				default_quota: 10,
				current_workspaces: 2,
				is_custom: true,
			},
			{
				template_id: "template-2",
				quota: 5,
				default_quota: 5,
				current_workspaces: 0,
				is_custom: false,
			},
		],
	},
};

const meta: Meta<typeof QuotaSettingsPageView> = {
	title: "pages/DeploymentSettingsPage/QuotaSettingsPageView",
	component: QuotaSettingsPageView,
};

export default meta;
type Story = StoryObj<typeof QuotaSettingsPageView>;

export const Empty: Story = {
	decorators: [withQuotaData([], [])],
};

export const WithTemplateQuotas: Story = {
	decorators: [withQuotaData(templateQuotas, [])],
};

export const WithUserOverrides: Story = {
	decorators: [withQuotaData(templateQuotas, userOverrides, userQuotaDetails)],
};

export const WithError: Story = {
	decorators: [
		withQuotaData(new Error("Failed to load quotas") as unknown as unknown[]),
	],
};
