import Link from "@mui/material/Link";
import type { TemplateExample } from "api/typesGenerated";
import { Button } from "components/Button/Button";
import { CodeExample } from "components/CodeExample/CodeExample";
import { Stack } from "components/Stack/Stack";
import { TableEmpty } from "components/TableEmpty/TableEmpty";
import { TemplateExampleCard } from "modules/templates/TemplateExampleCard/TemplateExampleCard";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";
import { docs } from "utils/docs";

// Those are from https://github.com/coder/coder/tree/main/examples/templates
const featuredExampleIds = [
	"tasks-docker",
	"docker",
	"kubernetes",
	"aws-linux",
	"aws-windows",
	"gcp-linux",
	"gcp-windows",
];

const findFeaturedExamples = (examples: TemplateExample[]) => {
	const featuredExamples: TemplateExample[] = [];

	// We loop the featuredExampleIds first to keep the order
	for (const exampleId of featuredExampleIds) {
		for (const example of examples) {
			if (exampleId === example.id) {
				featuredExamples.push(example);
			}
		}
	}

	return featuredExamples;
};

interface EmptyTemplatesProps {
	canCreateTemplates: boolean;
	examples: TemplateExample[];
	isUsingFilter: boolean;
}

export const EmptyTemplates: FC<EmptyTemplatesProps> = ({
	canCreateTemplates,
	examples,
	isUsingFilter,
}) => {
	const { t } = useTranslation("templates");

	if (isUsingFilter) {
		return <TableEmpty message={t("empty.noResults")} />;
	}

	const featuredExamples = findFeaturedExamples(examples);

	if (canCreateTemplates) {
		return (
			<TableEmpty
				message={t("starterTemplates.title")}
				description={
					<>
						{t("starterTemplates.description")}
						<Link
							href={docs("/admin/templates/creating-templates")}
							target="_blank"
							rel="noreferrer"
						>
							{t("starterTemplates.createYourOwn")}
						</Link>
						。
					</>
				}
				cta={
					<Stack alignItems="center" spacing={4}>
						<div className="flex flex-wrap justify-center gap-4">
							{featuredExamples.map((example) => (
								<TemplateExampleCard example={example} key={example.id} />
							))}
						</div>

						<Button size="sm" asChild css={{ borderRadius: 9999 }}>
							<RouterLink to="/starter-templates">
								{t("starterTemplates.viewAllStarterTemplates")}
							</RouterLink>
						</Button>
					</Stack>
				}
			/>
		);
	}

	return (
		<TableEmpty
			message={t("empty.contactAdmin")}
			description={t("empty.contactAdminDescription")}
			cta={<CodeExample secret={false} code="coder templates init" />}
		/>
	);
};
