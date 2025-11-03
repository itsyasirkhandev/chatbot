'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './CodeBlock';

interface ThinkingMessageProps {
  thinking: string;
  response: string;
  isStreaming?: boolean;
}

/**
 * ThinkingMessage Component
 * 
 * Displays AI responses that contain thinking/reasoning process.
 * Works with any model that uses <think> tags, not limited to specific providers.
 * 
 * Features:
 * - Collapsible thinking section (expanded by default during streaming)
 * - Streaming indicator for in-progress thinking
 * - Markdown rendering for both thinking and response sections
 * - Automatic state management
 */
export function ThinkingMessage({ thinking, response, isStreaming = false }: ThinkingMessageProps) {
  // Show thinking expanded by default during streaming, collapsed after completion
  const [showThinking, setShowThinking] = useState(true);

  // Auto-collapse after streaming completes (optional UX enhancement)
  useEffect(() => {
    if (!isStreaming && thinking && response) {
      // Keep expanded for now - user can collapse manually if desired
      // Could add auto-collapse with delay: setTimeout(() => setShowThinking(false), 2000);
    }
  }, [isStreaming, thinking, response]);

  const hasThinking = thinking && thinking.trim().length > 0;
  const hasResponse = response && response.trim().length > 0;

  return (
    <div>
      {/* Thinking Section - Always show the toggle if we detected thinking tags */}
      <div className="mb-4">
        <button
          onClick={() => setShowThinking(!showThinking)}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors mb-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isStreaming}
          title={isStreaming ? 'Cannot hide thinking while streaming' : undefined}
        >
          <svg 
            className={`w-3.5 h-3.5 transition-transform ${showThinking ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>
            {showThinking ? 'Hide' : 'Show'} thinking
          </span>
        </button>
        
        {showThinking && (
          <div className="bg-white border-l-4 border-gray-300 pl-4 pr-3 py-3 animate-fade-in rounded-r">
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              {hasThinking ? (
                <>
                  {/* Render thinking content with paragraph breaks */}
                  {thinking.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                  {/* Streaming indicator */}
                  {isStreaming && (
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <span className="inline-block w-1 h-3 bg-gray-400 animate-pulse"></span>
                      <span className="text-xs">thinking...</span>
                    </span>
                  )}
                </>
              ) : (
                // Placeholder when thinking tag is open but no content yet
                <span className="inline-flex items-center gap-1 text-gray-400 italic">
                  <span className="inline-block w-1 h-3 bg-gray-400 animate-pulse"></span>
                  <span className="text-xs">Thinking...</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Response Section - Only render if there's actual response content */}
      {hasResponse && (
        <div className="markdown-content leading-relaxed text-sm md:text-base text-gray-900">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                if (!inline && className) {
                  return (
                    <CodeBlock 
                      className={className} 
                      inline={false}
                    >
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
            {response}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
