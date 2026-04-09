import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getErrorMessage } from "api/errors";
import {
	templateQuotaDefaultsKey,
	getAllTemplateQuotaDefaults,
	setTemplateQuotaDefault,
	userTemplateQuotasKey,
	getUserTemplateQuotas,
	setUserTemplateQuota,
	resetUserTemplateQuota,
} from "api/queries/quotas";
import type { User } from "api/typesGenerated";
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
import { Badge } from "components/Badge/Badge";
import { UserAutocomplete } from "components/UserAutocomplete/UserAutocomplete";
import { Pencil, Save, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";

export const QuotaSettingsPageView: FC = () => {
	return (
		<Stack direction="column" spacing={8}>
			<SettingsHeader>
				<SettingsHeaderTitle>Workspace Quotas</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					Manage workspace quotas for templates and users
				</SettingsHeaderDescription>
			</SettingsHeader>

			<TemplateDefaultsSection />
			<UserQuotasSection />
		</Stack>
	);
};

const TemplateDefaultsSection: FC = () => {
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
			toast.success("Default quota updated successfully");
			setEditingQuota(null);
			void queryClient.invalidateQueries({
				queryKey: templateQuotaDefaultsKey(),
			});
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

	if (quotasLoading) {
		return <Loader />;
	}

	if (quotasError) {
		return (
			<p>
				Error loading quotas:{" "}
				{getErrorMessage(quotasError, "Failed to load quotas.")}
			</p>
		);
	}

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Template Default Quotas</h2>
			<p className="mb-4 text-sm text-content-secondary">
				Set the default workspace quota for each template. Users without a
				custom override will use these defaults.
			</p>
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
										value={quotaValues[q.template_id] || q.default_quota}
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
											size="sm"
										>
											<Save />
											Save
										</Button>
										<Button
											onClick={() => setEditingQuota(null)}
											disabled={isSetting}
											variant="outline"
											size="sm"
										>
											Cancel
										</Button>
									</div>
								) : (
									<Button
										onClick={() => {
											setEditingQuota(q.template_id);
											setQuotaValues({
												...quotaValues,
												[q.template_id]: q.default_quota,
											});
										}}
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
		</section>
	);
};

const UserQuotasSection: FC = () => {
	const queryClient = useQueryClient();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editingQuota, setEditingQuota] = useState<string | null>(null);
	const [quotaValues, setQuotaValues] = useState<Record<string, number>>({});

	const {
		data: userQuotas,
		isLoading: userQuotasLoading,
		error: userQuotasError,
	} = useQuery({
		queryKey: userTemplateQuotasKey(selectedUser?.id ?? ""),
		queryFn: () => getUserTemplateQuotas(selectedUser!.id),
		enabled: !!selectedUser,
	});

	const { mutate: setUserQuotaMut, isPending: isSettingUser } = useMutation({
		mutationFn: ({
			templateId,
			quota,
		}: {
			templateId: string;
			quota: number;
		}) =>
			setUserTemplateQuota(selectedUser!.id, templateId, {
				workspace_quota: quota,
			}),
		onSuccess: () => {
			toast.success("User quota updated successfully");
			setEditingQuota(null);
			void queryClient.invalidateQueries({
				queryKey: userTemplateQuotasKey(selectedUser!.id),
			});
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Failed to update user quota."));
		},
	});

	const { mutate: resetQuotaMut, isPending: isResetting } = useMutation({
		mutationFn: (templateId: string) =>
			resetUserTemplateQuota(selectedUser!.id, templateId),
		onSuccess: () => {
			toast.success("User quota reset to default");
			void queryClient.invalidateQueries({
				queryKey: userTemplateQuotasKey(selectedUser!.id),
			});
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Failed to reset user quota."));
		},
	});

	const handleSaveUserQuota = (templateId: string) => {
		const quota = quotaValues[templateId];
		if (quota && quota > 0) {
			setUserQuotaMut({ templateId, quota });
		}
	};

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">
				<Users className="mb-0.5 mr-1.5 inline-block h-5 w-5" />
				User Quota Overrides
			</h2>
			<p className="mb-4 text-sm text-content-secondary">
				Search for a user to view and override their per-template workspace
				quotas. Custom quotas take precedence over template defaults.
			</p>

			<div className="mb-4 max-w-md">
				<UserAutocomplete
					value={selectedUser}
					onChange={setSelectedUser}
					label="Select user"
				/>
			</div>

			{selectedUser && userQuotasLoading && <Loader />}

			{selectedUser && userQuotasError && (
				<p className="text-sm text-content-destructive">
					Error loading user quotas:{" "}
					{getErrorMessage(userQuotasError, "Failed to load user quotas.")}
				</p>
			)}

			{selectedUser && userQuotas && (
				<>
					{userQuotas.quotas.length === 0 ? (
						<div className="rounded-lg border border-border bg-surface-secondary px-4 py-6 text-center text-sm text-content-secondary">
							No quotas configured for any template yet.
						</div>
					) : (
						<Table aria-label={`Quotas for user ${selectedUser.username}`}>
							<TableHeader>
								<TableRow>
									<TableHead>Template ID</TableHead>
									<TableHead>Current Workspaces</TableHead>
									<TableHead>Quota</TableHead>
									<TableHead>Source</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{userQuotas.quotas.map((q) => (
									<TableRow key={q.template_id}>
										<TableCell>
											<code className="text-xs">{q.template_id}</code>
										</TableCell>
										<TableCell>{q.current_workspaces}</TableCell>
										<TableCell>
											{editingQuota === q.template_id ? (
												<Input
													type="number"
													min={1}
													value={quotaValues[q.template_id] || q.quota}
													onChange={(e) =>
														setQuotaValues({
															...quotaValues,
															[q.template_id]:
																Number.parseInt(e.target.value, 10) || 0,
														})
													}
													autoFocus
													className="w-24"
												/>
											) : (
												<span>{q.quota} workspaces</span>
											)}
										</TableCell>
										<TableCell>
											{q.is_custom ? (
												<Badge variant="purple">Custom</Badge>
											) : (
												<Badge >Default</Badge>
											)}
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												{editingQuota === q.template_id ? (
													<>
														<Button
															onClick={() => handleSaveUserQuota(q.template_id)}
															disabled={isSettingUser}
															size="sm"
														>
															<Save />
															Save
														</Button>
														<Button
															onClick={() => setEditingQuota(null)}
															disabled={isSettingUser}
															variant="outline"
															size="sm"
														>
															Cancel
														</Button>
													</>
												) : (
													<>
														<Button
															onClick={() => {
																setEditingQuota(q.template_id);
																setQuotaValues({
																	...quotaValues,
																	[q.template_id]: q.quota,
																});
															}}
															variant="outline"
															size="sm"
														>
															<Pencil />
															{q.is_custom ? "Edit" : "Override"}
														</Button>
														{q.is_custom && (
															<Button
																onClick={() => resetQuotaMut(q.template_id)}
																disabled={isResetting}
																variant="outline"
																size="sm"
															>
																<RotateCcw />
																Reset
															</Button>
														)}
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</>
			)}

			{selectedUser && userQuotas && userQuotas.quotas.length > 0 && (
				<p className="mt-3 text-xs text-content-secondary">
					Use Override to set a custom quota for this user.
					Custom overrides take precedence over template defaults.
				</p>
			)}
		</section>
	);
};
