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
				confirm: string;
				close: string;
				back: string;
				next: string;
				submit: string;
				required: string;
				or: string;
				errorPage: {
					title: string;
					description: string;
					discordCommunity: string;
					openIssue: string;
					linkOpensNewTab: string;
					reloadPage: string;
					showError: string;
					hideError: string;
				};
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
			templates: {
				// Templates page translations
				title: string;
				emptyState: {
					title: string;
					description: string;
				};
				table: {
					name: string;
					buildTime: string;
					usedBy: string;
					lastUpdated: string;
					actions: string;
				};
				tooltip: {
					title: string;
					text: string;
					link: string;
				};
				buttons: {
					createTemplate: string;
					useTemplate: string;
					viewDocs: string;
				};
				developerCount: string;
			};
			templateDetail: {
				// Template detail page translations
				title: string;
				sections: {
					docs: string;
					files: string;
					resources: string;
					versions: string;
					prebuilds: string;
					insights: string;
					permissions: string;
					schedule: string;
					variables: string;
				};
				actions: {
					edit: string;
					useTemplate: string;
					delete: string;
					updateVersion: string;
					buildLogs: string;
				};
				info: {
					name: string;
					version: string;
					lastUsed: string;
					activeDevelopers: string;
					buildTime: string;
				};
				emptyStates: {
					noVersions: string;
					noPrebuilds: string;
				};
			};
			users: {
				// Users page translations
				title: string;
				titlePlural: string;
				table: {
					username: string;
					email: string;
					status: string;
					roles: string;
					actions: string;
				};
				status: {
					active: string;
					suspended: string;
				};
				buttons: {
					addUser: string;
					resetPassword: string;
					suspend: string;
					activate: string;
					editRoles: string;
				};
				emptyState: {
					title: string;
					createFirst: string;
				};
				roles: {
					owner: string;
					admin: string;
					user: string;
					member: string;
				};
				resetPassword: {
					title: string;
					message: string;
					confirmText: string;
				};
			};
			notFound: {
				// 404 page translations
				title: string;
				message: string;
				goBack: string;
				goHome: string;
			};
			terminal: {
				// Terminal page translations
				title: string;
				connecting: string;
				connected: string;
				disconnected: string;
				reconnect: string;
				resize: string;
				download: string;
				alerts: {
					connectionFailed: string;
					disconnectedTitle: string;
					disconnectedMessage: string;
				};
				buttons: {
					reconnect: string;
					close: string;
				};
			};
			tasks: {
				// Tasks page translations
				title: string;
				titlePlural: string;
				table: {
					name: string;
					status: string;
					createdBy: string;
					createdAt: string;
					actions: string;
				};
				status: {
					pending: string;
					running: string;
					succeeded: string;
					failed: string;
					cancelled: string;
				};
				buttons: {
					createTask: string;
					viewDetails: string;
					cancel: string;
					retry: string;
				};
				emptyState: {
					title: string;
					description: string;
				};
			};
			cliInstall: {
				// CLI install page translations
				title: string;
				subtitle: string;
				sections: {
					install: {
						title: string;
						description: string;
					};
					authenticate: {
						title: string;
						description: string;
						sessionToken: string;
						sessionTokenDescription: string;
					};
					verify: {
						title: string;
						description: string;
						successMessage: string;
					};
				};
				osTabs: {
					linux: string;
					macOS: string;
					windows: string;
				};
			};
			orgSettings: {
				// Organization settings page translations
				title: string;
				sections: {
					general: string;
					members: string;
					provisioners: string;
					provisionerJobs: string;
					provisionerKeys: string;
					roles: string;
					idpSync: string;
				};
				actions: {
					addMember: string;
					createRole: string;
					viewAuditLog: string;
				};
				emptyStates: {
					noMembers: string;
					noRoles: string;
				};
			};
			health: {
				// Health page translations
				title: string;
				sections: {
					overview: string;
					derp: string;
					database: string;
					provisionerDaemons: string;
					workspaceProxy: string;
					accessURL: string;
					websocket: string;
				};
				status: {
					healthy: string;
					unhealthy: string;
					disabled: string;
					initializing: string;
				};
			};
		};
	}
}
