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
  res.send({
    message: `Hello!! ${Date()}`,
    data: req.data,
  });
});

module.exports = router;