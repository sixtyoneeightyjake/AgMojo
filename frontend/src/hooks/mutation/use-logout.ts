import { useMutation, useQueryClient } from "@tanstack/react-query";
import OpenHands from "#/api/open-hands";
import { useConfig } from "../query/use-config";
import { clearLoginData } from "#/utils/local-storage";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { data: config } = useConfig();

  return useMutation({
    mutationFn: () => OpenHands.logout(config?.APP_MODE ?? "oss"),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["settings"] });
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["secrets"] });

      // Clear login method and last page from local storage
      if (config?.APP_MODE === "saas") {
        clearLoginData();
      }

      // analytics removed

      // Refresh the page after all logout logic is completed
      window.location.reload();
    },
  });
};
