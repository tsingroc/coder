import { Button } from "components/Button/Button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { Volume2Icon, VolumeOffIcon } from "lucide-react";
import { type FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { getChimeEnabled, setChimeEnabled } from "./AgentDetail/useAgentChime";

export const ChimeButton: FC = () => {
	const { t } = useTranslation("agents");
	const tc = t as (key: string) => string;
	const [enabled, setEnabled] = useState(getChimeEnabled);

	const handleClick = () => {
		const next = !enabled;
		setEnabled(next);
		setChimeEnabled(next);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="subtle"
					size="icon"
					onClick={handleClick}
					aria-label={
						enabled ? tc("create.muteCompletionChime") : tc("create.enableCompletionChime")
					}
					className="h-7 w-7 text-content-secondary hover:text-content-primary"
				>
					{enabled ? (
						<Volume2Icon className="text-content-success" />
					) : (
						<VolumeOffIcon className="text-content-secondary" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				{enabled ? tc("create.disableCompletionSound") : tc("create.enableCompletionSound")}
			</TooltipContent>
		</Tooltip>
	);
};
