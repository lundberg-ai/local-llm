// Type definitions for Next.js environment variables

declare namespace NodeJS {
	interface ProcessEnv {
		readonly NEXT_PUBLIC_GEMINI_API_KEY?: string;
	}
}
