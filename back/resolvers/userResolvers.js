const { GraphQLError } = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Person = require("../models/persons");

const userResolvers = {
  Query: {
    me: (root, args, context) => {
      console.log("Query 'me' called");

      // Check if the user is authenticated
      if (!context.currentUser) {
        console.log("Unauthenticated access attempt to 'me'");
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return context.currentUser;
    },
  },

  Mutation: {
    createUser: async (root, args) => {
      console.log("Mutation 'createUser' called");

      // Check if the username and password are provided and valid
      if (
        !args.username ||
        typeof args.username !== "string" ||
        args.username.length < 3
      ) {
        throw new GraphQLError(
          "Invalid username. It must be at least 3 characters long.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "username" },
          }
        );
      }

      if (
        !args.password ||
        typeof args.password !== "string" ||
        args.password.length < 6
      ) {
        throw new GraphQLError(
          "Invalid password. It must be at least 6 characters long.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "password" },
          }
        );
      }

      try {
        // Hash the password before saving it
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(args.password, saltRounds);

        // Create a new user object with the hashed password
        const user = new User({
          username: args.username,
          passwordHash,
        });

        return await user.save();
      } catch (error) {
        // If the error is a duplicate key error (MongoDB) - error code 11000
        if (error.code === 11000) {
          throw new GraphQLError("Username already exists", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: "username",
            },
          });
        }

        // Handle validation errors from Mongoose
        if (error.name === "ValidationError") {
          throw new GraphQLError("Validation error", {
            extensions: {
              code: "BAD_USER_INPUT",
              errorDetails: error.errors,
            },
          });
        }

        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    login: async (root, args) => {
      console.log("Login mutation called");

      // Check if the username and password are provided and valid
      if (!args.username || typeof args.username !== "string") {
        throw new GraphQLError("Username is required", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: "username",
          },
        });
      }

      if (!args.password || typeof args.password !== "string") {
        throw new GraphQLError("Password is required", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: "password",
          },
        });
      }

      try {
        const user = await User.findOne({ username: args.username });

        // Check if the user exists
        if (!user) {
          console.log(`Failed login attempt for username: ${args.username}`);
          throw new GraphQLError("Invalid username or password", {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          });
        }

        // Compare the provided password with the stored password hash
        const isPasswordValid = await bcrypt.compare(
          args.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.log(`Failed login attempt for username: ${args.username}`);
          throw new GraphQLError("Invalid username or password", {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          });
        }

        const userForToken = {
          username: user.username,
          id: user._id,
        };

        return {
          token: jwt.sign(userForToken, process.env.JWT_SECRET, {
            expiresIn: "1m",
          }),
        };
      } catch (error) {
        // If the error is a GraphQLError, rethrow it
        if (error instanceof GraphQLError) {
          throw error;
        }

        // If error is from JWT verification
        if (error.name === "JsonWebTokenError") {
          console.error("JWT error:", error.message);
          throw new GraphQLError("Authentication system error", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errorType: error.name,
              errorMessage: error.message,
            },
          });
        }

        // Handle other errors
        console.error("Login error:", error);
        throw new GraphQLError("Login failed due to a technical error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    addAsFriend: async (root, args, { currentUser }) => {
      console.log("Mutation 'addAsFriend' called");

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if the name argument is provided and valid format
      if (!args.name || typeof args.name !== "string") {
        throw new GraphQLError("Invalid name provided", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Check if the person exists
        const person = await Person.findOne({ name: args.name });

        if (!person) {
          throw new GraphQLError("Person not found", {
            extensions: { code: "NOT_FOUND", invalidArgs: args.name },
          });
        }

        // Check if the person is already a friend
        const isAlreadyFriend = currentUser.friends.some(
          (friendId) => friendId.toString() === person._id.toString()
        );

        if (isAlreadyFriend) {
          throw new GraphQLError("Person is already a friend", {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name },
          });
        }

        // Add the person to the user's friends list
        currentUser.friends = currentUser.friends.concat(person._id);
        await currentUser.save();

        // Return the updated user object with populated friends
        return await currentUser.populate("friends");
      } catch (error) {
        // If the error is a GraphQLError, rethrow it
        if (error instanceof GraphQLError) {
          throw error;
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
          console.error("Validation error:", error);
          throw new GraphQLError("Validation error", {
            extensions: {
              code: "BAD_USER_INPUT",
              errorDetails: error.errors,
            },
          });
        }

        // Handle other errors
        console.error("Error adding friend:", error);
        throw new GraphQLError("Failed to add friend", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
  },
};

module.exports = userResolvers;
