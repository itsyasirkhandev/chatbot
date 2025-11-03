'use client';

import { useState } from 'react';

interface SimilarityResult {
  similarity: number;
  document1Length: number;
  document2Length: number;
}

export default function EmbeddingPage() {
  const [document1, setDocument1] = useState('');
  const [document2, setDocument2] = useState('');
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!document1.trim() || !document2.trim()) {
      setError('Please enter both documents');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document1: document1.trim(),
          document2: document2.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate similarity');
      }

      const data = await response.json();
      console.log('Received similarity data:', data);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setDocument1('');
    setDocument2('');
    setResult(null);
    setError('');
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-50';
    if (similarity >= 0.6) return 'text-blue-600 bg-blue-50';
    if (similarity >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'Very Similar';
    if (similarity >= 0.6) return 'Similar';
    if (similarity >= 0.4) return 'Somewhat Similar';
    return 'Not Similar';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Chat
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Similarity
          </h1>
          <p className="text-gray-600">
            Compare two documents using Gemini embeddings to find their semantic similarity
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Document 1 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label htmlFor="document1" className="block text-sm font-semibold text-gray-900 mb-3">
              Document 1
            </label>
            <textarea
              id="document1"
              value={document1}
              onChange={(e) => setDocument1(e.target.value)}
              placeholder="Enter or paste your first document here..."
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
            <div className="mt-2 text-xs text-gray-500">
              Characters: {document1.length}
            </div>
          </div>

          {/* Document 2 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label htmlFor="document2" className="block text-sm font-semibold text-gray-900 mb-3">
              Document 2
            </label>
            <textarea
              id="document2"
              value={document2}
              onChange={(e) => setDocument2(e.target.value)}
              placeholder="Enter or paste your second document here..."
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
            <div className="mt-2 text-xs text-gray-500">
              Characters: {document2.length}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleCompare}
            disabled={isLoading || !document1.trim() || !document2.trim()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Calculating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Compare Documents
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-medium rounded-lg transition-all"
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similarity Results</h2>
            
            {/* Similarity Score */}
            <div className="mb-8 text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getSimilarityColor(result.similarity)} mb-4`}>
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {(result.similarity * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs font-medium mt-1">
                    Similarity
                  </div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {getSimilarityLabel(result.similarity)}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-gray-700">Similarity Score:</span>
                <span className="text-sm text-gray-600">{(result.similarity * 100).toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${result.similarity * 100}%` }}
                />
              </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Document 1</div>
                <div className="text-2xl font-bold text-gray-900">{result.document1Length}</div>
                <div className="text-xs text-gray-500 mt-1">characters</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Document 2</div>
                <div className="text-2xl font-bold text-gray-900">{result.document2Length}</div>
                <div className="text-xs text-gray-500 mt-1">characters</div>
              </div>
            </div>

            {/* Interpretation Guide */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Understanding the Score</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>80-100%</strong>: Documents are very similar in meaning</li>
                <li>• <strong>60-79%</strong>: Documents are similar with common themes</li>
                <li>• <strong>40-59%</strong>: Documents have some similarities</li>
                <li>• <strong>0-39%</strong>: Documents are quite different</li>
              </ul>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
          <div className="text-gray-600 space-y-2 text-sm">
            <p>
              This tool uses Google's Gemini embedding model to convert your documents into high-dimensional vectors that capture their semantic meaning.
            </p>
            <p>
              The similarity score is calculated using cosine similarity, which measures the angle between the two document vectors. A score of 1.0 (100%) means the documents are identical in meaning, while 0.0 (0%) means they have no semantic similarity.
            </p>
            <p className="font-medium text-gray-700 mt-4">
              Use cases:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Compare different versions of a document</li>
              <li>Find duplicate or similar content</li>
              <li>Check if two texts convey similar information</li>
              <li>Analyze semantic similarity for research</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
