const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Get hello
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/hello", (req, res) => {
    res.send("Ok");
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get health
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/health", (req, res) => {
    res.send("Ok");
});

module.exports = router;