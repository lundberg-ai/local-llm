import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export async function handleChatRoute(req: Request, res: Response) {
	// console.log('Request body:', req.body); // Log the entire request body
	try {
		const { message, conversationHistory, apiKey } = req.body;

		if (!message) {
			return res.status(400).json({ error: 'Message is required' });
		}

		if (!apiKey) {
			return res.status(400).json({ error: 'API key is required for online mode' });
		}

		// Use the Google AI SDK directly to make the API call
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		// Prepare the prompt with conversation history if available
		let prompt = message;
		if (conversationHistory && conversationHistory.length > 0) {
			const historyText = conversationHistory
				.map((msg: ChatMessage) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
				.join('\n');
			prompt = `Previous conversation:\n${historyText}\n\nHuman: ${message}`;
		}

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		return res.json({ response: text });
	} catch (error: unknown) {
		console.error('Chat API error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		// Handle specific API errors
		if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
			return res.status(401).json({ error: 'Invalid API key provided' });
		}

		if (errorMessage.includes('quota')) {
			return res.status(429).json({ error: 'API quota exceeded' });
		}

		return res.status(500).json({
			error: 'Failed to generate response',
			details: errorMessage
		});
	}
}
