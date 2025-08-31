import { useMutation, useQueryClient } from "@tanstack/react-query";
import OpenHands from "#/api/open-hands";
import { SuggestedTask } from "#/components/features/home/tasks/task.types";
import { Provider } from "#/types/settings";
import { CreateMicroagent } from "#/api/open-hands.types";

interface CreateConversationVariables {
  query?: string;
  repository?: {
    name: string;
    gitProvider: Provider;
    branch?: string;
  };
  suggestedTask?: SuggestedTask;
  conversationInstructions?: string;
  createMicroagent?: CreateMicroagent;
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-conversation"],
    mutationFn: async (variables: CreateConversationVariables) => {
      const {
        query,
        repository,
        suggestedTask,
        conversationInstructions,
        createMicroagent,
      } = variables;

      return OpenHands.createConversation(
        repository?.name,
        repository?.gitProvider,
        query,
        suggestedTask,
        repository?.branch,
        conversationInstructions,
        createMicroagent,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user", "conversations"],
      });
    },
  });
};
