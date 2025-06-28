'use server';

import {ai} from '../genkit';
import {z} from 'zod';

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
  input: {schema: z.string()},
  output: {schema: ContentAnalysisSchema},
  prompt: `Analyze the following text for objectionable content. Categorize it and provide a brief, user-friendly reason for your analysis. The text is: "[[text]]"`,
});

const contentAnalysisFlow = ai.defineFlow(
  {
    name: 'contentAnalysisFlow',
    inputSchema: z.string(),
    outputSchema: ContentAnalysisSchema,
    description:
      'Checks if a given text contains objectionable content and provides analysis.',
  },
  async (text) => {
    const {output} = await contentAnalysisPrompt(text);
    return output!;
  }
);

export async function analyzeContent(text: string): Promise<ContentAnalysis> {
  return contentAnalysisFlow(text);
}
