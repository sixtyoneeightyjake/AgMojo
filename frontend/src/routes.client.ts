import type { RouteObject } from "react-router";

const routes: RouteObject[] = [
  {
    path: "/",
    lazy: () =>
      import("./routes/root-layout.tsx").then((mod) => ({
        Component: mod.default,
        ErrorBoundary: mod.ErrorBoundary,
      })),
    children: [
      {
        index: true,
        lazy: () =>
          import("./routes/home.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "login",
        lazy: () =>
          import("./routes/login.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "accept-tos",
        lazy: () =>
          import("./routes/accept-tos.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "settings",
        lazy: () =>
          import("./routes/settings.tsx").then((m) => ({ Component: m.default })),
        children: [
          {
            index: true,
            lazy: () =>
              import("./routes/llm-settings.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "mcp",
            lazy: () =>
              import("./routes/mcp-settings.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "user",
            lazy: () =>
              import("./routes/user-settings.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "integrations",
            lazy: () =>
              import("./routes/git-settings.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "app",
            lazy: () =>
              import("./routes/app-settings.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "billing",
            lazy: () =>
              import("./routes/billing.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "secrets",
            lazy: () =>
              import("./routes/secrets-settings.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "api-keys",
            lazy: () =>
              import("./routes/api-keys.tsx").then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
      {
        path: "conversations/:conversationId",
        lazy: () =>
          import("./routes/conversation.tsx").then((m) => ({
            Component: m.default,
          })),
        children: [
          {
            index: true,
            lazy: () =>
              import("./routes/changes-tab.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "browser",
            lazy: () =>
              import("./routes/browser-tab.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "jupyter",
            lazy: () =>
              import("./routes/jupyter-tab.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "served",
            lazy: () =>
              import("./routes/served-tab.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "terminal",
            lazy: () =>
              import("./routes/terminal-tab.tsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "vscode",
            lazy: () =>
              import("./routes/vscode-tab.tsx").then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
      {
        path: "microagent-management",
        lazy: () =>
          import("./routes/microagent-management.tsx").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
];

export default routes;

