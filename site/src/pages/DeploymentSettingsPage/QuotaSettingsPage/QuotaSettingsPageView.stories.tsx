import type { Meta, StoryObj } from "@storybook/react-vite";
import { templateQuotaDefaultsKey } from "api/queries/quotas";
import type { FC } from "react";
import { useQueryClient } from "react-query";
import { QuotaSettingsPageView } from "./QuotaSettingsPageView";

const withQuotaData =
	(quotas: unknown[]) =>
	(Story: FC) => {
		const queryClient = useQueryClient();
		queryClient.setQueryData(templateQuotaDefaultsKey(), quotas);
		return <Story />;
	};

const withQuotaError =
	(Story: FC) => {
		const queryClient = useQueryClient();
		queryClient.setQueryData(templateQuotaDefaultsKey(), new Error("Failed to load quotas"));
		return <Story />;
	};

const meta: Meta<typeof QuotaSettingsPageView> = {
	title: "pages/DeploymentSettingsPage/QuotaSettingsPageView",
	component: QuotaSettingsPageView,
};

export default meta;
type Story = StoryObj<typeof QuotaSettingsPageView>;

export const Empty: Story = {
	decorators: [withQuotaData([])],
};

export const WithQuotas: Story = {
	decorators: [
		withQuotaData([
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
		]),
	],
};

export const WithError: Story = {
	decorators: [withQuotaError],
};
