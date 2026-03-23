import { Alert } from "components/Alert/Alert";
import { Link } from "components/Link/Link";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { docs } from "utils/docs";

interface ClassicParameterFlowDeprecationWarningProps {
	templateSettingsLink: string;
	isEnabled: boolean;
}

export const ClassicParameterFlowDeprecationWarning: FC<
	ClassicParameterFlowDeprecationWarningProps
> = ({ templateSettingsLink, isEnabled }) => {
	const { t } = useTranslation("workspaceDetail");

	if (!isEnabled) {
		return null;
	}

	return (
		<Alert severity="warning" className="mb-2" prominent>
			<div>
				{t("classicParameterFlowDeprecationWarning.message")}
				<strong>deprecated</strong>
				{t("classicParameterFlowDeprecationWarning.messageEnd")}
				<a
					href={docs("/admin/templates/extending-templates/dynamic-parameters")}
					className="text-content-link"
				>
					{t("classicParameterFlowDeprecationWarning.dynamicParameters")}
				</a>
			</div>

			<Link className="text-xs" href={templateSettingsLink}>
				{t("classicParameterFlowDeprecationWarning.goToTemplateSettings")}
			</Link>
		</Alert>
	);
};
