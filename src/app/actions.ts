'use server';

import {isObjectionable} from '@/ai/flows/content-check';

export async function checkContent(text: string): Promise<boolean> {
  if (!text.trim()) return false;

  try {
    const result = await isObjectionable(text);
    return result;
  } catch (error) {
    console.error('Error checking content with AI:', error);
    // In case of an error with the AI service, fail safe (don't block).
    return false;
  }
}
