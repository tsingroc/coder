import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enCommon from "./locales/en/common.json";
import enLogin from "./locales/en/login.json";
import enWorkspace from "./locales/en/workspace.json";
import enCreateWorkspace from "./locales/en/createWorkspace.json";
import enWorkspaceDetail from "./locales/en/workspaceDetail.json";
import enUserSettings from "./locales/en/userSettings.json";

import zhCommon from "./locales/zh-CN/common.json";
import zhLogin from "./locales/zh-CN/login.json";
import zhWorkspace from "./locales/zh-CN/workspace.json";
import zhCreateWorkspace from "./locales/zh-CN/createWorkspace.json";
import zhWorkspaceDetail from "./locales/zh-CN/workspaceDetail.json";
import zhUserSettings from "./locales/zh-CN/userSettings.json";

// Translation resources
const resources = {
	en: {
		common: enCommon,
		login: enLogin,
		workspace: enWorkspace,
		createWorkspace: enCreateWorkspace,
		workspaceDetail: enWorkspaceDetail,
		userSettings: enUserSettings,
	},
	"zh-CN": {
		common: zhCommon,
		login: zhLogin,
		workspace: zhWorkspace,
		createWorkspace: zhCreateWorkspace,
		workspaceDetail: zhWorkspaceDetail,
		userSettings: zhUserSettings,
	},
};

// Initialize i18next
void i18n
	.use(LanguageDetector) // Detect user language
	.use(initReactI18next) // Pass i18n instance to react-i18next
	.init({
		resources,

		// Default namespace
		defaultNS: "common",

		// Default language
		lng: "zh-CN", // Default to Chinese
		fallbackLng: "en", // Fall back to English if translation missing

		// Debug mode (disable in production)
		debug: import.meta.env.DEV,

		// Interpolation settings
		interpolation: {
			escapeValue: false, // React already escapes by default
		},

		// React settings
		react: {
			useSuspense: false, // Disable suspense to avoid loading states
		},
	});

export default i18n;
