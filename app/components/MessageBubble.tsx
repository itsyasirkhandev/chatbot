'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './CodeBlock';
import { ThinkingMessage } from './ThinkingMessage';
import { SkeletonLoader } from './SkeletonLoader';
import { Message } from '../types';
import { parseThinkingContent } from '../utils/chat';

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
  isLastMessage: boolean;
}

export function MessageBubble({ message, isStreaming, isLastMessage }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <article
        className="flex justify-end animate-fade-in"
        role="article"
        aria-label="Your message"
      >
        <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[80%]">
          <div className="rounded-lg px-4 py-3 md:px-5 md:py-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
            <span className="whitespace-pre-wrap block leading-normal text-sm md:text-base">
              {message.content}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Assistant message
  const isCurrentlyStreaming = isStreaming && isLastMessage;

  return (
    <article
      className="flex justify-start animate-fade-in"
      role="article"
      aria-label="Assistant message"
    >
      <div className="w-full">
        <div className="rounded-lg px-4 py-3 md:px-5 md:py-4 bg-card border border-border hover:border-primary/20 transition-all">
          <div className="markdown-content leading-relaxed text-sm md:text-base text-foreground">
            {message.content === '' && isCurrentlyStreaming ? (
              <SkeletonLoader />
            ) : (() => {
              const { thinking, response, hasThinkTag } = parseThinkingContent(message.content);

              if (hasThinkTag) {
                return (
                  <ThinkingMessage
                    thinking={thinking}
                    response={response}
                    isStreaming={isCurrentlyStreaming}
                  />
                );
              }

              return (
                <>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        if (!inline && className) {
                          return (
                            <CodeBlock className={className} inline={false}>
                              {children}
                            </CodeBlock>
                          );
                        }

                        return (
                          <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono">
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {isCurrentlyStreaming && (
                    <span
                      className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse"
                      aria-label="Typing indicator"
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </article>
  );
}
