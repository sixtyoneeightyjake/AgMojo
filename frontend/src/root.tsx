import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./tailwind.css";
import "./index.css";
import React from "react";
import { Toaster } from "react-hot-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gradient-to-br from-base via-base-secondary to-base antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster
          toastOptions={{
            className:
              "bg-glass backdrop-blur-lg border border-glass-border text-content",
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#DC2626",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => [
  { title: "AgentMojo - AI-Powered Development Platform" },
  {
    name: "description",
    content:
      "Build incredible applications with AI-powered agents. AgentMojo revolutionizes software development.",
  },
  { name: "theme-color", content: "#000000" },
];

export default function App() {
  return <Outlet />;
}
