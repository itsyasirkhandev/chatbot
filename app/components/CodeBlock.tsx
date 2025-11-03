'use client';

import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Extract language from className (format: language-javascript)
  const language = className?.replace('language-', '') || 'text';

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-all border border-white/10 flex items-center gap-2 shadow-lg"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="flex items-center justify-between mb-2 px-4 pt-3">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{language}</span>
      </div>
      <div className="bg-[#0a0e1a] rounded-lg border border-white/10 overflow-hidden">
        <pre className="overflow-x-auto p-4 m-0 bg-transparent">
          <code className={className}>{children}</code>
        </pre>
      </div>
    </div>
  );
}
