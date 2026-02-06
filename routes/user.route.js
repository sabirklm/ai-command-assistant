const express = require("express");
const { scrapeSite } = require("../scrapper/scrap.bbc");
const router = express.Router();

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a user
 *     description: Creates a new user using request body data
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sabir
 *               email:
 *                 type: string
 *                 example: sabir@example.com
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 */
router.post("/user", async (req, res) => {
  try {
    const { url } = req.body || {};

    // 1️⃣ Check if url exists
    if (!url) {
      return res.status(400).json({
        status: 400,
        message: "url is required"
      });
    }

    // 2️⃣ Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        status: 400,
        message: "invalid url format"
      });
    }

    // 3️⃣ Call async function safely
    const content = await scrapeSite(url);

    res.status(200).json({
      status: 200,
      data: {
        url,
        content
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "internal server error",
      stackTrace: error,
    });
  }
});

module.exports = router;