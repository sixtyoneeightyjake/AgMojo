import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { PrimaryButton } from "#/components/common/premium-button";
import OpenHands from "#/api/open-hands";

export function HomeHeader() {
  const navigate = useNavigate();
  const {
    mutate: createConversation,
    isPending,
    isSuccess,
  } = useCreateConversation();
  const isCreatingConversationElsewhere = useIsCreatingConversation();
  const { t } = useTranslation();
  const [isWaitingForRuntime, setIsWaitingForRuntime] = React.useState(false);

  // We check for isSuccess because the app might require time to render
  // into the new conversation screen after the conversation is created.
  const isCreatingConversation =
    isPending || isSuccess || isCreatingConversationElsewhere || isWaitingForRuntime;

  return (
    <header className="flex flex-col gap-6">
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.img
          src="/mojomain1.png"
          alt="Agent Mojo Logo"
          className="w-auto h-auto max-w-64 max-h-64 filter drop-shadow-2xl"
          whileHover={{ scale: 2.0, rotate: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </motion.div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <motion.h1
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-content via-primary to-content bg-clip-text text-transparent leading-tight mb-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {t("HOME$LETS_START_BUILDING")}
            </motion.h1>

            <motion.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <p className="text-content-secondary text-lg leading-relaxed">
                {t("HOME$OPENHANDS_DESCRIPTION")}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="ml-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <PrimaryButton
              size="lg"
              loading={isCreatingConversation}
              disabled={isCreatingConversation}
              onClick={() =>
                createConversation(
                  {},
                  {
                    onSuccess: async (data) => {
                      setIsWaitingForRuntime(true);
                      const conversationId = data.conversation_id;
                      const start = Date.now();
                      const timeoutMs = 180000; // 3 minutes
                      const intervalMs = 2000;

                      const poll = async (): Promise<void> => {
                        try {
                          const conv = await OpenHands.getConversation(conversationId);
                          if (conv && conv.status === "RUNNING") {
                            navigate(`/conversations/${conversationId}`);
                            return;
                          }
                        } catch {}
                        if (Date.now() - start > timeoutMs) {
                          navigate(`/conversations/${conversationId}`);
                          return;
                        }
                        setTimeout(poll, intervalMs);
                      };

                      poll();
                    },
                  },
                )
              }
              icon={
                !isCreatingConversation ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ) : undefined
              }
            >
              {!isCreatingConversation && t("HOME$LAUNCH_FROM_SCRATCH")}
              {isCreatingConversation && t("HOME$LOADING")}
            </PrimaryButton>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
