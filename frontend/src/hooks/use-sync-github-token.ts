import * as React from "react";
import { supabase } from "#/lib/supabase";
import { useAddGitProviders } from "#/hooks/mutation/use-add-git-providers";

/**
 * After Supabase OAuth, provider_token (GitHub access token) is available in the session.
 * This hook syncs it to the backend SecretsStore automatically.
 */
export function useSyncGitHubToken() {
  const { mutate: saveGitProviders } = useAddGitProviders();

  React.useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const providerToken = (data.session as any)?.provider_token as
        | string
        | undefined;
      if (providerToken) {
        saveGitProviders({
          providers: {
            github: { token: providerToken, host: "github.com" },
            gitlab: { token: "", host: "" },
            bitbucket: { token: "", host: "" },
          },
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [saveGitProviders]);
}

