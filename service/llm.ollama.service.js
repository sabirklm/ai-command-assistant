/**
 * Service for interacting with local LLM API (Ollama)
 */

const LLM_API_URL = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'gemma3:4b';
const OLLAMA_BASE_API = 'http://localhost:11434';
/**
 * Check if LLM is available
 */
 const isLLMAvailable = async () => {
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
 const generateContent = async (prompt, model = DEFAULT_MODEL) => {
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



/**
 * Process article scraped with Readability - NEW METHOD
 * Takes clean article content and extracts all needed fields using LLM
 * @param {Object} scrapedContent - Article data from scrapeArticleWithReadability
 * @returns {Promise<Object>} Fully processed article ready for Firebase
 */
 const processArticleWithLLM = async (scrapedContent) => {
    // Build a comprehensive prompt with the cleaned article content
    const prompt = `You are a professional news writer. Read this article and create a COMPLETELY FRESH version of the headline and summary. Do NOT copy or closely paraphrase the original - write it in your own words.

Source: ${scrapedContent.source}
Original Title: ${scrapedContent.title}
Language: ${scrapedContent.language}

Article Content:
"""
${scrapedContent.content}
"""

Your Task - REWRITE, Don't Copy:

1. **Title**: Create a BRAND NEW headline about this story. Don't use the same words or structure as the original. Write it from scratch in a fresh way. Keep it under 80 characters and make it engaging.

2. **Description**: Write a COMPLETELY NEW 2-3 sentence summary. Use different words, different sentence structure, different angle than the original. Explain the key facts in your own natural way. Make it sound like YOU are telling the story, not copying someone else.

3. **Language**: Detect the language code (en, es, hi, ar, fr, de, ru, zh, pt, bn, ur, fa, tr, id, vi, etc.)

4. **Category**: Choose ONE: technology, business, world, sports, health, entertainment, politics, science

5. **CRITICAL**: Keep the same language as the original. Do NOT translate.

Writing Rules:
- Use DIFFERENT words than the original headline and description
- Change the sentence structure completely
- Write naturally, like you're explaining to a friend
- Focus on the key facts but present them in a fresh way
- Avoid copying phrases from the source
- Make it sound original and unique

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "Completely rewritten headline in original language",
  "description": "Fully rewritten 2-3 sentence summary in original language",
  "language": "language_code",
  "category": "category_name"
}`;

    try {
        const response = await generateContent(prompt);

        // Extract JSON from response - handle markdown code blocks
        let jsonText = response.trim();

        // Remove markdown code blocks if present
        if (jsonText.includes('```')) {
            jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        }

        // Find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in LLM response');
        }

        const extractedData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!extractedData.title || !extractedData.description) {
            throw new Error('LLM failed to extract title or description');
        }

        // Construct the final article object for Firebase
        const processedArticle = {
            title: extractedData.title.trim(),
            description: extractedData.description.trim(),
            category: extractedData.category || 'world',
            language: extractedData.language || scrapedContent.language || 'en',
            source: scrapedContent.source,
            url: scrapedContent.url,
            image: scrapedContent.image || '',
            excerpt: scrapedContent.excerpt || '',

            // Date handling
            date: scrapedContent.publishedDate ?
                new Date(scrapedContent.publishedDate).toISOString().split('T')[0] :
                new Date().toISOString().split('T')[0],
            publishedDate: scrapedContent.publishedDate,

            // Metadata
            layoutType: "magazine",
            sourceLogo: '',
            byline: scrapedContent.byline || null,
            siteName: scrapedContent.siteName || scrapedContent.source,

            // Processing info
            scrapedAt: scrapedContent.scrapedAt,
            processedAt: new Date().toISOString(),
            textLength: scrapedContent.textLength,

            // Validation flag
            isValid: true
        };

        console.log(`✓ Processed article: "${processedArticle.title}" [${processedArticle.language}]`);

        return processedArticle;

    } catch (error) {
        console.error('Error processing article with LLM:', error);

        // Fallback: return article with basic extraction (no LLM enhancement)
        console.warn('Using fallback processing without LLM enhancement');

        return {
            title: scrapedContent.title || 'Untitled Article',
            description: scrapedContent.excerpt || scrapedContent.content.substring(0, 300),
            category: 'world',
            language: scrapedContent.language || 'en',
            source: scrapedContent.source,
            url: scrapedContent.url,
            image: scrapedContent.image || '',
            excerpt: scrapedContent.excerpt || '',
            date: new Date().toISOString().split('T')[0],
            publishedDate: scrapedContent.publishedDate,
            layoutType: "magazine",
            sourceLogo: '',
            byline: scrapedContent.byline || null,
            siteName: scrapedContent.siteName || scrapedContent.source,
            scrapedAt: scrapedContent.scrapedAt,
            processedAt: new Date().toISOString(),
            textLength: scrapedContent.textLength,
            isValid: true,
            fallbackProcessing: true
        };
    }
};

module.exports = {isLLMAvailable, processArticleWithLLM, generateContent}