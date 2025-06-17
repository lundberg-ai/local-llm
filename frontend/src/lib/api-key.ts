/**
 * Utility functions for API key management
 */

/**
 * Gets the API key with fallback logic:
 * 1. First checks localStorage
 * 2. Falls back to environment variable if localStorage is empty
 */
export function getApiKey(): string | null {
	try {
		// First try localStorage
		const localStorageKey = localStorage.getItem('aipify-local-api-key');
		if (localStorageKey && localStorageKey.trim()) {
			return localStorageKey.trim();
		}
	} catch {
		console.warn("Could not access localStorage for API key.");
	}
	// Fallback to environment variable
	const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
	if (envKey && envKey.trim() && envKey !== 'your_api_key_here') {
		return envKey.trim();
	}

	return null;
}

/**
 * Checks if an API key is available (either in localStorage or environment)
 */
export function hasApiKey(): boolean {
	return getApiKey() !== null;
}

/**
 * Gets the source of the current API key for display purposes
 */
export function getApiKeySource(): 'localStorage' | 'environment' | 'none' {
	try {
		const localStorageKey = localStorage.getItem('aipify-local-api-key');
		if (localStorageKey && localStorageKey.trim()) {
			return 'localStorage';
		}
	} catch {
		// Continue to check environment
	}
	const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
	if (envKey && envKey.trim() && envKey !== 'your_api_key_here') {
		return 'environment';
	}

	return 'none';
}
