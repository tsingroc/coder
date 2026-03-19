import type * as TypesGen from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Avatar } from "components/Avatar/Avatar";
import { Button } from "components/Button/Button";
import { Stack } from "components/Stack/Stack";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "components/Table/Table";
import { TableLoader } from "components/TableLoader/TableLoader";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

type OAuth2ProviderPageViewProps = {
	isLoading: boolean;
	error: unknown;
	apps?: TypesGen.OAuth2ProviderApp[];
	revoke: (app: TypesGen.OAuth2ProviderApp) => void;
};

const OAuth2ProviderPageView: FC<OAuth2ProviderPageViewProps> = ({
	isLoading,
	error,
	apps,
	revoke,
}) => {
	const { t } = useTranslation("userSettings");

	return (
		<>
			{error && <ErrorAlert error={error} />}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t("oauth2Name")}</TableHead>
						<TableHead className="w-[1%]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && <TableLoader />}
					{apps?.map((app) => (
						<OAuth2AppRow key={app.id} app={app} revoke={revoke} />
					))}
					{apps?.length === 0 && (
						<TableRow>
							<TableCell colSpan={999}>
								<div css={{ textAlign: "center" }}>{t("oauth2NoApps")}</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
};

type OAuth2AppRowProps = {
	app: TypesGen.OAuth2ProviderApp;
	revoke: (app: TypesGen.OAuth2ProviderApp) => void;
};

const OAuth2AppRow: FC<OAuth2AppRowProps> = ({ app, revoke }) => {
	const { t } = useTranslation("userSettings");

	return (
		<TableRow key={app.id} data-testid={`app-${app.id}`}>
			<TableCell>
				<Stack direction="row" spacing={1} alignItems="center">
					<Avatar variant="icon" src={app.icon} fallback={app.name} />
					<span className="font-semibold">{app.name}</span>
				</Stack>
			</TableCell>

			<TableCell>
				<Button size="sm" variant="destructive" onClick={() => revoke(app)}>
					{t("oauth2Revoke")}
				</Button>
			</TableCell>
		</TableRow>
	);
};

export default OAuth2ProviderPageView;
