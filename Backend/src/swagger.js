const swaggerJSDoc = require("swagger-jsdoc");

function buildSwaggerSpec() {
  return swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Phantasmagoria Alumni API",
        version: "1.0.0"
      },
      servers: [{ url: "http://localhost:4000" }],
      components: {
        securitySchemes: {
          BearerAuth: { type: "http", scheme: "bearer" }
        }
      }
    },
    apis: ["./src/routes/*.routes.js"]
  });
}

module.exports = { buildSwaggerSpec };