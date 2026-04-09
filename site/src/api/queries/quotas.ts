import { API } from "api/api";

export const templateQuotaDefaultsKey = (templateId?: string) => [
	"templateQuotaDefaults",
	templateId,
];

export const getAllTemplateQuotaDefaults = () => {
	return API.getAllTemplateQuotaDefaults();
};

export const setTemplateQuotaDefault = (
	templateId: string,
	data: { default_quota: number },
) => {
	return API.setTemplateQuotaDefault(templateId, data);
};

export const userTemplateQuotasKey = (userId: string) => [
	"users",
	userId,
	"quotas",
	"templates",
];

export const getUserTemplateQuotas = (userId: string) => {
	return API.getUserTemplateQuotas(userId);
};

export const setUserTemplateQuota = (
	userId: string,
	templateId: string,
	data: { workspace_quota: number },
) => {
	return API.setUserTemplateQuota(userId, templateId, data);
};

export const resetUserTemplateQuota = (userId: string, templateId: string) => {
	return API.resetUserTemplateQuota(userId, templateId);
};
