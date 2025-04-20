const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const loggingPlugin = {
  async requestDidStart(requestContext) {
    // Generate a unique trace ID for each request
    const traceId = uuidv4();

    // Log the start of the request
    logger.info(
      `[${traceId}] ➡️ Request started: ${
        requestContext.request.operationName || "Unnamed"
      }`
    );

    // Return hooks with traceId in closure as context is not available in the requestDidStart
    return {
      async didEncounterErrors(ctx) {
        for (const err of ctx.errors) {
          logger.error(`[${traceId}] ❌ GraphQL Error: ${err.message}`, {
            path: err.path,
            stack: err.stack,
            variables: ctx.request.variables,
          });
        }
      },

      async willSendResponse(ctx) {
        logger.info(`[${traceId}] ✅ Response sent`);
      },

      // Optional: Make traceId available in context for resolvers
      async didResolveOperation(ctx) {
        if (ctx.contextValue) {
          ctx.contextValue.traceId = traceId;
        }
        logger.debug(
          `[${traceId}] Operation resolved: ${
            ctx.operation.name?.value || "Unnamed"
          }`
        );
      },
    };
  },
};

module.exports = loggingPlugin;
