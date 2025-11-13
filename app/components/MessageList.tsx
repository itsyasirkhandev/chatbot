import { forwardRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  isLoadingHistory: boolean;
  onPromptClick: (prompt: string) => void;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isStreaming, isLoadingHistory, onPromptClick }, ref) => {
    return (
      <main
        ref={ref}
        className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4 relative pr-2 md:pr-3"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {isLoadingHistory && (
          <div className="flex items-start justify-start px-4 pt-8">
            <div className="w-full max-w-4xl">
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                  <SkeletonLoader />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                  <SkeletonLoader />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <EmptyState onPromptClick={onPromptClick} />
        )}

        {!isLoadingHistory &&
          messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isStreaming={isStreaming}
              isLastMessage={index === messages.length - 1}
            />
          ))}
      </main>
    );
  }
);

MessageList.displayName = 'MessageList';
