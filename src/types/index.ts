export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  modelId?: string; // ID of the LLM model used for this chat
}

export interface LLMModel {
  id: string;
  name: string;
  description?: string;
  // Potentially add endpoint or other config here if needed for actual API calls
}
