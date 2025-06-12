import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export async function POST(request: NextRequest) {
	try {
		const { message, conversationHistory, apiKey, modelId } = await request.json();

		if (!message) {
			return NextResponse.json({ error: 'Message is required' }, { status: 400 });
		}

		if (!apiKey) {
			return NextResponse.json({ error: 'API key is required for online mode' }, { status: 400 });
		}

		// Default to latest Gemini model if not specified
		const selectedModel = modelId || 'gemini-2.0-flash-exp';

		// Use the Google AI SDK directly to make the API call
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: selectedModel });

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

		return NextResponse.json({ response: text });
	} catch (error: unknown) {
		console.error('Chat API error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		// Handle specific API errors
		if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
			return NextResponse.json({ error: 'Invalid API key provided' }, { status: 401 });
		}

		if (errorMessage.includes('quota')) {
			return NextResponse.json({ error: 'API quota exceeded' }, { status: 429 });
		}

		return NextResponse.json({
			error: 'Failed to generate response',
			details: errorMessage
		}, { status: 500 });
	}
}
