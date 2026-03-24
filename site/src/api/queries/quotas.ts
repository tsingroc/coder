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
