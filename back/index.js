const { startStandaloneServer } = require("@apollo/server/standalone");
const logger = require("./utils/logger");
const { connectToDatabase } = require("./db");
const { createApolloServer, createContext } = require("./server");

// Load environment variables
require("dotenv").config();

// Config
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

// Main function to start the application
async function startApplication() {
  try {
    // 1. Connect to the database
    logger.info("Initializing application...");
    const dbConnected = await connectToDatabase(MONGODB_URI);

    if (!dbConnected) {
      logger.error("Failed to connect to database. Application cannot start.");
      process.exit(1);
    }

    // 2. Create the Apollo Server instance
    const server = createApolloServer();
    logger.info("Apollo Server created successfully");

    // 3. Start the server and listen on the specified port
    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: createContext,
    });

    logger.info(`🚀 Server ready at ${url}`);
  } catch (error) {
    logger.error("Failed to start application", {
      errorMessage: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions and unhandled rejections - prevent application from crashing !!
process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥", {
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("UNHANDLED REJECTION! 💥", {
    errorMessage: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// 4. Start the application
startApplication();
