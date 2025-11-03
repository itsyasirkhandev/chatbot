'use client';

import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
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

  // For inline code, return simple element
  if (inline) {
    return (
      <code className="bg-white/10 px-2 py-0.5 rounded text-sm font-mono text-slate-200 border border-white/10">
        {children}
      </code>
    );
  }

  // Extract language from className (format: language-javascript)
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  return (
    <div className="relative group my-4 not-prose">
      <div className="bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden">
        {/* Header with language and copy button */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="px-2 py-1 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded transition-all flex items-center gap-1.5"
            aria-label={copied ? 'Copied!' : 'Copy code'}
            type="button"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code content */}
        <div className="overflow-x-auto">
          <pre className="p-4 m-0 text-sm leading-relaxed">
            <code className={className}>{children}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
