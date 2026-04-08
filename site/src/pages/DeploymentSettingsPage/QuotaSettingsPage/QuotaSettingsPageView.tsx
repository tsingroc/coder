import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getErrorMessage } from "api/errors";
import {
	templateQuotaDefaultsKey,
	getAllTemplateQuotaDefaults,
	setTemplateQuotaDefault,
} from "api/queries/quotas";
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
	TableHead,
	TableRow,
} from "components/Table/Table";
import { Input } from "components/Input/Input";
import { Button } from "components/Button/Button";
import { Loader } from "components/Loader/Loader";
import { Pencil, Save } from "lucide-react";
import { toast } from "sonner";

export const QuotaSettingsPageView: FC = () => {
	const queryClient = useQueryClient();
	const [editingQuota, setEditingQuota] = useState<string | null>(null);
	const [quotaValues, setQuotaValues] = useState<Record<string, number>>({});

	const {
		data: quotas = [],
		error: quotasError,
		isLoading: quotasLoading,
	} = useQuery({
		queryKey: templateQuotaDefaultsKey(),
		queryFn: () => getAllTemplateQuotaDefaults(),
	});

	const { mutate: setQuota, isPending: isSetting } = useMutation({
		mutationFn: ({
			templateId,
			quota,
		}: {
			templateId: string;
			quota: number;
		}) => setTemplateQuotaDefault(templateId, { default_quota: quota }),
		onSuccess: () => {
			toast.success("Quota updated successfully");
			setEditingQuota(null);
			void queryClient.invalidateQueries({ queryKey: templateQuotaDefaultsKey() });
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Failed to update quota."));
		},
	});

	const handleSave = (templateId: string) => {
		const quota = quotaValues[templateId];
		if (quota && quota > 0) {
			setQuota({ templateId, quota });
		}
	};

	const handleCancel = () => {
		setEditingQuota(null);
	};

	const handleEdit = (templateId: string, currentQuota: number) => {
		setEditingQuota(templateId);
		setQuotaValues({ ...quotaValues, [templateId]: currentQuota });
	};

	if (quotasLoading) {
		return <Loader />;
	}

	if (quotasError) {
		return (
			<Stack direction="column" spacing={6}>
				<SettingsHeader>
					<SettingsHeaderTitle>Workspace Quotas</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						Manage default workspace quotas for templates
					</SettingsHeaderDescription>
				</SettingsHeader>
				<p>Error loading quotas: {getErrorMessage(quotasError, "Failed to load quotas.")}</p>
			</Stack>
		);
	}

	return (
		<Stack direction="column" spacing={6}>
			<SettingsHeader>
				<SettingsHeaderTitle>Workspace Quotas</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					Manage default workspace quotas for templates
				</SettingsHeaderDescription>
			</SettingsHeader>

			<Table aria-label="Template quota defaults">
				<TableHeader>
					<TableRow>
						<TableHead>Template</TableHead>
						<TableHead>Default Quota</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{quotas.map((q) => (
						<TableRow key={q.template_id}>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">
										{q.template_display_name || q.template_name}
									</span>
									<span className="text-sm text-content-secondary">
										ID: {q.template_id}
									</span>
								</div>
							</TableCell>
							<TableCell>
								{editingQuota === q.template_id ? (
									<Input
										type="number"
										min={1}
										value={
											quotaValues[q.template_id] || q.default_quota
										}
										onChange={(e) =>
											setQuotaValues({
												...quotaValues,
												[q.template_id]:
													Number.parseInt(e.target.value, 10) || 0,
											})
										}
										autoFocus
									/>
								) : (
									<span>{q.default_quota} workspaces</span>
								)}
							</TableCell>
							<TableCell>
								{editingQuota === q.template_id ? (
									<div className="flex gap-2">
										<Button
											onClick={() => handleSave(q.template_id)}
											disabled={isSetting}
										>
											<Save />
											Save
										</Button>
										<Button
											onClick={handleCancel}
											disabled={isSetting}
											variant="outline"
										>
											Cancel
										</Button>
									</div>
								) : (
									<Button
										onClick={() =>
											handleEdit(q.template_id, q.default_quota)
										}
										variant="outline"
										size="sm"
									>
										<Pencil />
										Edit
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Stack>
	);
};

export default QuotaSettingsPageView;
