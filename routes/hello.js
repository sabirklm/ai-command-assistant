const express = require("express");
const { sayHello, sayOk } = require("../controllers/hello.controller");
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
router.get("/hello", sayHello);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get health
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/health", sayOk);

module.exports = router;