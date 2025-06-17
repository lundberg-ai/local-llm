# Aipify Local - Local & Online LLM Chat Interface

A Next.js application for chatting with both local and online LLMs, featuring a local backend with llama.cpp and Gemini integration.

## 🌟 Features

- **🔄 Dual Mode Operation**: Switch seamlessly between local and online modes
- **🏠 Local LLM Support**: Run local models using llama.cpp with JavaScript bindings
  - Mistral Magistral Small 2506 (mid-tier, ~14GB)
  - Qwen3 Embedding 4B (lightweight for laptops, ~2.3GB)
  - Gemma 3 1B IT (ultra-light for mobile, English only, ~700MB)
- **☁️ Online Mode**: Integrate with Google's Gemini models
- **💬 Multiple Chats**: Manage multiple concurrent chat sessions
- **🤖 AI Summarization**: Summarize conversations using local or online AI
- **📝 Automatic Title Generation**: Generate titles for conversations
- **🔑 Flexible API Key Management**: Support for both localStorage and environment variable API keys
- **🎨 Modern UI**: Beautiful and responsive interface with dark/light theme support

## 📁 Project Structure

```
├── src/                    # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   └── config/
├── backend/                # Backend (Node.js + llama.cpp)
│   ├── src/
│   ├── models/            # Downloaded LLM models
│   └── package.json
├── scripts/               # Startup scripts
│   ├── start.ps1         # PowerShell script
│   ├── start.sh          # Bash script
│   └── start.bat         # Windows batch script
└── package.json          # Frontend dependencies
```

## 🚀 Quick Start

### Option 1: Full Stack (Recommended)

Run both frontend and backend together:

**Windows (PowerShell):**
```powershell
npm run dev:full
```

**Windows (Batch):**
```cmd
.\scripts\start.bat
```

**Linux/macOS:**
```bash
./scripts/start.sh
```

### Option 2: Separate Servers

**Frontend only (online mode):**
```bash
npm install
npm run dev
```

**Backend setup:**
```bash
npm run setup-backend
cd backend
npm run setup-models -- --yes  # Downloads ~5GB of models
npm run dev
```

**Frontend with backend (offline mode):**
```bash
npm run dev:frontend
```

## ⚙️ Configuration

### Environment Variables

**Frontend (.env.local):**
```env
# Optional: for online mode
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# Optional: custom backend URL (defaults to http://localhost:3001)
BACKEND_URL=http://localhost:3001
```

**Backend (.env):**
```env
BACKEND_PORT=3001
ENABLE_GPU=true
LOG_LEVEL=info
```

### API Key Setup

For online mode with Gemini:

1. **Environment Variable** (Recommended): Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

2. **In-App Settings**: Use the settings dialog to set your API key manually

## 📖 Usage

### Switching Modes

- **Offline Mode**: Uses local LLM models via the backend server
- **Online Mode**: Uses Google Gemini API (requires API key)

Use the mode selector in the sidebar to switch between modes.

### Local Models

The backend supports these models:
- **Magistral Small 2506**: Mid-tier chat model (~14GB) - Best balance of quality and performance
- **Qwen3 Embedding 4B**: Lightweight model (~2.3GB) - Optimized for laptops with limited resources
- **Gemma 3 1B IT**: Ultra-light model (~700MB) - Designed for mobile devices, English only

Models are automatically downloaded when you run the setup script.

### Chat Features

- Create multiple chat sessions
- Switch between different models
- Summarize conversations
- Auto-generate chat titles
- Export/import chat history (coming soon)

## 🛠️ Development

### Frontend Development
```bash
npm run dev:frontend
npm run build
npm run lint
npm run typecheck
```

### Backend Development
```bash
cd backend
npm run dev
npm run start
```

### Available Scripts

- `npm run dev:full` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run setup-backend` - Install backend dependencies
- `npm run setup-models` - Download LLM models

## 🚚 Deployment

### Vercel (Online Mode Only)

The project is configured for Vercel deployment with `.vercelignore` that excludes backend files:

```bash
vercel deploy
```

**Note**: Vercel deployment only supports online mode. Backend files are excluded from deployment.

### Self-Hosted (Full Stack)

For full offline capability, deploy to your own server:

1. Clone the repository
2. Run the full setup: `npm run setup-backend && cd backend && npm run setup-models -- --yes`
3. Start with: `npm run dev:full`

## 📋 System Requirements

### Minimum (Gemma 3 1B)
- Node.js 18.0.0+
- 4GB RAM
- 2GB free storage
- Modern web browser

### Recommended (Qwen3 4B)
- Node.js 20.0.0+
- 8GB RAM  
- 5GB free storage
- Modern web browser

### High-Performance (Magistral Small)
- Node.js 20.0.0+
- 16GB+ RAM
- CUDA-compatible GPU (for acceleration)
- 20GB+ free storage

## 🔧 Troubleshooting

### Backend Issues
- **Models not loading**: Run `cd backend && npm run setup-models -- --yes`
- **GPU issues**: Set `ENABLE_GPU=false` in `backend/.env`
- **Port conflicts**: Change `BACKEND_PORT` in `backend/.env`

### Frontend Issues  
- **API key errors**: Check your Gemini API key in settings
- **Mode switching**: Ensure backend is running for offline mode
- **Build errors**: Run `npm run typecheck` to check TypeScript issues

### Common Solutions
- Clear browser cache and localStorage
- Restart both frontend and backend servers
- Check firewall settings for local connections
- Verify model files exist in `backend/models/`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ❓ Support

If you encounter any issues:
1. Check the troubleshooting section
2. Look at existing GitHub issues
3. Create a new issue with detailed information

---

**Enjoy chatting with your local and online LLMs! 🎉**
   
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
