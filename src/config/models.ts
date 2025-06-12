import type { LLMModel } from '@/types';

// Local LLM models
export const LOCAL_MODELS: LLMModel[] = [
  {
    id: 'llama3-8b-instruct',
    name: 'Llama 3 8B Instruct',
    description: 'A capable and efficient instruction-tuned model from Meta.',
  },
  {
    id: 'mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    description: 'A powerful 7B parameter model by Mistral AI, instruction-tuned.',
  },
  {
    id: 'phi3-mini-instruct',
    name: 'Phi-3 Mini Instruct',
    description: 'A lightweight, high-performance model by Microsoft, instruction-tuned.',
  },
];

// Online Gemini models
export const GEMINI_MODELS: LLMModel[] = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Latest)',
    description: 'Google\'s latest experimental model with enhanced performance and capabilities.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Google\'s fast and efficient model with multimodal capabilities.',
  },
];

// For backward compatibility
export const AVAILABLE_MODELS = LOCAL_MODELS;
