import React from "react";
import { PrefetchPageLinks } from "react-router";
import { motion } from "framer-motion";
import { HomeHeader } from "#/components/features/home/home-header";
import { RepoConnector } from "#/components/features/home/repo-connector";
import { TaskSuggestions } from "#/components/features/home/tasks/task-suggestions";
import { useUserProviders } from "#/hooks/use-user-providers";
import { GitRepository } from "#/types/git";
import OpenHands from "#/api/open-hands";

<PrefetchPageLinks page="/conversations/:conversationId" />;

function HomeScreen() {
  const { providers } = useUserProviders();
  const [selectedRepo, setSelectedRepo] = React.useState<GitRepository | null>(
    null,
  );

  // Kick off runtime prewarm in the background on first load
  React.useEffect(() => {
    OpenHands.prewarmRuntime();
  }, []);

  const providersAreSet = providers.length > 0;

  return (
    <motion.div
      data-testid="home-screen"
      className="bg-gradient-to-br from-base to-base-secondary h-full flex flex-col rounded-2xl px-[42px] pt-[42px] gap-8 overflow-y-auto glass border border-glass-border shadow-glass-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <HomeHeader />
      </motion.div>

      <motion.hr
        className="border-border-primary opacity-30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />

      <motion.main
        className="flex flex-col lg:flex-row justify-between gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <RepoConnector onRepoSelection={(repo) => setSelectedRepo(repo)} />
        </motion.div>

        <motion.hr
          className="md:hidden border-border-primary opacity-30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        />

        {providersAreSet && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <TaskSuggestions filterFor={selectedRepo} />
          </motion.div>
        )}
      </motion.main>

      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-primary/3 to-primary-dark/3 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>
    </motion.div>
  );
}

export default HomeScreen;
