const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Njs Swagger",
      version: "1.0.0",
      description: "Auto-generated API docs"
    }
  },
  apis: ["./routes/*.js"]
};

module.exports = swaggerJSDoc(options);