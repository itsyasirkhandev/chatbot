'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FiCopy, FiFileText } from 'react-icons/fi';
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

// Convert markdown content to plain text for copying without formatting
function markdownToPlainText(markdown: string): string {
  return markdown
    // Remove fenced code block markers but keep inner code
    .replace(/```[\s\S]*?```/g, (block) => {
      return block
        .replace(/```.*\n?/, '')
        .replace(/```$/, '');
    })
    // Inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Images ![alt](url) -> ''
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    // Links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Blockquotes
    .replace(/^>\s?/gm, '')
    // Headings
    .replace(/^#{1,6}\s*/gm, '')
    // Unordered list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    // Ordered list markers
    .replace(/^\s*\d+\.\s+/gm, '')
    // Bold/italic/strikethrough
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Strip any remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function MessageBubble({ message, isStreaming, isLastMessage }: MessageBubbleProps) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

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
  const { thinking, response, hasThinkTag } = parseThinkingContent(message.content);

  const visibleMarkdown = hasThinkTag ? response : message.content;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(visibleMarkdown);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleCopyText = async () => {
    try {
      const plainText = markdownToPlainText(visibleMarkdown);
      await navigator.clipboard.writeText(plainText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <article
      className="flex justify-start animate-fade-in"
      role="article"
      aria-label="Assistant message"
    >
      <div className="w-full">
        <div className="rounded-lg px-4 py-3 md:px-5 md:py-4 bg-card border border-border hover:border-primary/20 transition-all">
          {/* Copy actions */}
          <div className="flex justify-end gap-2 mb-2 text-xs">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white text-gray-600 hover:text-gray-800 text-[11px] md:text-xs transition-colors"
              aria-label={copiedMarkdown ? 'Markdown copied' : 'Copy response as markdown'}
            >
              <FiCopy className="w-3.5 h-3.5" />
              <span>{copiedMarkdown ? 'Markdown copied' : 'Copy markdown'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white text-gray-600 hover:text-gray-800 text-[11px] md:text-xs transition-colors"
              aria-label={copiedText ? 'Text copied' : 'Copy response as plain text'}
            >
              <FiFileText className="w-3.5 h-3.5" />
              <span>{copiedText ? 'Text copied' : 'Copy text'}</span>
            </button>
          </div>

          <div className="markdown-content leading-relaxed text-sm md:text-base text-foreground">
            {message.content === '' && isCurrentlyStreaming ? (
              <SkeletonLoader />
            ) : hasThinkTag ? (
              <ThinkingMessage
                thinking={thinking}
                response={response}
                isStreaming={isCurrentlyStreaming}
              />
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
