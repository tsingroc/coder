import { type FC, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getErrorMessage } from "api/errors";
import {
	templateQuotaDefaultsKey,
	getAllTemplateQuotaDefaults,
	setTemplateQuotaDefault,
	userQuotaOverridesKey,
	getAllUserQuotaOverrides,
	userTemplateQuotasKey,
	getUserTemplateQuotas,
	setUserTemplateQuota,
	resetUserTemplateQuota,
} from "api/queries/quotas";
import type * as TypesGen from "api/typesGenerated";
import type { User } from "api/typesGenerated";
import { AvatarData } from "components/Avatar/AvatarData";
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
import { UserAutocomplete } from "components/UserAutocomplete/UserAutocomplete";
import { Pencil, Save, RotateCcw, ChevronRight, Plus } from "lucide-react";
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

// Group overrides by user for table display.
type OverridesByUser = Record<
	string,
	{
		user: { id: string; username: string; email: string; avatar_url: string };
		overrides: TypesGen.UserQuotaOverride[];
	}
>;

const UserQuotasSection: FC = () => {
	const queryClient = useQueryClient();
	const [expandedUser, setExpandedUser] = useState<string | null>(null);
	const [editingQuota, setEditingQuota] = useState<string | null>(null);
	const [quotaValues, setQuotaValues] = useState<Record<string, number>>({});
	const [addingUser, setAddingUser] = useState<User | null>(null);

	// Fetch all user quota overrides
	const {
		data: overrides = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: userQuotaOverridesKey,
		queryFn: () => getAllUserQuotaOverrides(),
	});

	// Group overrides by user
	const grouped: OverridesByUser = useMemo(() => {
		const map: OverridesByUser = {};
		for (const o of overrides) {
			if (!map[o.user_id]) {
				map[o.user_id] = {
					user: {
						id: o.user_id,
						username: o.username,
						email: o.email ?? "",
						avatar_url: o.avatar_url ?? "",
					},
					overrides: [],
				};
			}
			map[o.user_id].overrides.push(o);
		}
		return map;
	}, [overrides]);

	// Fetch expanded user's full quotas (includes defaults + usage)
	const { data: expandedQuotas, isLoading: expandedLoading } = useQuery({
		queryKey: userTemplateQuotasKey(expandedUser ?? ""),
		queryFn: () => getUserTemplateQuotas(expandedUser!),
		enabled: !!expandedUser,
	});

	// Mutation: set user quota
	const { mutate: setUserQuotaMut, isPending: isSettingUser } = useMutation({
		mutationFn: ({
			userId,
			templateId,
			quota,
		}: {
			userId: string;
			templateId: string;
			quota: number;
		}) =>
			setUserTemplateQuota(userId, templateId, {
				workspace_quota: quota,
			}),
		onSuccess: () => {
			toast.success("User quota updated successfully");
			setEditingQuota(null);
			if (expandedUser) {
				void queryClient.invalidateQueries({
					queryKey: userTemplateQuotasKey(expandedUser),
				});
			}
			void queryClient.invalidateQueries({ queryKey: userQuotaOverridesKey });
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err, "Failed to update user quota."));
		},
	});

	// Mutation: reset user quota
	const { mutate: resetQuotaMut, isPending: isResetting } = useMutation({
		mutationFn: ({
			userId,
			templateId,
		}: {
			userId: string;
			templateId: string;
		}) => resetUserTemplateQuota(userId, templateId),
		onSuccess: () => {
			toast.success("User quota reset to default");
			if (expandedUser) {
				void queryClient.invalidateQueries({
					queryKey: userTemplateQuotasKey(expandedUser),
				});
			}
			void queryClient.invalidateQueries({ queryKey: userQuotaOverridesKey });
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err, "Failed to reset user quota."));
		},
	});

	// Handle adding a new user override: expand that user
	const handleAddUser = () => {
		if (addingUser) {
			setExpandedUser(addingUser.id);
			setAddingUser(null);
		}
	};

	const handleSaveQuota = (userId: string, templateId: string) => {
		const quota = quotaValues[templateId];
		if (quota && quota > 0) {
			setUserQuotaMut({ userId, templateId, quota });
		}
	};

	const userList = Object.values(grouped);

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">User Quota Overrides</h2>
			<p className="mb-4 text-sm text-content-secondary">
				View and manage per-user workspace quota overrides. Custom quotas take
				precedence over template defaults.
			</p>

			{/* Add user control */}
			<div className="mb-4 flex items-end gap-3">
				<div className="w-72">
					<UserAutocomplete
						value={addingUser}
						onChange={setAddingUser}
						label="Add user override"
					/>
				</div>
				<Button onClick={handleAddUser} disabled={!addingUser} size="sm">
					<Plus />
					Manage
				</Button>
			</div>

			{isLoading && <Loader />}

			{error && (
				<p className="text-sm text-content-destructive">
					Error loading user quotas:{" "}
					{getErrorMessage(error, "Failed to load user quotas.")}
				</p>
			)}

			{!isLoading && !error && (
				<Table aria-label="User quota overrides">
					<TableHeader>
						<TableRow>
							<TableHead className="w-1/3">User</TableHead>
							<TableHead className="w-1/6">Custom Overrides</TableHead>
							<TableHead className="w-1/6">Templates</TableHead>
							<TableHead className="w-auto" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{userList.length === 0 && (
							<TableRow>
								<TableCell colSpan={4}>
									<div className="py-8 text-center text-sm text-content-secondary">
										No user quota overrides configured. Use the search above to
										add one.
									</div>
								</TableCell>
							</TableRow>
						)}

						{userList.map(({ user, overrides: userOverrides }) => {
							const isExpanded = expandedUser === user.id;
							const templateNames = userOverrides
								.map((o) => o.template_display_name || o.template_name)
								.join(", ");

							return (
								<UserRowGroup
									key={user.id}
									user={user}
									templateNames={templateNames}
									overrideCount={userOverrides.length}
									isExpanded={isExpanded}
									onToggle={() => setExpandedUser(isExpanded ? null : user.id)}
									expandedQuotas={expandedQuotas}
									expandedLoading={expandedLoading}
									editingQuota={editingQuota}
									quotaValues={quotaValues}
									isSettingUser={isSettingUser}
									isResetting={isResetting}
									onEdit={(templateId: string, currentQuota: number) => {
										setEditingQuota(templateId);
										setQuotaValues({
											...quotaValues,
											[templateId]: currentQuota,
										});
									}}
									onCancelEdit={() => setEditingQuota(null)}
									onSave={(templateId: string) =>
										handleSaveQuota(user.id, templateId)
									}
									onReset={(templateId: string) =>
										resetQuotaMut({
											userId: user.id,
											templateId,
										})
									}
									onQuotaValueChange={(templateId: string, val: number) =>
										setQuotaValues({ ...quotaValues, [templateId]: val })
									}
								/>
							);
						})}
					</TableBody>
				</Table>
			)}
		</section>
	);
};

