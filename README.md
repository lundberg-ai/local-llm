# Aipify Local - Local LLM Chat Interface

A Next.js application for chatting with both local and online LLMs, featuring Docker-based local models and Gemini integration.

## Features

- **Local LLM Support**: Run local models like Llama 3, Mistral, and Phi-3 in Docker containers
- **Online Mode**: Integrate with Google's Gemini models
- **Multiple Chats**: Manage multiple concurrent chat sessions
- **AI Summarization**: Summarize conversations using AI
- **Automatic Title Generation**: Generate titles for conversations
- **Flexible API Key Management**: Support for both localStorage and environment variable API keys

## Getting Started

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key (Optional):**
   
   For online mode with Gemini, you can set your API key in two ways:
   
   - **Environment Variable (Recommended)**: Add your API key to the `.env` file in the project root:
     ```env
     NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
     ```
   
   - **In-App Settings**: Use the settings dialog in the app to set your API key manually
   
   Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

## API Key Priority

The application uses the following priority for API keys:

1. **localStorage**: API key set through the in-app settings dialog
2. **Environment Variable**: `NEXT_PUBLIC_GEMINI_API_KEY` from `.env`
3. **None**: Online mode will be available but won't function without a key

This allows you to:
- Set a default API key via environment variables for deployment
- Override it locally through the app settings when needed
- Deploy to platforms like Vercel with environment variables configured

## Development

To get started with development, take a look at `src/app/page.tsx` for the main application logic.
