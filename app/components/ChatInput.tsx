import { FormEvent, forwardRef } from 'react';
import { FiSend, FiSquare } from 'react-icons/fi';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ value, onChange, onSubmit, onStop, isStreaming }, ref) => {
    return (
      <form
        onSubmit={onSubmit}
        className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-200"
        aria-label="Chat input form"
      >
        <div className="relative">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <input
            id="chat-input"
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            aria-label="Message input"
            aria-required="true"
            aria-describedby="input-hint"
            className="w-full bg-transparent border-none outline-none px-2 py-2 pr-12 text-sm md:text-base text-foreground placeholder-muted-foreground disabled:opacity-50 font-medium"
          />
          <span id="input-hint" className="sr-only">
            Press Enter to send message
          </span>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generation"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-200 shadow-sm"
              title="Stop generation"
            >
              <FiSquare className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              aria-label="Send message"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-md transition-all duration-200 shadow-sm dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
              title="Send"
            >
              <FiSend className="w-4 h-4" />
            </button>
          )}
        </div>
      </form
    );
  }
);

ChatInput.displayName = 'ChatInput';
