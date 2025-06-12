import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SummarizeRequest {
	conversationText: string;
	mode: 'online' | 'offline';
	apiKey?: string;
	modelId?: string;
}

export async function POST(request: NextRequest) {
	try {
		const { conversationText, mode, apiKey, modelId }: SummarizeRequest = await request.json();

		if (!conversationText) {
			return NextResponse.json({ error: 'Conversation text is required' }, { status: 400 });
		}

		if (mode === 'online') {
			if (!apiKey) {
				return NextResponse.json({ error: 'API key is required for online mode' }, { status: 400 });
			}

			// Use Google AI SDK for online summarization
			const genAI = new GoogleGenerativeAI(apiKey);
			const selectedModel = modelId || 'gemini-2.0-flash-exp';
			const model = genAI.getGenerativeModel({ model: selectedModel });

			const prompt = `Please provide a concise and informative summary of the following chat conversation. Capture the main points and topics discussed:\n\n${conversationText}`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const summary = response.text();

			return NextResponse.json({ summary });

		} else {
			// Offline mode - simulate local summarization
			await new Promise(resolve => setTimeout(resolve, 1000));

			const lines = conversationText.split('\n').filter(line => line.trim());
			const userMessages = lines.filter(line => line.startsWith('User:')).length;
			const aiMessages = lines.filter(line => line.startsWith('AI:') || line.startsWith('Assistant:')).length;

			const summary = `This conversation contains ${userMessages} user messages and ${aiMessages} AI responses. The discussion covers various topics exchanged between the user and the AI assistant. (This is a mock summary generated in offline mode - actual local LLM summarization would be implemented here.)`;

			return NextResponse.json({ summary });
		}

	} catch (error: unknown) {
		console.error('Summarize API error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		// Handle specific API errors
		if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
			return NextResponse.json({ error: 'Invalid API key provided' }, { status: 401 });
		}

		if (errorMessage.includes('quota')) {
			return NextResponse.json({ error: 'API quota exceeded' }, { status: 429 });
		}

		return NextResponse.json(
			{ error: `Failed to summarize conversation: ${errorMessage}` },
			{ status: 500 }
		);
	}
}
