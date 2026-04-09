import type { FC } from "react";
import { pageTitle } from "utils/page";
import { QuotaSettingsPageView } from "./QuotaSettingsPageView";

const QuotaSettingsPage: FC = () => {
	return (
		<>
			<title>{pageTitle("Workspace Quotas")}</title>
			<QuotaSettingsPageView />
		</>
	);
};

export default QuotaSettingsPage;
