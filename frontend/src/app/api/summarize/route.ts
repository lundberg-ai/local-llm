import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SummarizeRequest {
	conversationText?: string;
	conversation?: Array<{ role: string; content: string }>;
	mode?: string;
	apiKey?: string;
	modelId?: string;
}

export async function POST(request: NextRequest) {
	try {
		const { conversationText, conversation, mode = 'online', apiKey, modelId }: SummarizeRequest = await request.json();

		// Handle conversation array format
		let textToSummarize = conversationText;
		if (!textToSummarize && conversation && Array.isArray(conversation)) {
			textToSummarize = conversation
				.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
				.join('\n');
		}

		if (!textToSummarize) {
			return NextResponse.json({ error: 'Conversation text or conversation array is required' }, { status: 400 });
		}

		// Handle offline mode
		if (mode === 'offline') {
			try {
				const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
				const response = await fetch(`${backendUrl}/api/summarize`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						conversation: conversation || []
					}),
				});

				if (!response.ok) {
					throw new Error('Backend summarization failed');
				}

				const data = await response.json();
				return NextResponse.json({ summary: data.summary });
			} catch (error) {
				console.error('Local backend summarization error:', error);

				// Fallback to simple summarization
				const lines = textToSummarize.split('\n').filter(line => line.trim());
				const userMessages = lines.filter(line => line.startsWith('User:')).length;
				const aiMessages = lines.filter(line => line.startsWith('AI:') || line.startsWith('Assistant:')).length;

				const summary = `This conversation contains ${userMessages} user messages and ${aiMessages} AI responses. The discussion covers various topics exchanged between the user and the AI assistant. (Local backend unavailable - using simple summarization)`;
				return NextResponse.json({ summary });
			}
		}

		if (mode === 'online') {
			if (!apiKey) {
				return NextResponse.json({ error: 'API key is required for online mode' }, { status: 400 });
			}

			// Use Google AI SDK for online summarization
			const genAI = new GoogleGenerativeAI(apiKey);
			const selectedModel = modelId || 'gemini-2.0-flash-exp';
			const model = genAI.getGenerativeModel({ model: selectedModel });

			const prompt = `Please provide a concise and informative summary of the following chat conversation. Capture the main points and topics discussed:\n\n${textToSummarize}`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const summary = response.text();

			return NextResponse.json({ summary });

		} else {
			// Default fallback
			const lines = textToSummarize.split('\n').filter(line => line.trim());
			const userMessages = lines.filter(line => line.startsWith('User:')).length;
			const aiMessages = lines.filter(line => line.startsWith('AI:') || line.startsWith('Assistant:')).length;

			const summary = `This conversation contains ${userMessages} user messages and ${aiMessages} AI responses. The discussion covers various topics exchanged between the user and the AI assistant.`;

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
