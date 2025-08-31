import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { TooltipButton } from "./tooltip-button";

export function AgentMojoLogoButton() {
  const { t } = useTranslation();

  return (
    <TooltipButton
      tooltip={t(I18nKey.BRANDING$ALL_HANDS_AI)}
      ariaLabel={t(I18nKey.BRANDING$ALL_HANDS_LOGO)}
      navLinkTo="/"
    >
      <img
        src="/favicon-32x32.png"
        alt="Agent Mojo Logo"
        width={34}
        height={34}
      />
    </TooltipButton>
  );
}
