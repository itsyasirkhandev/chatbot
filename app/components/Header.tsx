'use client';

import { FiSettings, FiTrash2, FiBookOpen, FiMessageCircle, FiMenu, FiSun, FiMoon } from 'react-icons/fi';

interface HeaderProps {
  provider: 'gemini' | 'huggingface' | 'deepseek';
  onProviderChange: (provider: 'gemini' | 'huggingface' | 'deepseek') => void;
  systemMessage: string;
  onSystemPromptClick: () => void;
  messagesCount: number;
  isStreaming: boolean;
  onClearClick: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({
  provider,
  onProviderChange,
  systemMessage,
  onSystemPromptClick,
  messagesCount,
  isStreaming,
  onClearClick,
  onToggleSidebar,
  isDarkMode,
  onToggleDarkMode,
}: HeaderProps) {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left Section: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sidebar Toggle Button - works on all screen sizes */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
              <FiMessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                AI Chat
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                Made by{' '}
                <a
                  href="https://yasir.qzz.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Yasir
                </a>
              </p>
            </div>
          </div>
        </div>
        {/* Right Section: Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <label htmlFor="provider-select" className="sr-only">
              Select AI Provider
            </label>
            <select
              id="provider-select"
              value={provider}
              onChange={(e) => onProviderChange(e.target.value as 'gemini' | 'huggingface' | 'deepseek')}
              disabled={isStreaming}
              className="px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-all"
              aria-label="Choose AI model provider"
            >
              <option value="gemini">Gemini</option>
              <option value="huggingface">Hugging Face</option>
              <option value="deepseek">DeepSeek-R1</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          <button
            onClick={onSystemPromptClick}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              systemMessage
                ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            aria-label="System prompt"
            title="Set system prompt"
          >
            <FiSettings className="w-5 h-5" />
          </button>

          {messagesCount > 0 && (
            <button
              onClick={onClearClick}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          )}

          <a
            href="/embeding"
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 flex items-center gap-1.5"
            title="Document Similarity"
          >
            <FiBookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Embeddings</span>
          </a>
        </div>
      </div>
    </header>
  );
}
