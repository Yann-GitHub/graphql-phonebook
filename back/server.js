const { ApolloServer } = require("@apollo/server");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const User = require("./models/users");
const logger = require("./utils/logger");
const loggingPlugin = require("./plugins/loggingPlugin");

// Import schema and resolvers
const typeDefs = require("./typeDefs/index");
const resolvers = require("./resolvers");

// Create and configure Apollo Server
const createApolloServer = () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [loggingPlugin],
  });

  return server;
};

// Context function for authentication - runs for every request
const createContext = async ({ req, res }) => {
  // Validate the JWT token and extract the user information
  const auth = req ? req.headers.authorization : null;

  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );

      // const currentUser = await User.findById(decodedToken.id).populate(
      //   "friends"
      // );
      const currentUser = await User.findById(decodedToken.id);

      return { currentUser };
    } catch (error) {
      // Handle token expiration
      if (error.name === "TokenExpiredError") {
        // Options to extract user ID from the token
        try {
          const rawToken = auth.substring(7);
          const tokenData = jwt.decode(rawToken);
          logger.warn("Token expired", {
            userId: tokenData?.id || "unknown",
          });
        } catch {
          logger.warn("Token expired - no additional info available");
        }

        throw new GraphQLError("Token has expired", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Handle other token errors
      logger.warn("Invalid token", {
        errorType: error.name,
        errorMessage: error.message,
      });

      throw new GraphQLError("Invalid token", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
  }

  return { currentUser: null };
};

module.exports = { createApolloServer, createContext };
