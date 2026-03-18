import { useTheme } from "@emotion/react";
import CircularProgress from "@mui/material/CircularProgress";
import type { GitSSHKey } from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Button } from "components/Button/Button";
import { CodeExample } from "components/CodeExample/CodeExample";
import { Stack } from "components/Stack/Stack";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

interface SSHKeysPageViewProps {
	isLoading: boolean;
	getSSHKeyError?: unknown;
	sshKey?: GitSSHKey;
	onRegenerateClick: () => void;
}

export const SSHKeysPageView: FC<SSHKeysPageViewProps> = ({
	isLoading,
	getSSHKeyError,
	sshKey,
	onRegenerateClick,
}) => {
	const { t } = useTranslation("userSettings");
	const theme = useTheme();

	if (isLoading) {
		return (
			<div css={{ padding: 32 }}>
				<CircularProgress size={26} />
			</div>
		);
	}

	return (
		<Stack>
			{/* Regenerating the key is not an option if getSSHKey fails.
        Only one of the error messages will exist at a single time */}
			{Boolean(getSSHKeyError) && <ErrorAlert error={getSSHKeyError} />}

			{sshKey && (
				<>
					<p
						css={{
							fontSize: 14,
							color: theme.palette.text.secondary,
							margin: 0,
						}}
					>
						{t("sshKeysDescription", { code: "$GIT_SSH_COMMAND" })}
					</p>
					<CodeExample secret={false} code={sshKey.public_key.trim()} />
					<div>
						<Button
							onClick={onRegenerateClick}
							data-testid="regenerate"
							variant="outline"
						>
							{t("sshKeysRegenerate")}
						</Button>
					</div>
				</>
			)}
		</Stack>
	);
};
