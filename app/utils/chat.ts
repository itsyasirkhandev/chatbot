import { Message } from '../types';

export const CONVERSATIONS_KEY = 'ai-chat-conversations';
export const CURRENT_CONVERSATION_KEY = 'ai-chat-current-id';

export const SUGGESTED_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are the best practices for React development?",
  "Create a table comparing Next.js and Remix",
  "Help me debug this code",
  "Write a haiku about coding",
];

/**
 * Versatile thinking tag parser
 * Detects and extracts <think> content from any model response
 * Handles complete tags, partial/streaming tags, and variations in format
 * 
 * @param content - Raw message content from the model
 * @returns Object with thinking content, response content, and detection flag
 */
export function parseThinkingContent(content: string): { 
  thinking: string; 
  response: string; 
  hasThinkTag: boolean 
} {
  // Case-insensitive detection to handle variations
  const lowerContent = content.toLowerCase();
  const hasOpenTag = lowerContent.includes('<think>');
  const hasCloseTag = lowerContent.includes('</think>');
  
  if (!hasOpenTag) {
    // No thinking tags present
    return { thinking: '', response: content, hasThinkTag: false };
  }
  
  // Try to match complete thinking block (with case-insensitive flag)
  const completeThinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const completeMatch = content.match(completeThinkRegex);
  
  if (completeMatch) {
    // Complete thinking block found
    const thinking = completeMatch[1].trim();
    const response = content.replace(completeThinkRegex, '').trim();
    
    return {
      thinking,
      response,
      hasThinkTag: true,
    };
  }
  
  // Handle streaming/partial thinking tag
  if (hasOpenTag && !hasCloseTag) {
    const thinkStartIndex = lowerContent.indexOf('<think>');
    const actualStartIndex = content.substring(0, thinkStartIndex + 7).lastIndexOf('<think>') || thinkStartIndex;
    
    // Extract content after <think> tag (still streaming)
    const thinkingContent = content.substring(actualStartIndex + 7).trim();
    
    return {
      thinking: thinkingContent,
      response: '', // No response yet, still thinking
      hasThinkTag: true,
    };
  }
  
  // Edge case: has both tags but regex didn't match (malformed)
  // Treat as non-thinking content
  return { thinking: '', response: content, hasThinkTag: false };
}

/**
 * Generate conversation title from first user message
 */
export function generateTitle(messages: Message[]): string {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    const content = firstUserMsg.content.trim();
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }
  return 'New Chat';
}
