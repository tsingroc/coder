import "i18next";
import "react-i18next";

// Extend i18next to add custom typing for translation resources
declare module "i18next" {
	interface CustomTypeOptions {
		// Default namespace
		defaultNS: "common";
		// Available namespaces
		resources: {
			common: {
				// Common translations
				cancel: string;
				save: string;
				delete: string;
				edit: string;
				create: string;
				loading: string;
				error: string;
				success: string;
			};
			login: {
				// Login page translations
				emailLabel: string;
				passwordLabel: string;
				emailInvalid: string;
				emailRequired: string;
				passwordRequired: string;
				passwordSignIn: string;
				githubSignIn: string;
				oidcSignIn: string;
			};
			workspace: {
				// Workspace page translations
				pageTitle: string;
				yourWorkspacesButton: string;
				allWorkspacesButton: string;
				runningWorkspacesButton: string;
				seeAllTemplates: string;
				template: string;
				newWorkspace: string;
				bulkActions: string;
				start: string;
				stop: string;
				update: string;
				delete: string;
				pageNotFound: string;
				pageNotFoundDescription: string;
				backToFirstPage: string;
				workspace: string;
				workspaces: string;
			};
			createWorkspace: {
				// Create workspace page translations
				title: string;
				newWorkspace: string;
				general: string;
				adminOnlyMessage: string;
				userMessage: string;
				workspaceName: string;
				versionId: string;
				versionPreset: string;
				owner: string;
				needSuggestion: string;
				externalAuth: string;
				externalAuthDescription: string;
				externalAuthError: string;
				cancel: string;
				create: string;
				back: string;
				viewSource: string;
				viewDocs: string;
				selectPreset: string;
				duplicateWarning: string;
				dynamicParametersTooltip: string;
				createWorkspaceForm: string;
			};
			workspaceDetail: {
				// Workspace detail page translations
				title: string;
				backToWorkspaces: string;
				owner: string;
				organization: string;
				version: string;
				copyWorkspaceName: string;
				dailyUsage: string;
				creditsOf: string;
				seeAffectedWorkspaces: string;
				seeAffectedWorkspacesFor: string;
				deletionOn: string;
				deletionSoon: string;
				scheduleSettings: string;
				restartWorkspace: string;
				restartConfirm: string;
				restartDescription: string;
				failedToBuild: string;
				pleaseTryRefreshing: string;
				unableToProcessData: string;
				unableToGetChanges: string;
				connectionClosed: string;
				errorActivating: string;
			};
			userSettings: {
				// User settings page translations
				title: string;
				account: string;
				accountDescription: string;
				appearance: string;
				externalAuth: string;
				oauth2Apps: string;
				schedule: string;
				security: string;
				securityDescription: string;
				sshKeys: string;
				tokens: string;
				notifications: string;
				email: string;
				username: string;
				fullName: string;
				updateProfile: string;
				changePassword: string;
				oldPassword: string;
				newPassword: string;
				confirmPassword: string;
				passwordUpdated: string;
			};
		};
	}
}
