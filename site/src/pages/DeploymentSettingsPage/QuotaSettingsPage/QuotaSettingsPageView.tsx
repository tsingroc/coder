import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "api/errors";
import {
	getAllTemplateQuotaDefaults,
	setTemplateQuotaDefault,
} from "api/queries/quotas";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "components/SettingsHeader/SettingsHeader";
import { Stack } from "components/Stack/Stack";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from "components/Table/Table";
import { TextField } from "components/TextField/TextField";
import { Button } from "components/Button/Button";
import { SaveIcon } from "components/Icons/Icons";
import type { TemplateQuotaDefault } from "api/typesGenerated";

export const QuotaSettingsPageView: FC = () => {
	const queryClient = useQueryClient();
	const [editingQuota, setEditingQuota] = useState<string | null>(null);
	const [quotaValues, setQuotaValues] = useState<Record<string, number>>({});

	const {
		data: quotas = [],
		error: quotasError,
		isLoading: quotasLoading,
	} = useQuery({
		queryKey: ["templateQuotaDefaults"],
		queryFn: () => getAllTemplateQuotaDefaults(),
	});

	const { mutate: setQuota, isLoading: isSetting } = useMutation({
		mutationFn: ({
			templateId,
			quota,
		}: {
			templateId: string;
			quota: number;
		}) => setTemplateQuotaDefault(templateId, { default_quota: quota }),
		onSuccess: () => {
			displaySuccess("Quota updated successfully");
			setEditingQuota(null);
			queryClient.invalidateQueries(["templateQuotaDefaults"]);
		},
		onError: (error) => {
			displayError(getErrorMessage(error));
		},
	});

	const handleSave = (templateId: string) => {
		const quota = quotaValues[templateId];
		if (quota && quota > 0) {
			setQuota({ templateId, quota });
		}
	};

	const handleCancel = (templateId: string) => {
		setEditingQuota(null);
		delete quotaValues[templateId];
	};

	const handleEdit = (templateId: string, currentQuota: number) => {
		setEditingQuota(templateId);
		setQuotaValues({ ...quotaValues, [templateId]: currentQuota });
	};

	return (
		<Stack direction="column" spacing={6}>
			<SettingsHeader>
				<SettingsHeaderTitle>Workspace Quotas</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					Manage default workspace quotas for templates
				</SettingsHeaderDescription>
			</SettingsHeader>

			{quotasLoading ? (
				<div>Loading...</div>
			) : quotasError ? (
				<div>Error loading quotas: {getErrorMessage(quotasError)}</div>
			) : (
				<Table aria-label="Template quota defaults">
					<TableHeader>
						<TableRow>
							<TableHeaderCell>Template</TableHeaderCell>
							<TableHeaderCell>Default Quota</TableHeaderCell>
							<TableHeaderCell>Actions</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{quotas.map((quota) => (
							<TableRow key={quota.template_id}>
								<TableCell>
									<div className="flex flex-col">
										<span className="font-medium">
											{quota.template_display_name || quota.template_name}
										</span>
										<span className="text-sm text-content-secondary">
											ID: {quota.template_id}
										</span>
									</div>
								</TableCell>
								<TableCell>
									{editingQuota === quota.template_id ? (
										<TextField
											type="number"
											min={1}
											value={
												quotaValues[quota.template_id] || quota.default_quota
											}
											onChange={(e) =>
												setQuotaValues({
													...quotaValues,
													[quota.template_id]:
														Number.parseInt(e.target.value, 10) || 0,
												})
											}
											autoFocus
										/>
									) : (
										<span>{quota.default_quota} workspaces</span>
									)}
								</TableCell>
								<TableCell>
									{editingQuota === quota.template_id ? (
										<div className="flex gap-2">
											<Button
												onClick={() => handleSave(quota.template_id)}
												disabled={isSetting}
												variant="primary"
											>
												<SaveIcon />
												Save
											</Button>
											<Button
												onClick={() => handleCancel(quota.template_id)}
												disabled={isSetting}
											>
												Cancel
											</Button>
										</div>
									) : (
										<Button
											onClick={() =>
												handleEdit(quota.template_id, quota.default_quota)
											}
											variant="secondary"
										>
											Edit
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</Stack>
	);
};
