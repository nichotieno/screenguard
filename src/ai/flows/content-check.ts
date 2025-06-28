'use server';

import {ai} from '../genkit';
import {z} from 'zod';

const isObjectionableFlow = ai.defineFlow(
  {
    name: 'isObjectionableFlow',
    inputSchema: z.string(),
    outputSchema: z.boolean(),
    description: 'Checks if a given text contains objectionable content.',
  },
  async (text) => {
    const llmResponse = await ai.generate({
      prompt: `Analyze the following text. Does it contain objectionable, harmful, or inappropriate content? The text is: "${text}". Respond with only 'true' or 'false'.`,
      temperature: 0.1,
    });
    
    const responseText = llmResponse.text.trim().toLowerCase();
    
    if (responseText === 'true') {
      return true;
    }
    if (responseText === 'false') {
      return false;
    }

    // Fallback if the model doesn't follow instructions perfectly
    console.warn(`LLM returned unexpected response: "${responseText}". Defaulting to false.`);
    return false;
  }
);

export async function isObjectionable(text: string): Promise<boolean> {
    return isObjectionableFlow(text);
}
