/**
 * Test file for versatile thinking detection
 * Run with: node test-thinking-detection.js
 */

function parseThinkingContent(content) {
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

// Test cases
console.log('Testing Versatile Thinking Detection\n');
console.log('=' .repeat(60));

// Test 1: Complete thinking block
console.log('\n1. Complete thinking block:');
const test1 = `<think>
I need to analyze this problem carefully.
Let me break it down step by step.
</think>

Here is my final answer based on the analysis.`;
console.log('Input:', JSON.stringify(test1));
console.log('Result:', parseThinkingContent(test1));

// Test 2: No thinking tags
console.log('\n2. No thinking tags:');
const test2 = 'This is a simple response without any thinking.';
console.log('Input:', JSON.stringify(test2));
console.log('Result:', parseThinkingContent(test2));

// Test 3: Streaming (incomplete) thinking
console.log('\n3. Streaming thinking (incomplete):');
const test3 = '<think>This is my reasoning process so far...';
console.log('Input:', JSON.stringify(test3));
console.log('Result:', parseThinkingContent(test3));

// Test 4: Empty thinking tags
console.log('\n4. Empty thinking tags:');
const test4 = '<think></think>\n\nThe response content.';
console.log('Input:', JSON.stringify(test4));
console.log('Result:', parseThinkingContent(test4));

// Test 5: Case variations
console.log('\n5. Case variations (uppercase THINK):');
const test5 = '<THINK>Uppercase thinking</THINK>\nResponse here.';
console.log('Input:', JSON.stringify(test5));
console.log('Result:', parseThinkingContent(test5));

// Test 6: Multiple paragraphs in thinking
console.log('\n6. Multiple paragraphs in thinking:');
const test6 = `<think>
First paragraph of thinking.

Second paragraph with more details.

Third paragraph concluding the reasoning.
</think>

Final answer after all that thinking.`;
console.log('Input:', JSON.stringify(test6));
console.log('Result:', parseThinkingContent(test6));

// Test 7: Mixed case
console.log('\n7. Mixed case (Think):');
const test7 = '<Think>Mixed case thinking</Think>\nResponse.';
console.log('Input:', JSON.stringify(test7));
console.log('Result:', parseThinkingContent(test7));

console.log('\n' + '='.repeat(60));
console.log('\nAll tests completed! ✓');
