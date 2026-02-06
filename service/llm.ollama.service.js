/**
 * Service for interacting with local LLM API (Ollama)
 */

const LLM_API_URL = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'gemma3:4b';
const OLLAMA_BASE_API = 'http://localhost:11434';
/**
 * Check if LLM is available
 */
export const isLLMAvailable = async () => {
    try {
        const response = await fetch(`${OLLAMA_BASE_API}/api/tags`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

/**
 * Generate content using LLM
 * @param {string} prompt - The prompt to send to LLM
 * @param {string} model - Model name (default: gemma3:4b)
 * @returns {Promise<string>} Generated text
 */
export const generateContent = async (prompt, model = DEFAULT_MODEL) => {
    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                stream: false,
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json().catch(() => {
            throw new Error('Invalid response from LLM. Please check Ollama is running correctly.');
        });
        return data.response || '';
    } catch (error) {
        console.error('Error generating content:', error);
        throw new Error('Failed to generate content. Make sure Ollama is running.');
    }
};
