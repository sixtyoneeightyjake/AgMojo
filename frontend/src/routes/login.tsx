import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "#/lib/supabase";
import { PrimaryButton } from "#/components/common/premium-button";
import { FaGithub } from "react-icons/fa6";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If Supabase not configured, skip login
    if (!supabase) {
      navigate("/");
    }
  }, []);

  const onLogin = async () => {
    if (!supabase) return;
    const redirectTo = window.location.origin + "/";
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "repo read:org user",
      },
    });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-base-secondary border border-border-primary shadow-glass text-content flex flex-col items-center gap-4">
        <img
          src="/mojomain.png"
          alt="AgentMojo Logo"
          className="w-48 h-auto mb-2"
        />
        <h1 className="text-2xl font-semibold gradient-text">Sign in</h1>
        <p className="text-content-tertiary text-sm">Use your GitHub account to continue</p>
        <div className="w-full mt-2">
          <PrimaryButton onClick={onLogin} fullWidth size="lg" icon={<FaGithub size={20} />}>
            Continue with GitHub
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
