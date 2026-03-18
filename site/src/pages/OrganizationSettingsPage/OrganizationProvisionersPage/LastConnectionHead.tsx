import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { InfoIcon } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export const LastConnectionHead: FC = () => {
	const { t } = useTranslation();

	return (
		<span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-content-secondary">
			{t("lastConnection")}
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="flex items-center">
						<span className="sr-only">{t("moreInfo")}</span>
						<InfoIcon
							tabIndex={0}
							className="cursor-pointer size-icon-xs p-0.5"
						/>
					</span>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs">
					{t("lastConnectionDescription")}
				</TooltipContent>
			</Tooltip>
		</span>
	);
};
