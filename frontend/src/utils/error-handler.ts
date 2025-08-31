import { handleStatusMessage } from "#/services/actions";
import { displayErrorToast } from "./custom-toast-handlers";

interface ErrorDetails {
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
  msgId?: string;
}

export function trackError({ message, source, metadata = {} }: ErrorDetails) {
  // No-op tracking (analytics removed)
  // Keep a minimal console error for local debugging
  // eslint-disable-next-line no-console
  console.error("Error:", { message, source: source || "unknown", metadata });
}

export function showErrorToast({
  message,
  source,
  metadata = {},
}: ErrorDetails) {
  trackError({ message, source, metadata });
  displayErrorToast(message);
}

export function showChatError({
  message,
  source,
  metadata = {},
  msgId,
}: ErrorDetails) {
  trackError({ message, source, metadata });
  handleStatusMessage({
    type: "error",
    message,
    id: msgId,
    status_update: true,
  });
}
