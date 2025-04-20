const logger = require("./utils/logger");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectToDatabase = async (uri) => {
  logger.info("Connecting to Database", { uri });

  try {
    await mongoose.connect(uri);
    logger.info("📂 Connected to MongoDB");
    return true;
  } catch (error) {
    logger.error("error connection to MongoDB:", {
      errorMessage: error.message,
    });
    return false;
  }
};

module.exports = { connectToDatabase };
