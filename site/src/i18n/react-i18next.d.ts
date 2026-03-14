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
				yes: string;
				no: string;
				search: string;
				filter: string;
				sort: string;
				refresh: string;
				download: string;
				upload: string;
				copy: string;
				paste: string;
				clear: string;
				reset: string;
				apply: string;
				view: string;
				hide: string;
				show: string;
				enable: string;
				disable: string;
				active: string;
				inactive: string;
				enabled: string;
				disabled: string;
				open: string;
				closed: string;
				public: string;
				private: string;
				name: string;
				description: string;
				status: string;
				actions: string;
				details: string;
				settings: string;
				help: string;
				about: string;
				documentation: string;
				support: string;
				version: string;
				build: string;
				updated: string;
				created: string;
				never: string;
				all: string;
				none: string;
				other: string;
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
				welcome: string;
				welcomeBack: string;
				signInTitle: string;
				emailLabel: string;
				passwordLabel: string;
				emailInvalid: string;
				emailRequired: string;
				passwordRequired: string;
				passwordSignIn: string;
				githubSignIn: string;
				oidcSignIn: string;
				forgotPassword: string;
				resetPassword: string;
				rememberMe: string;
				noAccount: string;
				signUp: string;
				loginError: string;
				loginSuccess: string;
				logout: string;
				logoutConfirm: string;
				loading: string;
				backToHome: string;
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
				template: {
					title: string;
					description: string;
					selectTemplate: string;
					noTemplates: string;
					templateDetails: string;
					version: string;
					activeDevelopers: string;
					buildTime: string;
				};
				parameters: {
					title: string;
					description: string;
					required: string;
					optional: string;
					defaultValue: string;
					noParameters: string;
				};
				validation: {
					nameRequired: string;
					nameInvalid: string;
					nameExists: string;
					templateRequired: string;
					parameterRequired: string;
					parameterInvalid: string;
				};
				actions: {
					creating: string;
					created: string;
					createFailed: string;
					checkingName: string;
				};
				options: {
					autoStart: string;
					autoStartDescription: string;
					ttl: string;
					ttlDescription: string;
					ttlDisabled: string;
					ttlHours: string;
				};
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
				status: {
					title: string;
					starting: string;
					running: string;
					stopping: string;
					stopped: string;
					error: string;
					pending: string;
					canceling: string;
					canceled: string;
					deleting: string;
					deleting_date: string;
				};
				resources: {
					title: string;
					cpu: string;
					memory: string;
					disk: string;
					network: string;
					uptime: string;
					lastUsed: string;
				};
				actions: {
					start: string;
					stop: string;
					restart: string;
					update: string;
					delete: string;
					openSSH: string;
					openVSCode: string;
					openBrowser: string;
					viewLogs: string;
					viewHistory: string;
					viewTemplates: string;
					settings: string;
				};
				applications: {
					title: string;
					noApplications: string;
					loading: string;
					port: string;
					access: string;
					health: string;
					healthy: string;
					unhealthy: string;
					starting: string;
					openApp: string;
				};
				timeline: {
					title: string;
					created: string;
					started: string;
					stopped: string;
					deleted: string;
					updated: string;
					noEvents: string;
				};
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
				sshKeys: {
					title: string;
					description: string;
					addKey: string;
					noKeys: string;
					keyName: string;
					publicKey: string;
					addedAt: string;
					actions: string;
					delete: string;
					copyKey: string;
				};
				tokens: {
					title: string;
					description: string;
					addToken: string;
					noTokens: string;
					tokenName: string;
					lastUsed: string;
					expiresAt: string;
					actions: string;
					delete: string;
					never: string;
				};
				appearance: {
					title: string;
					description: string;
					theme: string;
					themeDark: string;
					themeLight: string;
					themeSystem: string;
					language: string;
					fontFamily: string;
					homePage: string;
				};
				notifications: {
					title: string;
					description: string;
					emailNotifications: string;
					desktopNotifications: string;
					workspaceNotifications: string;
					mentions: string;
					replies: string;
					systemUpdates: string;
				};
				security: {
					title: string;
					description: string;
					twoFactor: string;
					enableTwoFactor: string;
					disableTwoFactor: string;
					sessions: string;
					revokeSession: string;
					loginHistory: string;
				};
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
					clone: string;
					export: string;
					share: string;
				};
				info: {
					name: string;
					version: string;
					lastUsed: string;
					activeDevelopers: string;
					buildTime: string;
					createdBy: string;
					createdAt: string;
					updatedBy: string;
					updatedAt: string;
					description: string;
					icon: string;
				};
				emptyStates: {
					noVersions: string;
					noPrebuilds: string;
					noFiles: string;
					noResources: string;
					noPermissions: string;
				};
				versions: {
					title: string;
					createVersion: string;
					currentVersion: string;
					stable: string;
					deprecated: string;
					createdAt: string;
					createdBy: string;
					message: string;
					noVersions: string;
				};
				resources: {
					title: string;
					type: string;
					name: string;
					count: string;
					addResource: string;
					noResources: string;
				};
				permissions: {
					title: string;
					user: string;
					group: string;
					role: string;
					actions: string;
					addPermission: string;
					allUsers: string;
					noPermissions: string;
				};
				prebuilds: {
					title: string;
					description: string;
					enabled: string;
					disabled: string;
					lastBuild: string;
					status: string;
					success: string;
					failed: string;
					pending: string;
					running: string;
					createPrebuild: string;
					noPrebuilds: string;
				};
				variables: {
					title: string;
					description: string;
					name: string;
					type: string;
					value: string;
					required: string;
					addVariable: string;
					noVariables: string;
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
