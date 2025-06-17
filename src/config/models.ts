import type { LLMModel } from '@/types';

// Local LLM models (using our backend)
export const LOCAL_MODELS: LLMModel[] = [
  {
    id: 'magistral-small-2506',
    name: 'Magistral Small 2506',
    description: 'A capable instruction-tuned model by Mistral AI (local).',
  },
  {
    id: 'qwen3-embedding-4b',
    name: 'Qwen3 Embedding 4B',
    description: 'High-quality embedding model by Qwen (local).',
  },
  {
    id: 'gemma-3-1b-it',
    name: 'Gemma 3 1B IT',
    description: 'Lightweight instruction-tuned model by Google (local).',
  },
];

// Online Gemini models
export const GEMINI_MODELS: LLMModel[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Google\'s fast and efficient model with multimodal capabilities.',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Latest)',
    description: 'Google\'s latest experimental model with enhanced performance and capabilities.',
  },
];

// Mode configuration
export const MODES = {
  OFFLINE: 'offline',
  ONLINE: 'online',
} as const;

export type Mode = typeof MODES[keyof typeof MODES];

// Get models based on mode
export function getModelsForMode(mode: Mode): LLMModel[] {
  switch (mode) {
    case MODES.OFFLINE:
      return LOCAL_MODELS;
    case MODES.ONLINE:
      return GEMINI_MODELS;
    default:
      return LOCAL_MODELS;
  }
}

// For backward compatibility
export const AVAILABLE_MODELS = LOCAL_MODELS;
