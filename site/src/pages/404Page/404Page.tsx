import type { FC } from "react";
import { useTranslation } from "react-i18next";

const NotFoundPage: FC = () => {
	const { t } = useTranslation("notFound");

	return (
		<div className="w-full h-full flex flex-row justify-center items-center">
			<p className="flex gap-4">
				<span className="font-bold">{t("title")}</span>
				{t("message")}
			</p>
		</div>
	);
};

export default NotFoundPage;