interface UserRowGroupProps {
	user: {
		id: string;
		username: string;
		email: string;
		avatar_url: string;
	};
	templateNames: string;
	overrideCount: number;
	isExpanded: boolean;
	onToggle: () => void;
	expandedQuotas?: TypesGen.UserTemplateQuotasResponse;
	expandedLoading: boolean;
	editingQuota: string | null;
	quotaValues: Record<string, number>;
	isSettingUser: boolean;
	isResetting: boolean;
	onEdit: (templateId: string, currentQuota: number) => void;
	onCancelEdit: () => void;
	onSave: (templateId: string) => void;
	onReset: (templateId: string) => void;
	onQuotaValueChange: (templateId: string, val: number) => void;
}

const UserRowGroup: FC<UserRowGroupProps> = ({
	user,
	templateNames,
	overrideCount,
	isExpanded,
	onToggle,
	expandedQuotas,
	expandedLoading,
	editingQuota,
	quotaValues,
	isSettingUser,
	isResetting,
	onEdit,
	onCancelEdit,
	onSave,
	onReset,
	onQuotaValueChange,
}) => {
	return (
		<>
			{/* Summary row */}
			<TableRow
				className="cursor-pointer hover:bg-surface-secondary"
				onClick={onToggle}
			>
				<TableCell>
					<AvatarData
						title={user.username}
						subtitle={user.email}
						src={user.avatar_url}
					/>
				</TableCell>
				<TableCell>{overrideCount}</TableCell>
				<TableCell>
					<span className="text-sm text-content-secondary truncate max-w-xs block">
						{templateNames || "—"}
					</span>
				</TableCell>
				<TableCell>
					<Button
						variant="subtle"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							onToggle();
						}}
					>
						<ChevronRight
							className={`h-4 w-4 transition-transform ${
								isExpanded ? "rotate-90" : ""
							}`}
						/>
					</Button>
				</TableCell>
			</TableRow>

			{/* Expanded detail rows */}
			{isExpanded && (
				<>
					{expandedLoading && (
						<TableRow>
							<TableCell colSpan={4}>
								<div className="flex justify-center py-4">
									<Loader />
								</div>
							</TableCell>
						</TableRow>
					)}

					{expandedQuotas &&
						expandedQuotas.quotas.map((q) => (
							<TableRow key={q.template_id}>
								<TableCell>
									<span className="ml-8 text-sm text-content-secondary">
										{q.template_id.slice(0, 8)}...
									</span>
								</TableCell>
								<TableCell>
									{editingQuota === q.template_id ? (
										<Input
											type="number"
											min={1}
											value={quotaValues[q.template_id] || q.quota}
											onChange={(e) =>
												onQuotaValueChange(
													q.template_id,
													Number.parseInt(e.target.value, 10) || 0,
												)
											}
											autoFocus
											className="w-24"
										/>
									) : (
										<span>
											{q.quota} / {q.default_quota}{" "}
											{q.is_custom ? "(custom)" : "(default)"}
										</span>
									)}
								</TableCell>
								<TableCell>{q.current_workspaces} workspaces</TableCell>
								<TableCell>
									<div className="flex gap-2">
										{editingQuota === q.template_id ? (
											<>
												<Button
													onClick={() => onSave(q.template_id)}
													disabled={isSettingUser}
													size="sm"
												>
													<Save />
													Save
												</Button>
												<Button
													onClick={onCancelEdit}
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
													onClick={() => onEdit(q.template_id, q.quota)}
													variant="outline"
													size="sm"
												>
													<Pencil />
													{q.is_custom ? "Edit" : "Override"}
												</Button>
												{q.is_custom && (
													<Button
														onClick={() => onReset(q.template_id)}
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
				</>
			)}
		</>
	);
};
