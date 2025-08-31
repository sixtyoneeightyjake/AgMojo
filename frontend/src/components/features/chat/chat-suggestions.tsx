import { Suggestions } from "#/components/features/suggestions/suggestions";
import { SUGGESTIONS } from "#/utils/suggestions";

const WELCOME_MESSAGE = "What'll it be?? Build, Fix or Fuckitall?";

interface ChatSuggestionsProps {
  onSuggestionsClick: (value: string) => void;
}

export function ChatSuggestions({ onSuggestionsClick }: ChatSuggestionsProps) {
  return (
    <div
      data-testid="chat-suggestions"
      className="flex flex-col gap-6 h-full px-4 items-center justify-center"
    >
      <div className="flex items-center justify-center mb-3">
        <img src="/mojogo.png" alt="Agent Mojo Logo" width={70} height={84} />
      </div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {WELCOME_MESSAGE}
      </h2>
      <Suggestions
        suggestions={Object.entries(SUGGESTIONS.repo)
          .slice(0, 4)
          .map(([label, value]) => ({
            label,
            value,
          }))}
        onSuggestionClick={onSuggestionsClick}
      />
    </div>
  );
}
