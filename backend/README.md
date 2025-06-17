# Local LLM Backend

A Node.js backend server for running local LLM models using llama.cpp bindings.

## Features

- **Local LLM Support**: Run Mistral, Qwen, and Gemma models locally
- **REST API**: Compatible with the frontend chat interface
- **GPU Acceleration**: Automatic GPU acceleration when available
- **Model Management**: Easy model downloading and setup
- **Embedding Support**: Generate embeddings using Qwen3-Embedding

## Supported Models

- **mistralai/Magistral-Small-2506_gguf**: Mid-tier chat model (~14GB) - Best balance of quality and performance
- **Qwen/Qwen3-Embedding-4B-GGUF**: Lightweight model (~2.3GB) - Optimized for laptops with limited resources  
- **google/gemma-3-1b-it-qat-q4_0-gguf**: Ultra-light model (~700MB) - Designed for mobile devices, English only

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Download models:**
   ```bash
   npm run setup-models -- --yes
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Chat
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "conversationHistory": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "modelId": "chat"
}
```

### Generate Embeddings
```bash
POST /api/embeddings
Content-Type: application/json

{
  "text": "Text to generate embeddings for"
}
```

### Summarize Conversation
```bash
POST /api/summarize
Content-Type: application/json

{
  "conversation": [
    {"role": "user", "content": "Message 1"},
    {"role": "assistant", "content": "Response 1"}
  ]
}
```

### Generate Title
```bash
POST /api/generate-title
Content-Type: application/json

{
  "conversation": [
    {"role": "user", "content": "First message of conversation"}
  ]
}
```

## Configuration

Copy `.env.example` to `.env` and adjust settings as needed:

```env
BACKEND_PORT=3001
ENABLE_GPU=true
LOG_LEVEL=info
```

## System Requirements

- **Node.js**: 18.0.0 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for models
- **GPU** (Optional): CUDA-compatible GPU for acceleration

## Troubleshooting

### Models not loading
1. Ensure models are downloaded: `npm run setup-models -- --yes`
2. Check models directory: `ls models/`
3. Verify file permissions

### GPU acceleration not working
1. Ensure CUDA is installed
2. Check GPU memory availability
3. Set `ENABLE_GPU=false` in `.env` to disable

### Performance issues
1. Reduce context size in model config
2. Lower temperature and top_p values
3. Use smaller models (Gemma 1B instead of Magistral)

## Development

Start in development mode with auto-reload:
```bash
npm run dev
```

The server will automatically restart when files change.
