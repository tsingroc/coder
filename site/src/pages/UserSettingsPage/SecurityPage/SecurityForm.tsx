import TextField from "@mui/material/TextField";
import { Alert } from "components/Alert/Alert";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Button } from "components/Button/Button";
import { Form, FormFields } from "components/Form/Form";
import { PasswordField } from "components/PasswordField/PasswordField";
import { Spinner } from "components/Spinner/Spinner";
import { type FormikContextType, useFormik } from "formik";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { getFormHelpers } from "utils/formUtils";
import * as Yup from "yup";

interface SecurityFormValues {
	old_password: string;
	password: string;
	confirm_password: string;
}

const getValidationSchema = (t: any) =>
	Yup.object({
	old_password: Yup.string().trim().required(t("oldPasswordRequired")),
	password: Yup.string().trim().required(t("newPasswordRequired")),
	confirm_password: Yup.string()
		.trim()
		.test("passwords-match", t("confirmPasswordMatch"), function (value) {
			return (this.parent as SecurityFormValues).password === value;
		}),
});

interface SecurityFormProps {
	disabled: boolean;
	isLoading: boolean;
	onSubmit: (values: SecurityFormValues) => void;
	error?: unknown;
}

export const SecurityForm: FC<SecurityFormProps> = ({
	disabled,
	isLoading,
	onSubmit,
	error,
}) => {
	const { t } = useTranslation("userSettings");
	const validationSchema = getValidationSchema(t);
	const form: FormikContextType<SecurityFormValues> =
		useFormik<SecurityFormValues>({
			initialValues: {
				old_password: "",
				password: "",
				confirm_password: "",
			},
			validationSchema,
			onSubmit,
		});
	const getFieldHelpers = getFormHelpers<SecurityFormValues>(form, error);

	if (disabled) {
		return (
			<Alert severity="info">
				{t("passwordBasedAccountsOnly")}
			</Alert>
		);
	}

	return (
		<Form onSubmit={form.handleSubmit}>
			<FormFields>
				{Boolean(error) && <ErrorAlert error={error} />}
				<TextField
					{...getFieldHelpers("old_password")}
					autoComplete="old_password"
					fullWidth
					label={t("oldPassword")}
					type="password"
				/>
				<PasswordField
					{...getFieldHelpers("password")}
					autoComplete="password"
					fullWidth
					label={t("newPassword")}
				/>
				<TextField
					{...getFieldHelpers("confirm_password")}
					autoComplete="confirm_password"
					fullWidth
					label={t("confirmPassword")}
					type="password"
				/>

				<div>
					<Button disabled={isLoading} type="submit">
						<Spinner loading={isLoading} />
						{t("updatePassword")}
					</Button>
				</div>
			</FormFields>
		</Form>
	);
};
