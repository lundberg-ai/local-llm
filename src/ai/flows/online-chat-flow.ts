
/**
 * @fileOverview A flow to handle online chat with Gemini using a user-provided API key.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']), // Gemini uses 'user' and 'model'
  parts: z.array(z.object({ text: z.string() })),
});
export type HistoryItem = z.infer<typeof HistoryItemSchema>;

const OnlineChatInputSchema = z.object({
  userMessage: z.string().describe("The user's current message."),
  history: z.array(HistoryItemSchema).describe('The conversation history, where roles are "user" or "model".'),
  apiKey: z.string().describe('The Gemini API key.'),
  modelId: z.string().optional().default('googleai/gemini-2.0-flash').describe('The Gemini model to use (e.g., "googleai/gemini-pro", "googleai/gemini-1.5-flash-latest").'),
});
export type OnlineChatInput = z.infer<typeof OnlineChatInputSchema>;

const OnlineChatOutputSchema = z.object({
  assistantResponse: z.string().describe('The response from the Gemini model.'),
});
export type OnlineChatOutput = z.infer<typeof OnlineChatOutputSchema>;

export async function onlineChatFlow(input: OnlineChatInput): Promise<OnlineChatOutput> {
  const { userMessage, history, apiKey, modelId } = input;

  const tempAI = genkit({
    plugins: [googleAI({ apiKey })],
  });
  try {
    // Convert history to a conversation context string
    const conversationContext = history.length > 0
      ? history.map(item => {
        const role = item.role === 'model' ? 'Assistant' : 'User';
        const text = item.parts.map(part => part.text).join(' ');
        return `${role}: ${text}`;
      }).join('\n')
      : '';

    const systemPrompt = conversationContext
      ? `Previous conversation:\n${conversationContext}\n\nPlease respond naturally to the user's current message.`
      : 'You are a helpful AI assistant. Respond naturally and helpfully to the user\'s message.';

    const result = await tempAI.generate({
      model: modelId || 'googleai/gemini-2.0-flash-exp',
      system: systemPrompt,
      prompt: userMessage,
    });

    const responseText = result.text;

    if (responseText === undefined || responseText === null) {
      console.warn("Gemini model returned undefined or null text response.", result);
      throw new Error('No response text from Gemini model. The response might be blocked or empty.');
    }

    return { assistantResponse: responseText };

  } catch (error) {
    console.error("Error in onlineChatFlow:", error);
    if (error instanceof Error) {
      if (error.message.includes('API key not valid') || error.message.includes('permission') || error.message.includes('authenticate')) {
        throw new Error('Invalid or unauthorized API Key for Gemini. Please check your key and permissions.');
      }
      // Check for blocked content - Gemini API might return specific errors or empty responses for safety reasons.
      // The Genkit result object might have more details if the response was blocked.
      // Example: result.candidates[0].finishReason === 'SAFETY'
      // For now, rethrow a generic error if it's not an API key issue.
    }
    throw new Error('Failed to get response from Gemini model. ' + (error instanceof Error ? error.message : String(error)));
  }
}
