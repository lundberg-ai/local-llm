// This file handles chat responses using Genkit flows.
'use server';

/**
 * @fileOverview A flow to generate chat responses using Gemini.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateChatResponseInputSchema = z.object({
	message: z.string().describe('The user message to respond to.'),
	conversationHistory: z
		.string()
		.optional()
		.describe('The previous conversation context (optional).'),
	modelName: z
		.string()
		.optional()
		.describe('The name of the model being used for context.'),
});
export type GenerateChatResponseInput = z.infer<
	typeof GenerateChatResponseInputSchema
>;

const GenerateChatResponseOutputSchema = z.object({
	response: z.string().describe('The generated response to the user message.'),
});
export type GenerateChatResponseOutput = z.infer<
	typeof GenerateChatResponseOutputSchema
>;

export async function generateChatResponse(
	input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
	return generateChatResponseFlow(input);
}

const generateChatResponseFlow = ai.defineFlow(
	{
		name: 'generateChatResponse',
		inputSchema: GenerateChatResponseInputSchema,
		outputSchema: GenerateChatResponseOutputSchema,
	},
	async (input) => {
		const { message, conversationHistory, modelName } = input;

		let systemPrompt = `You are ${modelName || 'Gemini'}, a helpful AI assistant. Respond naturally and helpfully to the user's message.`;

		if (conversationHistory) {
			systemPrompt += `\n\nPrevious conversation context:\n${conversationHistory}`;
		}

		const response = await ai.generate({
			model: 'googleai/gemini-2.0-flash',
			system: systemPrompt,
			prompt: message,
		});

		return {
			response: response.text,
		};
	}
);
