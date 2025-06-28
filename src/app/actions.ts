'use server';

import {analyzeContent, ContentAnalysis} from '@/ai/flows/content-check';

export async function checkContent(text: string): Promise<ContentAnalysis> {
  if (!text.trim()) {
    return {
      isObjectionable: false,
      reason: 'Content is empty.',
      category: 'Safe',
    };
  }

  try {
    const result = await analyzeContent(text);
    return result;
  } catch (error) {
    console.error('Error checking content with AI:', error);
    // In case of an error with the AI service, fail safe (don't block).
    return {
      isObjectionable: false,
      reason: 'AI analysis service is currently unavailable.',
      category: 'Safe',
    };
  }
}
