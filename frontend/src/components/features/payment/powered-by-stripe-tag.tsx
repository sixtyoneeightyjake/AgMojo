import { useTranslation } from "react-i18next";
import stripeLogo from "#/assets/stripe.svg";

export function PoweredByStripeTag() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center">
      <span className="text-medium font-semi-bold">
        {t("BILLING$POWERED_BY", { defaultValue: "Powered by" })}
      </span>
      <img src={stripeLogo} alt="Stripe" className="h-8" />
    </div>
  );
}
