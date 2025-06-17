const express = require('express');
const cors = require('cors');
const path = require('path');
const { LlamaCpp } = require('node-llama-cpp');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Global variables for models
let chatModel = null;
let embeddingModel = null;

// Model configurations
const MODEL_CONFIGS = {
	chat: {
		path: path.join(__dirname, '../models/magistral-small-2506.gguf'),
		modelName: 'mistralai/Magistral-Small-2506_gguf',
		contextSize: 8192,
		gpu: true
	},
	embedding: {
		path: path.join(__dirname, '../models/qwen3-embedding-4b.gguf'),
		modelName: 'Qwen/Qwen3-Embedding-4B-GGUF',
		contextSize: 512,
		gpu: true
	},
	gemma: {
		path: path.join(__dirname, '../models/gemma-3-1b-it-qat-q4_0.gguf'),
		modelName: 'google/gemma-3-1b-it-qat-q4_0-gguf',
		contextSize: 4096,
		gpu: true
	}
};

// Initialize models
async function initializeModels() {
	try {
		console.log('🚀 Initializing LLM models...');

		// Check if model files exist
		const fs = require('fs');
		const chatModelExists = fs.existsSync(MODEL_CONFIGS.chat.path);
		const embeddingModelExists = fs.existsSync(MODEL_CONFIGS.embedding.path);

		if (!chatModelExists) {
			console.warn('⚠️  Chat model not found. Please download models using the setup script.');
			console.warn(`Expected path: ${MODEL_CONFIGS.chat.path}`);
		} else {
			// Initialize chat model (Magistral)
			console.log('Loading chat model (Magistral)...');
			const llamaCpp = new LlamaCpp();
			chatModel = await llamaCpp.load(MODEL_CONFIGS.chat.path, {
				nCtx: MODEL_CONFIGS.chat.contextSize,
				nGpuLayers: MODEL_CONFIGS.chat.gpu ? -1 : 0
			});
			console.log('✅ Chat model loaded successfully');
		}

		if (!embeddingModelExists) {
			console.warn('⚠️  Embedding model not found. Please download models using the setup script.');
			console.warn(`Expected path: ${MODEL_CONFIGS.embedding.path}`);
		} else {
			// Initialize embedding model (Qwen3)
			console.log('Loading embedding model (Qwen3)...');
			const embeddingLlamaCpp = new LlamaCpp();
			embeddingModel = await embeddingLlamaCpp.load(MODEL_CONFIGS.embedding.path, {
				nCtx: MODEL_CONFIGS.embedding.contextSize,
				nGpuLayers: MODEL_CONFIGS.embedding.gpu ? -1 : 0,
				embedding: true
			});
			console.log('✅ Embedding model loaded successfully');
		}

		console.log('🎉 Model initialization completed!');
	} catch (error) {
		console.error('❌ Error initializing models:', error.message);
		console.log('💡 Make sure you have downloaded the models using: npm run setup-models');
	}
}

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		models: {
			chat: chatModel ? 'loaded' : 'not loaded',
			embedding: embeddingModel ? 'loaded' : 'not loaded'
		},
		timestamp: new Date().toISOString()
	});
});

// Model info endpoint
app.get('/api/models', (req, res) => {
	res.json({
		available: Object.keys(MODEL_CONFIGS).map(key => ({
			id: key,
			name: MODEL_CONFIGS[key].modelName,
			loaded: key === 'chat' ? !!chatModel : key === 'embedding' ? !!embeddingModel : false
		}))
	});
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
	try {
		const { message, conversationHistory, modelId = 'chat' } = req.body;

		if (!message) {
			return res.status(400).json({ error: 'Message is required' });
		}

		if (!chatModel) {
			return res.status(503).json({
				error: 'Chat model not loaded. Please ensure models are downloaded and initialized.'
			});
		}

		// Prepare the prompt with conversation history
		let prompt = message;
		if (conversationHistory && conversationHistory.length > 0) {
			const historyText = conversationHistory
				.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
				.join('\n');
			prompt = `Previous conversation:\n${historyText}\n\nHuman: ${message}\n\nAssistant:`;
		} else {
			prompt = `Human: ${message}\n\nAssistant:`;
		}

		// Generate response
		const response = await chatModel.complete(prompt, {
			maxTokens: 1024,
			temperature: 0.7,
			topP: 0.9,
			stop: ['Human:', 'Assistant:']
		});

		res.json({ response: response.trim() });
	} catch (error) {
		console.error('Chat error:', error);
		res.status(500).json({ error: 'Internal server error during chat generation' });
	}
});

// Generate embeddings endpoint
app.post('/api/embeddings', async (req, res) => {
	try {
		const { text } = req.body;

		if (!text) {
			return res.status(400).json({ error: 'Text is required' });
		}

		if (!embeddingModel) {
			return res.status(503).json({
				error: 'Embedding model not loaded. Please ensure models are downloaded and initialized.'
			});
		}

		const embeddings = await embeddingModel.getEmbedding(text);
		res.json({ embeddings });
	} catch (error) {
		console.error('Embedding error:', error);
		res.status(500).json({ error: 'Internal server error during embedding generation' });
	}
});

// Summarize conversation endpoint
app.post('/api/summarize', async (req, res) => {
	try {
		const { conversation } = req.body;

		if (!conversation || !Array.isArray(conversation)) {
			return res.status(400).json({ error: 'Conversation array is required' });
		}

		if (!chatModel) {
			return res.status(503).json({
				error: 'Chat model not loaded. Please ensure models are downloaded and initialized.'
			});
		}

		const conversationText = conversation
			.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
			.join('\n');

		const prompt = `Please provide a brief, concise summary of the following conversation:\n\n${conversationText}\n\nSummary:`;

		const summary = await chatModel.complete(prompt, {
			maxTokens: 256,
			temperature: 0.3,
			topP: 0.8
		});

		res.json({ summary: summary.trim() });
	} catch (error) {
		console.error('Summarize error:', error);
		res.status(500).json({ error: 'Internal server error during summarization' });
	}
});

// Generate title endpoint
app.post('/api/generate-title', async (req, res) => {
	try {
		const { conversation } = req.body;

		if (!conversation || !Array.isArray(conversation)) {
			return res.status(400).json({ error: 'Conversation array is required' });
		}

		if (!chatModel) {
			return res.status(503).json({
				error: 'Chat model not loaded. Please ensure models are downloaded and initialized.'
			});
		}

		const firstMessage = conversation[0]?.content || '';
		const prompt = `Generate a short, descriptive title (3-6 words) for a conversation that starts with: "${firstMessage}"\n\nTitle:`;

		const title = await chatModel.complete(prompt, {
			maxTokens: 20,
			temperature: 0.5,
			topP: 0.8
		});

		res.json({ title: title.trim().replace(/^["']|["']$/g, '') });
	} catch (error) {
		console.error('Title generation error:', error);
		res.status(500).json({ error: 'Internal server error during title generation' });
	}
});

// Error handling middleware
app.use((error, req, res, next) => {
	console.error('Unhandled error:', error);
	res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
	await initializeModels();

	app.listen(PORT, () => {
		console.log(`🚀 Local LLM Backend server running on http://localhost:${PORT}`);
		console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
		console.log(`🤖 Models info: http://localhost:${PORT}/api/models`);
	});
}

// Handle graceful shutdown
process.on('SIGINT', () => {
	console.log('\n🛑 Shutting down server...');
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('\n🛑 Shutting down server...');
	process.exit(0);
});

startServer().catch(console.error);
