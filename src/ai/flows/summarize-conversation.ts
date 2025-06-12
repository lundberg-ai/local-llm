// Summarizes a chat conversation to provide a quick overview of the discussion.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConversationInputSchema = z.object({
  conversationText: z
    .string()
    .describe('The complete text of the chat conversation to summarize.'),
});

type SummarizeConversationInput = z.infer<typeof SummarizeConversationInputSchema>;

const SummarizeConversationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the chat conversation.'),
});

type SummarizeConversationOutput = z.infer<typeof SummarizeConversationOutputSchema>;

export async function summarizeConversation(
  input: SummarizeConversationInput
): Promise<SummarizeConversationOutput> {
  return summarizeConversationFlow(input);
}

const summarizeConversationPrompt = ai.definePrompt({
  name: 'summarizeConversationPrompt',
  input: {schema: SummarizeConversationInputSchema},
  output: {schema: SummarizeConversationOutputSchema},
  prompt: `Summarize the following chat conversation. Provide a concise and informative summary that captures the main points and topics discussed.\n\nConversation:\n{{{conversationText}}}`,
});

const summarizeConversationFlow = ai.defineFlow(
  {
    name: 'summarizeConversationFlow',
    inputSchema: SummarizeConversationInputSchema,
    outputSchema: SummarizeConversationOutputSchema,
  },
  async input => {
    const {output} = await summarizeConversationPrompt(input);
    return output!;
  }
);
