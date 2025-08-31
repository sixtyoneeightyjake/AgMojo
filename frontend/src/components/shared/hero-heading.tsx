import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";

export function HeroHeading() {
  const { t } = useTranslation();
  return (
    <div className="w-[304px] text-center flex flex-col gap-4 items-center py-4">
      <img
        src="/mojogo.png"
        alt="Agent Mojo Logo"
        width={88}
        height={104}
        className="object-contain"
      />
      <h1 className="text-[38px] leading-[32px] -tracking-[0.02em]">
        {t(I18nKey.LANDING$TITLE)}
      </h1>
      <p className="mx-4 text-sm flex flex-col gap-2">
        {t(I18nKey.LANDING$SUBTITLE)}{" "}
        <span className="">
          {t("LANDING$START_HELP", { defaultValue: "Need help starting?" })}{" "}
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://docs.all-hands.dev/usage/getting-started"
            className="text-white underline underline-offset-[3px]"
          >
            {t("LANDING$START_HELP_LINK", { defaultValue: "See the guide" })}
          </a>
        </span>
      </p>
    </div>
  );
}
