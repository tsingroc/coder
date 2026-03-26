import type { Meta, StoryObj } from "@storybook/react";
import { within, expect, waitFor } from "@storybook/test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuotaSettingsPageView } from "./QuotaSettingsPageView";
import { MockTemplateQuotaDefaults } from "test_helpers/entities";
import { getLoader } from "test_helpers/storybook";

const meta: Meta<typeof QuotaSettingsPageView> = {
	title: "Pages/DeploymentSettingsPage/QuotaSettingsPage",
	component: QuotaSettingsPageView,
	args: {},
};

export default meta;
type Story = StoryObj<typeof QuotaSettingsPageView>;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

const withQueryClient = (Story: Story) => (
	<QueryClientProvider client={queryClient}>
		<Story />
	</QueryClientProvider>
);

export const Loading: Story = {
	decorators: [withQueryClient],
	parameters: {
		mswHandlers: [
			getLoader("/api/v2/workspace-quotas/templates/defaults", async () => {
				return new Promise((resolve) => setTimeout(() => resolve([]), 10000));
			}),
		],
	},
};

export const WithQuotas: Story = {
	decorators: [withQueryClient],
	parameters: {
		mswHandlers: [
			getLoader("/api/v2/workspace-quotas/templates/defaults", async () => {
				return [
					MockTemplateQuotaDefaults({
						template_id: "template-1",
						template_name: "Development Template",
						template_display_name: "Development Environment",
						default_quota: 10,
						updated_at: new Date().toISOString(),
					}),
					MockTemplateQuotaDefaults({
						template_id: "template-2",
						template_name: "Production Template",
						template_display_name: "Production Environment",
						default_quota: 5,
						updated_at: new Date().toISOString(),
					}),
				];
			}),
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Wait for quotas to load
		await waitFor(() => {
			expect(canvas.getByText("Workspace Quotas")).toBeInTheDocument();
		});

		// Check that templates are displayed
		await waitFor(() => {
			expect(canvas.getByText("Development Environment")).toBeInTheDocument();
			expect(canvas.getByText("Production Environment")).toBeInTheDocument();
		});

		// Check quota values
		await waitFor(() => {
			expect(canvas.getByText("10 workspaces")).toBeInTheDocument();
			expect(canvas.getByText("5 workspaces")).toBeInTheDocument();
		});

		// Check that edit buttons are present
		const editButtons = canvas.getAllByText("Edit");
		expect(editButtons).toHaveLength(2);
	},
};

export const Empty: Story = {
	decorators: [withQueryClient],
	parameters: {
		mswHandlers: [
			getLoader("/api/v2/workspace-quotas/templates/defaults", async () => {
				return [];
			}),
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Wait for page to load
		await waitFor(() => {
			expect(canvas.getByText("Workspace Quotas")).toBeInTheDocument();
		});

		// Check that table is shown but empty
		const table = canvas.getByRole("table");
		expect(table).toBeInTheDocument();
	},
};

export const Error: Story = {
	decorators: [withQueryClient],
	parameters: {
		mswHandlers: [
			getLoader("/api/v2/workspace-quotas/templates/defaults", async () => {
				throw new Error("Failed to fetch quotas");
			}),
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Wait for error message
		await waitFor(() => {
			expect(canvas.getByText(/Error loading quotas/i)).toBeInTheDocument();
		});
	},
};
