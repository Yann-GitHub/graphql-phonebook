const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const loggingPlugin = require("./plugins/loggingPlugin");
const jwt = require("jsonwebtoken");
const logger = require("./utils/logger");
const { connectToDatabase } = require("./db");
const { createApolloServer, createContext } = require("./server");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const User = require("./models/users");

const resolvers = require("./resolvers");
const typeDefs = require("./typeDefs/index");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
logger.info("connecting to", { uri: MONGODB_URI });

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("📂 Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", {
      errorMessage: error.message,
    });
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [loggingPlugin],
});

startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req, res }) => {
    // This function runs for every request

    // Validate the JWT token and extract the user information
    const auth = req ? req.headers.authorization : null;

    if (auth && auth.startsWith("Bearer ")) {
      try {
        const decodedToken = jwt.verify(
          auth.substring(7),
          process.env.JWT_SECRET
        );

        const currentUser = await User.findById(decodedToken.id).populate(
          "friends"
        );

        return { currentUser };
      } catch (error) {
        // Expired token error handling
        if (error.name === "TokenExpiredError") {
          // console.error("Token has expired:", error.message);

          logger.warn("Token expired", {
            userId: decodedToken?.id,
            tokenExpiration: decodedToken?.exp,
            tokenIssued: decodedToken?.iat,
          });
          throw new GraphQLError("Token has expired", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        // Invalid token error handling
        // console.error("Invalid token:", error.message);

        throw new GraphQLError("Invalid token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
    }
    return { currentUser: null };
  },
}).then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
});
