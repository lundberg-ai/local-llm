
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-conversation-title.ts';
import '@/ai/flows/summarize-conversation.ts';
// Note: online-chat-flow.ts is a server action used directly,
// so it does not need to be explicitly imported here for Genkit dev tooling
// unless you want to inspect/trace it via Genkit's own dev UI.
// For Next.js usage as a server action, direct import in page.tsx is sufficient.
// import '@/ai/flows/online-chat-flow.ts'; 
