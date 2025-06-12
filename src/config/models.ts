import type { LLMModel } from '@/types';

export const AVAILABLE_MODELS: LLMModel[] = [
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
