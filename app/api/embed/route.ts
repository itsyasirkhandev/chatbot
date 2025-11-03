import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a rate limit error
      const isRateLimit = lastError.message?.includes('429') || 
                          lastError.message?.includes('quota') ||
                          lastError.message?.includes('rate limit');
      
      if (!isRateLimit || i === maxRetries - 1) {
        throw lastError;
      }
      
      // Wait before retrying with exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const { document1, document2 } = await req.json();

    if (!document1 || !document2) {
      return NextResponse.json(
        { error: 'Both documents are required' },
        { status: 400 }
      );
    }

    if (typeof document1 !== 'string' || typeof document2 !== 'string') {
      return NextResponse.json(
        { error: 'Documents must be strings' },
        { status: 400 }
      );
    }

    // Initialize LangChain Google Generative AI Embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004', // Using newer model with better rate limits
    });

    // Generate embeddings sequentially to avoid rate limits
    console.log('Generating embedding for document 1...');
    const embedding1 = await embeddings.embedQuery(document1);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Generating embedding for document 2...');
    const embedding2 = await embeddings.embedQuery(document2);

    console.log('Embedding results:', {
      dimensions: [embedding1.length, embedding2.length],
      firstFewValues1: embedding1?.slice(0, 5),
      firstFewValues2: embedding2?.slice(0, 5),
    });

    // Calculate cosine similarity
    const similarity = cosineSimilarity(embedding1, embedding2);
    
    console.log('Calculated similarity:', similarity);

    return NextResponse.json({
      similarity: Math.max(0, Math.min(1, similarity)), // Clamp between 0 and 1
      document1Length: document1.length,
      document2Length: document2.length,
      embeddingDimension: embedding1.length,
    });
  } catch (error) {
    console.error('Embedding API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate similarity';
    
    // Check if it's a rate limit error and provide helpful message
    const isRateLimit = errorMessage.includes('429') || 
                        errorMessage.includes('quota') ||
                        errorMessage.includes('rate limit');
    
    return NextResponse.json(
      { 
        error: isRateLimit 
          ? 'Rate limit exceeded. Please wait a moment and try again.' 
          : errorMessage 
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
