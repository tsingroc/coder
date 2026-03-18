import { useTheme } from "@emotion/react";
import IconButton from "@mui/material/IconButton";
import type { APIKeyWithOwner } from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { ChooseOne, Cond } from "components/Conditionals/ChooseOne";
import { Stack } from "components/Stack/Stack";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "components/Table/Table";
import { TableEmpty } from "components/TableEmpty/TableEmpty";
import { TableLoader } from "components/TableLoader/TableLoader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TrashIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const lastUsedOrNever = (lastUsed: string, t: any) => {
	const day = dayjs(lastUsed);
	const now = dayjs();
	return now.isBefore(day.add(100, "year")) ? day.fromNow() : t("tokensNever");
};

interface TokensPageViewProps {
	tokens?: APIKeyWithOwner[];
	getTokensError?: unknown;
	isLoading: boolean;
	hasLoaded: boolean;
	onDelete: (token: APIKeyWithOwner) => void;
	deleteTokenError?: unknown;
	children?: ReactNode;
}

export const TokensPageView: FC<TokensPageViewProps> = ({
	tokens,
	getTokensError,
	isLoading,
	hasLoaded,
	onDelete,
	deleteTokenError,
}) => {
	const { t } = useTranslation("userSettings");
	const theme = useTheme();

	return (
		<Stack>
			{Boolean(getTokensError) && <ErrorAlert error={getTokensError} />}
			{Boolean(deleteTokenError) && <ErrorAlert error={deleteTokenError} />}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-1/5">{t("tokensId")}</TableHead>
						<TableHead className="w-1/5">{t("tokensName")}</TableHead>
						<TableHead className="w-1/5">{t("tokensLastUsed")}</TableHead>
						<TableHead className="w-1/5">{t("tokensExpiresAt")}</TableHead>
						<TableHead className="w-1/5">{t("tokensCreatedAt")}</TableHead>
						<TableHead className="w-[1%]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					<ChooseOne>
						<Cond condition={isLoading}>
							<TableLoader />
						</Cond>
						<Cond condition={hasLoaded && (!tokens || tokens.length === 0)}>
							<TableEmpty message={t("tokensNoTokensFound")} />
						</Cond>
						<Cond>
							{tokens?.map((token) => {
								return (
									<TableRow
										key={token.id}
										data-testid={`token-${token.id}`}
										tabIndex={0}
									>
										<TableCell>
											<span style={{ color: theme.palette.text.secondary }}>
												{token.id}
											</span>
										</TableCell>

										<TableCell>
											<span style={{ color: theme.palette.text.secondary }}>
												{token.token_name}
											</span>
										</TableCell>

										<TableCell>{lastUsedOrNever(token.last_used, t)}</TableCell>

										<TableCell>
											<span
												style={{ color: theme.palette.text.secondary }}
												data-chromatic="ignore"
											>
												{dayjs(token.expires_at).fromNow()}
											</span>
										</TableCell>

										<TableCell>
											<span style={{ color: theme.palette.text.secondary }}>
												{dayjs(token.created_at).fromNow()}
											</span>
										</TableCell>

										<TableCell>
											<span style={{ color: theme.palette.text.secondary }}>
												<IconButton
													onClick={() => {
														onDelete(token);
													}}
													size="medium"
													aria-label={t("tokensDelete")}
												>
													<TrashIcon className="size-icon-sm" />
												</IconButton>
											</span>
										</TableCell>
									</TableRow>
								);
							})}
						</Cond>
					</ChooseOne>
				</TableBody>
			</Table>
		</Stack>
	);
};
