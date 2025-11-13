import { SUGGESTED_PROMPTS } from '../utils/chat';

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Start a conversation
          </h2>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Ask me anything or choose from suggested prompts below to get started
          </p>
        </div>

        {/* Suggested Prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="text-left p-4 md:p-5 rounded-lg bg-card border border-border hover:border-primary/40 hover:bg-card/80 hover:shadow-md transition-all duration-200 text-sm text-foreground group"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span className="group-hover:text-primary transition-colors">{prompt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
