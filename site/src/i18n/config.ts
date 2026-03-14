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
import enTemplates from "./locales/en/templates.json";
import enTemplateDetail from "./locales/en/templateDetail.json";
import enUsers from "./locales/en/users.json";
import enNotFound from "./locales/en/notFound.json";
import enTerminal from "./locales/en/terminal.json";
import enTasks from "./locales/en/tasks.json";
import enCliInstall from "./locales/en/cliInstall.json";
import enOrgSettings from "./locales/en/orgSettings.json";
import enHealth from "./locales/en/health.json";

import zhCommon from "./locales/zh-CN/common.json";
import zhLogin from "./locales/zh-CN/login.json";
import zhWorkspace from "./locales/zh-CN/workspace.json";
import zhCreateWorkspace from "./locales/zh-CN/createWorkspace.json";
import zhWorkspaceDetail from "./locales/zh-CN/workspaceDetail.json";
import zhUserSettings from "./locales/zh-CN/userSettings.json";
import zhTemplates from "./locales/zh-CN/templates.json";
import zhTemplateDetail from "./locales/zh-CN/templateDetail.json";
import zhUsers from "./locales/zh-CN/users.json";
import zhNotFound from "./locales/zh-CN/notFound.json";
import zhTerminal from "./locales/zh-CN/terminal.json";
import zhTasks from "./locales/zh-CN/tasks.json";
import zhCliInstall from "./locales/zh-CN/cliInstall.json";
import zhOrgSettings from "./locales/zh-CN/orgSettings.json";
import zhHealth from "./locales/zh-CN/health.json";

// Translation resources
const resources = {
	en: {
		common: enCommon,
		login: enLogin,
		workspace: enWorkspace,
		createWorkspace: enCreateWorkspace,
		workspaceDetail: enWorkspaceDetail,
		userSettings: enUserSettings,
		templates: enTemplates,
		templateDetail: enTemplateDetail,
		users: enUsers,
		notFound: enNotFound,
		terminal: enTerminal,
		tasks: enTasks,
		cliInstall: enCliInstall,
		orgSettings: enOrgSettings,
		health: enHealth,
	},
	"zh-CN": {
		common: zhCommon,
		login: zhLogin,
		workspace: zhWorkspace,
		createWorkspace: zhCreateWorkspace,
		workspaceDetail: zhWorkspaceDetail,
		userSettings: zhUserSettings,
		templates: zhTemplates,
		templateDetail: zhTemplateDetail,
		users: zhUsers,
		notFound: zhNotFound,
		terminal: zhTerminal,
		tasks: zhTasks,
		cliInstall: zhCliInstall,
		orgSettings: zhOrgSettings,
		health: zhHealth,
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
