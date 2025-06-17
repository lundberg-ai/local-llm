# Aipify Local - Dual-Mode LLM Chat Interface

A modern chat interface that works both online (with Gemini API) and offline (with local LLMs via llama.cpp). Built with Next.js and Node.js for a seamless experience across all deployment scenarios.

## 🌟 Features

### 🔄 **Dual Mode Operation**
- **🌐 Online Mode**: Google Gemini API integration (gemini-1.5-flash, gemini-2.0-flash-exp)
- **🏠 Offline Mode**: Local LLM inference using llama.cpp with JavaScript bindings

### 🤖 **Supported Local Models**
- **Magistral Small 2506** (~14GB) - Mid-tier model for best quality/performance balance
- **Qwen3 Embedding 4B** (~2.3GB) - Lightweight model optimized for laptops
- **Gemma 3 1B IT** (~700MB) - Ultra-light model for mobile devices (English only)

### 💬 **Chat Features**
- Multiple concurrent chat sessions
- Real-time conversation management
- AI-powered conversation summarization
- Automatic title generation for chats
- Seamless mode switching between online/offline

### 🎨 **Modern UI Design**
- **Primary Color**: Vibrant teal (#008080) - Aipify brand essence
- **Background**: Dark slate gray (#2F4F4F) - Sleek modern dark design
- **Accent**: Electric blue (#7DF9FF) - Interactive elements and highlights
- **Typography**: Inter font for clean readability, Source Code Pro for code
- **Icons**: Minimalist design in electric blue accent color
- **Interface**: Tabbed design for optimal multi-chat management

## 📁 Project Structure

```
local-llm/
├── 📁 frontend/              # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/         # API routes (dual-mode support)
│   │   │   │   ├── chat/
│   │   │   │   ├── generate-title/
│   │   │   │   └── summarize/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── LLMSelector.tsx     # Model selection
│   │   │   ├── ChatWindow.tsx      # Main chat interface
│   │   │   ├── ChatList.tsx        # Session management
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── models.ts          # Model configurations
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── 📁 backend/               # Local LLM Server
│   ├── src/
│   │   ├── server.js        # Express server with LLM endpoints
│   │   └── setup-models.js  # Model download utility
│   ├── llama.cpp/           # llama.cpp build directory
│   ├── models/              # Downloaded .gguf model files
│   ├── package.json
│   └── .env
│
├── start-backend.sh         # Backend startup script (Unix)
├── start-backend.ps1        # Backend startup script (Windows)
├── start-frontend.sh        # Frontend startup script (Unix)
├── start-frontend.ps1       # Frontend startup script (Windows)
├── .gitignore              # Unified ignore file
├── .vercelignore           # Vercel deployment config
└── README.md               # This file
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.0.0+ (20.0.0+ recommended)
- 4GB+ RAM (16GB+ for Magistral model)
- 2GB+ free storage (20GB+ for all models)

### **Option 1: Frontend Only (Online Mode)**

Perfect for cloud deployment or if you only need Gemini API functionality:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment (optional)
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

Access at: `http://localhost:9002`

### **Option 2: Backend Only (Local LLM Server)**

For local inference server:

```bash
# Install backend dependencies
cd backend
npm install

# Download models (choose which ones you need)
npm run setup-models -- --yes

# Start server
npm run dev
```

Backend API available at: `http://localhost:3001`

### **Option 3: Full Stack (Recommended)**

For complete dual-mode functionality:

**Windows (PowerShell):**
```powershell
# Start backend
.\start-backend.ps1

# In another terminal, start frontend
.\start-frontend.ps1
```

**Linux/macOS/WSL:**
```bash
# Start backend
./start-backend.sh

# In another terminal, start frontend  
./start-frontend.sh
```

## ⚙️ Configuration

### **Environment Variables**

**Frontend** (`.env.local` in `frontend/` directory):
```env
# For online mode
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# Custom backend URL (optional)
BACKEND_URL=http://localhost:3001
```

**Backend** (`.env` in `backend/` directory):
```env
# Server configuration
BACKEND_PORT=3001
ENABLE_GPU=true
LOG_LEVEL=info

# Model settings
MAX_CONTEXT_SIZE=8192
DEFAULT_TEMPERATURE=0.7
DEFAULT_TOP_P=0.9
MAX_TOKENS=1024
```

### **Model Selection Guide**

Choose based on your hardware and requirements:

| Model | Size | RAM Required | Use Case | Languages |
|-------|------|--------------|----------|-----------|
| **Gemma 3 1B IT** | ~700MB | 4GB+ | Mobile devices, quick responses | English only |
| **Qwen3 Embedding 4B** | ~2.3GB | 8GB+ | Laptops, balanced performance | Multilingual |
| **Magistral Small 2506** | ~14GB | 16GB+ | Workstations, best quality | Multilingual |

## 🚚 Deployment

### **Vercel (Online Mode Only)**

Deploy frontend to Vercel for cloud access:

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_GEMINI_API_KEY=your_api_key`
4. Deploy automatically

The `.vercelignore` file ensures only frontend code is deployed.

### **Self-Hosted (Full Stack)**

For complete offline capability:

1. **Prepare Server**: Ensure Node.js 18+ and sufficient resources
2. **Clone Repository**: `git clone <your-repo>`
3. **Setup Backend**: `cd backend && npm install && npm run setup-models -- --yes`
4. **Setup Frontend**: `cd frontend && npm install`
5. **Configure**: Set up environment variables
6. **Deploy**: Use PM2, Docker, or systemd for production
7. **Reverse Proxy**: Configure nginx/Apache for domain access

### **Docker Deployment** (Optional)

Create Docker containers for both frontend and backend:

```dockerfile
# Example Dockerfile for backend
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 API Reference

### **Backend Endpoints**

**Health Check**
```bash
GET /api/health
```

**Chat Completion**
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

**Generate Embeddings**
```bash
POST /api/embeddings
Content-Type: application/json

{
  "text": "Text to generate embeddings for"
}
```

**Summarize Conversation**
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

**Generate Title**
```bash
POST /api/generate-title
Content-Type: application/json

{
  "conversation": [
    {"role": "user", "content": "First message"}
  ]
}
```

### **Model Information**
```bash
GET /api/models
```

## 🛠️ Development

### **Frontend Development**
```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

### **Backend Development**
```bash
cd backend

# Development server with auto-restart
npm run dev

# Production server
npm run start

# Download/update models
npm run setup-models
```

### **Code Structure**

**Frontend Architecture:**
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Hooks** for state management

**Backend Architecture:**
- **Express.js** for REST API
- **node-llama-cpp** for LLM inference
- **CORS** for cross-origin requests
- **Environment-based** configuration

## 🔍 Troubleshooting

### **Common Issues**

**Backend won't start:**
- Check Node.js version: `node --version` (need 18+)
- Verify models downloaded: `ls backend/models/`
- Check ports: `netstat -an | grep 3001`

**Frontend build errors:**
- Clear Next.js cache: `rm -rf frontend/.next`
- Reinstall dependencies: `rm -rf frontend/node_modules && npm install`
- Check TypeScript: `cd frontend && npm run typecheck`

**Models not loading:**
- Verify file integrity: Check file sizes match expected
- Check disk space: Ensure sufficient storage
- GPU issues: Set `ENABLE_GPU=false` in backend/.env

**API connection errors:**
- Check firewall settings for localhost connections
- Verify CORS configuration in backend
- Check environment variables for API keys

### **Performance Optimization**

**For Limited Resources:**
1. Use Gemma 3 1B model only
2. Reduce context size in backend config
3. Disable GPU acceleration if causing issues
4. Lower temperature/top_p values for faster responses

**For High Performance:**
1. Enable GPU acceleration
2. Use Magistral model for best quality
3. Increase context size for longer conversations
4. Use SSD storage for model files

## � System Requirements

### **Minimum (Gemma 3 1B)**
- **CPU**: 2 cores, 2GHz+
- **RAM**: 4GB
- **Storage**: 2GB free
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)

### **Recommended (Qwen3 4B)**
- **CPU**: 4 cores, 3GHz+
- **RAM**: 8GB
- **Storage**: 5GB free
- **OS**: Latest versions

### **High-Performance (Magistral)**
- **CPU**: 8+ cores, 3.5GHz+
- **RAM**: 16GB+
- **GPU**: NVIDIA GPU with 8GB+ VRAM (optional but recommended)
- **Storage**: 20GB+ free (NVMe SSD recommended)
- **OS**: Latest versions with CUDA support

## � Security & Privacy

### **Data Handling**
- **Local Mode**: All data stays on your device
- **Online Mode**: Data sent to Google Gemini API
- **Storage**: Conversations stored in browser localStorage
- **API Keys**: Stored locally or as environment variables

### **Best Practices**
- Use environment variables for production API keys
- Regularly update dependencies for security patches
- Consider using HTTPS in production deployments
- Implement rate limiting for public deployments

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **llama.cpp** community for the excellent C++ implementation
- **Mistral AI** for the Magistral model
- **Qwen** team for the embedding model
- **Google** for Gemma models and Gemini API
- **Vercel** for hosting and deployment platform
- **Next.js** team for the React framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: Check this README and inline code comments

---

**🎉 Ready to chat with your local and online LLMs!**

Start with the Quick Start guide above, choose your deployment method, and enjoy the power of both local privacy and cloud convenience in one application.
   
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
