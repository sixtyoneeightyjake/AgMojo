import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useConfig } from "./use-config";
import OpenHands from "#/api/open-hands";
import { useShouldShowUserFeatures } from "#/hooks/use-should-show-user-features";

export const useGitUser = () => {
  const { data: config } = useConfig();

  // Use the shared hook to determine if we should fetch user data
  const shouldFetchUser = useShouldShowUserFeatures();

  const user = useQuery({
    queryKey: ["user"],
    queryFn: OpenHands.getGitUser,
    enabled: shouldFetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  // analytics removed

  return user;
};
