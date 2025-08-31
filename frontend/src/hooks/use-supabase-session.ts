import * as React from "react";
import { supabase } from "#/lib/supabase";

export function useSupabaseSession() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [hasSession, setHasSession] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    if (!supabase) {
      setHasSession(true); // If not configured, don't gate the app
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setHasSession(!!data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setHasSession(!!session);
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, hasSession } as const;
}

