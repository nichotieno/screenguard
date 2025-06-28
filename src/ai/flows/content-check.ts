'use server';

import {ai} from '../genkit';
import {z} from 'zod';

// Define a structured input schema for better type safety and clarity.
const ContentAnalysisInputSchema = z.object({
  text: z.string(),
});

const ContentAnalysisSchema = z.object({
  isObjectionable: z
    .boolean()
    .describe('Whether or not the input is objectionable.'),
  reason: z
    .string()
    .describe(
      "A brief, user-friendly explanation for why the content was flagged. If not objectionable, this should be 'Content appears to be safe.'."
    ),
  category: z
    .enum(['Hate Speech', 'Violence', 'Self-Harm', 'Spam', 'Other', 'Safe'])
    .describe('The category of the content.'),
});
export type ContentAnalysis = z.infer<typeof ContentAnalysisSchema>;

const contentAnalysisPrompt = ai.definePrompt({
  name: 'contentAnalysisPrompt',
  // Use the structured input schema.
  input: {schema: ContentAnalysisInputSchema},
  output: {schema: ContentAnalysisSchema},
  // Add a system instruction to define the AI's role.
  system: `You are a content moderation expert. Your task is to analyze text for any objectionable material.`,
  // Update the prompt to use Handlebars syntax.
  prompt: `Analyze the following text for objectionable content. Categorize it and provide a brief, user-friendly reason for your analysis. The text is: "{{{text}}}"`,
});

const contentAnalysisFlow = ai.defineFlow(
  {
    name: 'contentAnalysisFlow',
    // The flow now expects the structured input object.
    inputSchema: ContentAnalysisInputSchema,
    outputSchema: ContentAnalysisSchema,
    description:
      'Checks if a given text contains objectionable content and provides analysis.',
  },
  async (input) => {
    const {output} = await contentAnalysisPrompt(input);
    return output!;
  }
);

// The exported function still accepts a simple string for convenience.
export async function analyzeContent(text: string): Promise<ContentAnalysis> {
  // It wraps the text in the required object structure before calling the flow.
  return contentAnalysisFlow({ text });
}
