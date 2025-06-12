import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateTitleRequest {
	conversationHistory: string;
	apiKey?: string;
	modelId?: string;
}

export async function POST(request: NextRequest) {
	try {
		const { conversationHistory, apiKey, modelId }: GenerateTitleRequest = await request.json();

		if (!conversationHistory) {
			return NextResponse.json({ error: 'Conversation history is required' }, { status: 400 });
		}

		if (!apiKey) {
			// For offline mode or when no API key is provided, generate a simple title
			const lines = conversationHistory.split('\n').filter(line => line.trim());
			const firstUserMessage = lines.find(line => line.toLowerCase().includes('user:') || line.toLowerCase().includes('human:'));

			let title = 'New Conversation';
			if (firstUserMessage) {
				const messageContent = firstUserMessage.replace(/^(user:|human:)/i, '').trim();
				title = messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent;
			}

			return NextResponse.json({ title });
		}

		// Online mode - use Gemini to generate a title
		const genAI = new GoogleGenerativeAI(apiKey);
		const selectedModel = modelId || 'gemini-2.0-flash-exp';
		const model = genAI.getGenerativeModel({ model: selectedModel });

		const prompt = `You are an expert at generating concise and descriptive titles for conversations.
    Given the following conversation history, generate a title that accurately reflects the main topic of the conversation.
    The title should be no more than 10 words.

    Conversation History: ${conversationHistory}
    
    Please respond with just the title, nothing else.`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const title = response.text().trim();

		return NextResponse.json({ title });

	} catch (error: unknown) {
		console.error('Generate title API error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		// Handle specific API errors
		if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
			return NextResponse.json({ error: 'Invalid API key provided' }, { status: 401 });
		}

		if (errorMessage.includes('quota')) {
			return NextResponse.json({ error: 'API quota exceeded' }, { status: 429 });
		}

		return NextResponse.json(
			{ error: `Failed to generate title: ${errorMessage}` },
			{ status: 500 }
		);
	}
}
