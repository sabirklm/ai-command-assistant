const express = require("express");
const { scrapeSite } = require("../scrapper/scrap.bbc");
const { processArticleWithLLM } = require("../service/llm.ollama.service");
const router = express.Router();

/**
 * @swagger
 * /article:
 *   post:
 *     summary: Process article from URL
 *     description: Scrapes and processes article content from a provided URL using LLM
 *     tags:
 *       - Article
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://www.bbc.com/news/example-article
 *     responses:
 *       200:
 *         description: Article processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request - invalid or missing URL
 *       500:
 *         description: Internal server error
 */
router.post("/article", async (req, res) => {
  try {
    const { url } = req.body || {};

    // Validate URL presence
    if (!url) {
      return res.status(400).json({
        status: 400,
        message: "url is required"
      });
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return res.status(400).json({
        status: 400,
        message: "invalid url format"
      });
    }

    // Scrape content from URL
    const content = await scrapeSite(url);

    // Process articles with LLM
    const results = await processArticles(content);

    res.status(200).json({
      status: 200,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "internal server error",
      stackTrace: error
    });
  }
});

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Processes multiple articles using LLM
 * @param {Array} content - Array of articles to process
 * @returns {Promise<Array>} - Processed articles
 */
async function processArticles(content) {
  const results = [];
  
  for (const article of content) {
    const processedArticle = await processArticleWithLLM(article);
    results.push(processedArticle);
  }
  
  return results;
}

module.exports = router;