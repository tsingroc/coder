import { API } from "api/api";
import { authMethods, updatePassword } from "api/queries/users";
import { Loader } from "components/Loader/Loader";
import { Stack } from "components/Stack/Stack";
import { useAuthenticated } from "hooks";
import type { ComponentProps, FC } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { Section } from "../Section";
import { SecurityForm } from "./SecurityForm";
import {
	SingleSignOnSection,
	useSingleSignOnSection,
} from "./SingleSignOnSection";

const SecurityPage: FC = () => {
	const { t } = useTranslation("userSettings");
	const { user: me } = useAuthenticated();
	const updatePasswordMutation = useMutation(updatePassword());
	const authMethodsQuery = useQuery(authMethods());
	const { data: userLoginType } = useQuery({
		queryKey: ["loginType"],
		queryFn: API.getUserLoginType,
	});
	const singleSignOnSection = useSingleSignOnSection();

	if (!authMethodsQuery.data || !userLoginType) {
		return <Loader />;
	}

	return (
		<SecurityPageView
			security={{
				form: {
					disabled: userLoginType.login_type !== "password",
					error: updatePasswordMutation.error,
					isLoading: updatePasswordMutation.isPending,
					onSubmit: async (data) => {
						await updatePasswordMutation.mutateAsync({
							userId: me.id,
							...data,
						});
						toast.success(t("passwordUpdated"));
						// Refresh the browser session. We need to improve the AuthProvider
						// to include better API to handle these scenarios
						window.location.href = location.origin;
					},
				},
			}}
			oidc={{
				section: {
					authMethods: authMethodsQuery.data,
					userLoginType,
					...singleSignOnSection,
				},
			}}
		/>
	);
};

interface SecurityPageViewProps {
	security: {
		form: ComponentProps<typeof SecurityForm>;
	};
	oidc?: {
		section: ComponentProps<typeof SingleSignOnSection>;
	};
}

export const SecurityPageView: FC<SecurityPageViewProps> = ({
	security,
	oidc,
}) => {
	const { t } = useTranslation("userSettings");
	return (
		<Stack spacing={6}>
			<Section title={t("security")} description={t("securityDescription")}>
				<SecurityForm {...security.form} />
			</Section>
			{oidc && <SingleSignOnSection {...oidc.section} />}
		</Stack>
	);
};

export default SecurityPage;
