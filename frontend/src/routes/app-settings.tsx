import React from "react";
import { useTranslation } from "react-i18next";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { useSettings } from "#/hooks/query/use-settings";
import { AvailableLanguages } from "#/i18n";
import { DEFAULT_SETTINGS } from "#/services/settings";
import { BrandButton } from "#/components/features/settings/brand-button";
import { SettingsSwitch } from "#/components/features/settings/settings-switch";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { LanguageInput } from "#/components/features/settings/app-settings/language-input";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import { retrieveAxiosErrorMessage } from "#/utils/retrieve-axios-error-message";
import { AppSettingsInputsSkeleton } from "#/components/features/settings/app-settings/app-settings-inputs-skeleton";
import { useConfig } from "#/hooks/query/use-config";

function AppSettingsScreen() {
  const { t } = useTranslation();

  const { mutate: saveSettings, isPending } = useSaveSettings();
  const { data: settings, isLoading } = useSettings();
  const { data: config } = useConfig();

  const [languageInputHasChanged, setLanguageInputHasChanged] =
    React.useState(false);
  const [
    soundNotificationsSwitchHasChanged,
    setSoundNotificationsSwitchHasChanged,
  ] = React.useState(false);
  const [
    proactiveConversationsSwitchHasChanged,
    setProactiveConversationsSwitchHasChanged,
  ] = React.useState(false);
  const [
    solvabilityAnalysisSwitchHasChanged,
    setSolvabilityAnalysisSwitchHasChanged,
  ] = React.useState(false);
  const [gitUserNameHasChanged, setGitUserNameHasChanged] =
    React.useState(false);
  const [gitUserEmailHasChanged, setGitUserEmailHasChanged] =
    React.useState(false);

  const formAction = (formData: FormData) => {
    const languageLabel = formData.get("language-input")?.toString();
    const languageValue = AvailableLanguages.find(
      ({ label }) => label === languageLabel,
    )?.value;
    const language = languageValue || DEFAULT_SETTINGS.LANGUAGE;

    // analytics removed
    const enableSoundNotifications =
      formData.get("enable-sound-notifications-switch")?.toString() === "on";

    const enableProactiveConversations =
      formData.get("enable-proactive-conversations-switch")?.toString() ===
      "on";

    const enableSolvabilityAnalysis =
      formData.get("enable-solvability-analysis-switch")?.toString() === "on";

    const gitUserName =
      formData.get("git-user-name-input")?.toString() ||
      DEFAULT_SETTINGS.GIT_USER_NAME;
    const gitUserEmail =
      formData.get("git-user-email-input")?.toString() ||
      DEFAULT_SETTINGS.GIT_USER_EMAIL;

    saveSettings(
      {
        LANGUAGE: language,
        // analytics removed
        ENABLE_SOUND_NOTIFICATIONS: enableSoundNotifications,
        ENABLE_PROACTIVE_CONVERSATION_STARTERS: enableProactiveConversations,
        ENABLE_SOLVABILITY_ANALYSIS: enableSolvabilityAnalysis,
        GIT_USER_NAME: gitUserName,
        GIT_USER_EMAIL: gitUserEmail,
      },
      {
        onSuccess: () => {
          displaySuccessToast(t(I18nKey.SETTINGS$SAVED));
        },
        onError: (error) => {
          const errorMessage = retrieveAxiosErrorMessage(error);
          displayErrorToast(errorMessage || t(I18nKey.ERROR$GENERIC));
        },
        onSettled: () => {
          setLanguageInputHasChanged(false);
          setSoundNotificationsSwitchHasChanged(false);
          setProactiveConversationsSwitchHasChanged(false);
          setGitUserNameHasChanged(false);
          setGitUserEmailHasChanged(false);
        },
      },
    );
  };

  const checkIfLanguageInputHasChanged = (value: string) => {
    const selectedLanguage = AvailableLanguages.find(
      ({ label: langValue }) => langValue === value,
    )?.label;
    const currentLanguage = AvailableLanguages.find(
      ({ value: langValue }) => langValue === settings?.LANGUAGE,
    )?.label;

    setLanguageInputHasChanged(selectedLanguage !== currentLanguage);
  };

  // analytics removed

  const checkIfSoundNotificationsSwitchHasChanged = (checked: boolean) => {
    const currentSoundNotifications = !!settings?.ENABLE_SOUND_NOTIFICATIONS;
    setSoundNotificationsSwitchHasChanged(
      checked !== currentSoundNotifications,
    );
  };

  const checkIfProactiveConversationsSwitchHasChanged = (checked: boolean) => {
    const currentProactiveConversations =
      !!settings?.ENABLE_PROACTIVE_CONVERSATION_STARTERS;
    setProactiveConversationsSwitchHasChanged(
      checked !== currentProactiveConversations,
    );
  };

  const checkIfSolvabilityAnalysisSwitchHasChanged = (checked: boolean) => {
    const currentSolvabilityAnalysis = !!settings?.ENABLE_SOLVABILITY_ANALYSIS;
    setSolvabilityAnalysisSwitchHasChanged(
      checked !== currentSolvabilityAnalysis,
    );
  };

  const checkIfGitUserNameHasChanged = (value: string) => {
    const currentValue = settings?.GIT_USER_NAME;
    setGitUserNameHasChanged(value !== currentValue);
  };

  const checkIfGitUserEmailHasChanged = (value: string) => {
    const currentValue = settings?.GIT_USER_EMAIL;
    setGitUserEmailHasChanged(value !== currentValue);
  };

  const formIsClean =
    !languageInputHasChanged &&
    !soundNotificationsSwitchHasChanged &&
    !proactiveConversationsSwitchHasChanged &&
    !solvabilityAnalysisSwitchHasChanged &&
    !gitUserNameHasChanged &&
    !gitUserEmailHasChanged;

  const shouldBeLoading = !settings || isLoading || isPending;

  return (
    <form
      data-testid="app-settings-screen"
      action={formAction}
      className="flex flex-col h-full justify-between"
    >
      {shouldBeLoading && <AppSettingsInputsSkeleton />}
      {!shouldBeLoading && (
        <div className="p-9 flex flex-col gap-6">
          <LanguageInput
            name="language-input"
            defaultKey={settings.LANGUAGE}
            onChange={checkIfLanguageInputHasChanged}
          />

          {/* analytics switch removed */}

          <SettingsSwitch
            testId="enable-sound-notifications-switch"
            name="enable-sound-notifications-switch"
            defaultIsToggled={!!settings.ENABLE_SOUND_NOTIFICATIONS}
            onToggle={checkIfSoundNotificationsSwitchHasChanged}
          >
            {t(I18nKey.SETTINGS$SOUND_NOTIFICATIONS)}
          </SettingsSwitch>

          {config?.APP_MODE === "saas" && (
            <SettingsSwitch
              testId="enable-proactive-conversations-switch"
              name="enable-proactive-conversations-switch"
              defaultIsToggled={
                !!settings.ENABLE_PROACTIVE_CONVERSATION_STARTERS
              }
              onToggle={checkIfProactiveConversationsSwitchHasChanged}
            >
              {t(I18nKey.SETTINGS$PROACTIVE_CONVERSATION_STARTERS)}
            </SettingsSwitch>
          )}

          {config?.APP_MODE === "saas" && (
            <SettingsSwitch
              testId="enable-solvability-analysis-switch"
              name="enable-solvability-analysis-switch"
              defaultIsToggled={!!settings.ENABLE_SOLVABILITY_ANALYSIS}
              onToggle={checkIfSolvabilityAnalysisSwitchHasChanged}
            >
              {t(I18nKey.SETTINGS$SOLVABILITY_ANALYSIS)}
            </SettingsSwitch>
          )}

          <div className="border-t border-t-tertiary pt-6 mt-2">
            <h3 className="text-lg font-medium mb-2">
              {t(I18nKey.SETTINGS$GIT_SETTINGS)}
            </h3>
            <p className="text-xs mb-4">
              {t(I18nKey.SETTINGS$GIT_SETTINGS_DESCRIPTION)}
            </p>
            <div className="flex flex-col gap-6">
              <SettingsInput
                testId="git-user-name-input"
                name="git-user-name-input"
                type="text"
                label={t(I18nKey.SETTINGS$GIT_USERNAME)}
                defaultValue={settings.GIT_USER_NAME || ""}
                onChange={checkIfGitUserNameHasChanged}
                placeholder="MojoRocks69 (put your github username here)"
                className="w-full max-w-[680px]"
              />
              <SettingsInput
                testId="git-user-email-input"
                name="git-user-email-input"
                type="email"
                label={t(I18nKey.SETTINGS$GIT_EMAIL)}
                defaultValue={settings.GIT_USER_EMAIL || ""}
                onChange={checkIfGitUserEmailHasChanged}
                placeholder="MojjoKoolDude@compuserve.net (surely you know what goes here)"
                className="w-full max-w-[680px]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 p-6 justify-end border-t border-t-tertiary">
        <BrandButton
          testId="submit-button"
          variant="primary"
          type="submit"
          isDisabled={isPending || formIsClean}
        >
          {!isPending && t("SETTINGS$SAVE_CHANGES")}
          {isPending && t("SETTINGS$SAVING")}
        </BrandButton>
      </div>
    </form>
  );
}

export default AppSettingsScreen;
