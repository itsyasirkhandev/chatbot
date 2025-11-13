'use client';

import { useState } from 'react';
import { ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Recursively extract text from React elements (handles syntax highlighting)
  const extractTextContent = (node: ReactNode): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'number') {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(extractTextContent).join('');
    }
    if (node && typeof node === 'object' && 'props' in node) {
      const element = node as any;
      if (element.props && element.props.children) {
        return extractTextContent(element.props.children);
      }
    }
    return '';
  };

  const codeString = extractTextContent(children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // For inline code, return simple element
  if (inline) {
    return (
      <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono">
        {children}
      </code>
    );
  }

  // Extract language from className (format: language-javascript)
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  return (
    <div className="relative group my-4 not-prose">
      <div className="bg-[#1e1e1e] rounded-lg border border-[#333333] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
        {/* Header with language and copy button */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs bg-[#404040] hover:bg-[#4a4a4a] text-gray-300 hover:text-white rounded transition-all duration-200 font-medium flex items-center gap-1.5"
            aria-label={copied ? 'Copied!' : 'Copy code'}
            type="button"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code content - render children as-is to preserve syntax highlighting */}
        <div className="overflow-x-auto bg-[#1e1e1e]">
          <pre className="p-3 m-0 text-xs md:text-sm leading-relaxed bg-[#1e1e1e]">
            <code className={className}>{children}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
