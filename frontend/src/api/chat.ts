import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export async function postChat({ message, conversationHistory, apiKey }: {
	message: string;
	conversationHistory: ChatMessage[];
	apiKey: string;
}) {
	if (!message) {
		throw new Error('Message is required');
	}

	if (!apiKey) {
		throw new Error('API key is required for online mode');
	}

	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

	let prompt = message;
	if (conversationHistory && conversationHistory.length > 0) {
		const historyText = conversationHistory
			.map((msg) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
			.join('\n');
		prompt = `Previous conversation:\n${historyText}\n\nHuman: ${message}`;
	}

	const result = await model.generateContent(prompt);
	return result.response.text();
}
