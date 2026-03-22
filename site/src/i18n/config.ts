import dayjs from "dayjs";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";

// Load dayjs relativeTime plugin
dayjs.extend(relativeTime);

import enAgents from "./locales/en/agents.json";
import enCliInstall from "./locales/en/cliInstall.json";
// Import translations
import enCommon from "./locales/en/common.json";
import enCreateWorkspace from "./locales/en/createWorkspace.json";
import enHealth from "./locales/en/health.json";
import enLogin from "./locales/en/login.json";
import enNotFound from "./locales/en/notFound.json";
import enOrgSettings from "./locales/en/orgSettings.json";
import enTasks from "./locales/en/tasks.json";
import enTemplateDetail from "./locales/en/templateDetail.json";
import enTemplates from "./locales/en/templates.json";
import enTerminal from "./locales/en/terminal.json";
import enUserSettings from "./locales/en/userSettings.json";
import enUsers from "./locales/en/users.json";
import enWorkspace from "./locales/en/workspace.json";
import enWorkspaceDetail from "./locales/en/workspaceDetail.json";
import enWorkspaceSettings from "./locales/en/workspaceSettings.json";
import zhAgents from "./locales/zh-CN/agents.json";
import zhCliInstall from "./locales/zh-CN/cliInstall.json";
import zhCommon from "./locales/zh-CN/common.json";
import zhCreateWorkspace from "./locales/zh-CN/createWorkspace.json";
import zhHealth from "./locales/zh-CN/health.json";
import zhLogin from "./locales/zh-CN/login.json";
import zhNotFound from "./locales/zh-CN/notFound.json";
import zhOrgSettings from "./locales/zh-CN/orgSettings.json";
import zhTasks from "./locales/zh-CN/tasks.json";
import zhTemplateDetail from "./locales/zh-CN/templateDetail.json";
import zhTemplates from "./locales/zh-CN/templates.json";
import zhTerminal from "./locales/zh-CN/terminal.json";
import zhUserSettings from "./locales/zh-CN/userSettings.json";
import zhUsers from "./locales/zh-CN/users.json";
import zhWorkspace from "./locales/zh-CN/workspace.json";
import zhWorkspaceDetail from "./locales/zh-CN/workspaceDetail.json";
import zhWorkspaceSettings from "./locales/zh-CN/workspaceSettings.json";

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
		agents: enAgents,
		cliInstall: enCliInstall,
		orgSettings: enOrgSettings,
		health: enHealth,
		workspaceSettings: enWorkspaceSettings,
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
		agents: zhAgents,
		cliInstall: zhCliInstall,
		orgSettings: zhOrgSettings,
		health: zhHealth,
		workspaceSettings: zhWorkspaceSettings,
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

// Configure dayjs locale based on i18n language
const updateDayjsLocale = (lng: string) => {
	if (lng === "zh-CN") {
		dayjs.locale("zh-cn");
	} else {
		dayjs.locale("en");
	}
};

// Set initial locale
updateDayjsLocale(i18n.language);

// Update dayjs locale when i18n language changes
i18n.on("languageChanged", (lng) => {
	updateDayjsLocale(lng);
});

export default i18n;
