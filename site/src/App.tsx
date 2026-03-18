import "./theme/globalFonts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "components/Tooltip/Tooltip";
import {
	type FC,
	type ReactNode,
	StrictMode,
	useEffect,
	useState,
} from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { RouterProvider } from "react-router";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "./components/Toaster/Toaster";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { DiffsWorkerPoolProvider } from "./contexts/DiffsWorkerPoolProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { router } from "./router";
import "./i18n/config"; // Initialize i18n
import i18n from "./i18n/config";

const defaultQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
		},
	},
});

interface AppProvidersProps {
	children: ReactNode;
	queryClient?: QueryClient;
}

export const AppProviders: FC<AppProvidersProps> = ({
	children,
	queryClient = defaultQueryClient,
}) => {
	// https://tanstack.com/query/v4/docs/react/devtools
	const [showDevtools, setShowDevtools] = useState(false);

	useEffect(() => {
		// Don't want to throw away the previous devtools value if some other
		// extension added something already
		const devtoolsBeforeSync = window.toggleDevtools;
		window.toggleDevtools = () => {
			devtoolsBeforeSync?.();
			setShowDevtools((current) => !current);
		};

		return () => {
			window.toggleDevtools = devtoolsBeforeSync;
		};
	}, []);

	return (
		<I18nextProvider i18n={i18n}>
			<QueryClientProvider client={queryClient}>
				<DiffsWorkerPoolProvider>
					<AuthProvider>
						<ThemeProvider>
							<TooltipProvider delayDuration={100}>
								{children}
								<Toaster />
							</TooltipProvider>
						</ThemeProvider>
					</AuthProvider>
				</DiffsWorkerPoolProvider>
				{showDevtools && <ReactQueryDevtools initialIsOpen={showDevtools} />}
			</QueryClientProvider>
		</I18nextProvider>
	);
};

export const App: FC = () => {
	return (
		<StrictMode>
			<AppProviders>
				{/* If you're wondering where the global error boundary is,
				    it's connected to the router */}
				<RouterProvider router={router} />
			</AppProviders>
		</StrictMode>
	);
};
