/**
 * @fileOverview A unified flow to summarize conversations in both online and offline modes.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const UnifiedSummarizeInputSchema = z.object({
	conversationText: z
		.string()
		.describe('The complete text of the chat conversation to summarize.'),
	mode: z.enum(['online', 'offline']).describe('The mode to use for summarization.'),
	apiKey: z.string().optional().describe('The API key for online mode.'),
	modelId: z.string().optional().describe('The model ID to use for online mode.'),
});

export type UnifiedSummarizeInput = z.infer<typeof UnifiedSummarizeInputSchema>;

const UnifiedSummarizeOutputSchema = z.object({
	summary: z.string().describe('A concise summary of the chat conversation.'),
});

export type UnifiedSummarizeOutput = z.infer<typeof UnifiedSummarizeOutputSchema>;

export async function unifiedSummarizeConversation(
	input: UnifiedSummarizeInput
): Promise<UnifiedSummarizeOutput> {
	const { conversationText, mode, apiKey, modelId } = input;

	try {
		if (mode === 'online' && apiKey) {
			// Online mode - use Gemini with provided API key
			const tempAI = genkit({
				plugins: [googleAI({ apiKey })],
			});

			const genkitModelId = modelId?.startsWith('googleai/')
				? modelId
				: `googleai/${modelId || 'gemini-2.0-flash-exp'}`;

			const result = await tempAI.generate({
				model: genkitModelId,
				system: 'You are an expert at summarizing conversations. Provide a concise and informative summary that captures the main points and topics discussed.',
				prompt: `Please summarize the following chat conversation:\n\n${conversationText}`,
			});

			return { summary: result.text };

		} else {
			// Offline mode - simulate local summarization
			await new Promise(resolve => setTimeout(resolve, 1000));

			const lines = conversationText.split('\n').filter(line => line.trim());
			const userMessages = lines.filter(line => line.startsWith('User:')).length;
			const aiMessages = lines.filter(line => line.startsWith('AI:') || line.startsWith('Assistant:')).length;

			const summary = `This conversation contains ${userMessages} user messages and ${aiMessages} AI responses. The discussion covers various topics exchanged between the user and the AI assistant. (This is a mock summary generated in offline mode - actual local LLM summarization would be implemented here.)`;

			return { summary };
		}
	} catch (error) {
		console.error('Error in unified summarize conversation:', error);
		throw new Error(`Failed to summarize conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}
