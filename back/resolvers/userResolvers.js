const { GraphQLError } = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Person = require("../models/persons");
const logger = require("../utils/logger");

const userResolvers = {
  Query: {
    me: async (root, args, context) => {
      const { traceId, currentUser } = context;

      logger.debug(`[${traceId}] 🔍 Query 'me' called`);

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // return context.currentUser;
      return await User.findById(currentUser._id).populate("friends");
    },
  },

  Mutation: {
    createUser: async (root, args, context) => {
      const { traceId, currentUser } = context;

      logger.debug(
        `[${traceId}] 🔍 Creating user with Username ${args.username}`
      );

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

    login: async (root, args, context) => {
      const { traceId, currentUser } = context;

      logger.debug(
        `[${traceId}] 🔍 Login mutation called with Username ${args.username}`
      );

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
          // token: jwt.sign(userForToken, process.env.JWT_SECRET, {
          //   expiresIn: "10m",
          // }),
          token: jwt.sign(userForToken, process.env.JWT_SECRET),
        };
      } catch (error) {
        // If the error is a GraphQLError, rethrow it
        if (error instanceof GraphQLError) {
          throw error;
        }

        // If error is from JWT verification
        if (error.name === "JsonWebTokenError") {
          throw new GraphQLError("Authentication system error", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errorType: error.name,
              errorMessage: error.message,
            },
          });
        }

        // Handle other errors
        throw new GraphQLError("Login failed due to a technical error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    addAsFriend: async (root, args, context) => {
      const { traceId, currentUser } = context;

      logger.debug(
        `[${traceId}] 🔍 Mutation 'addAsFriend' called with person ID ${args.id}`
      );

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if the ID argument is provided
      if (!args.id) {
        throw new GraphQLError("Person ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Check if the person exists
        const person = await Person.findById(args.id);

        if (!person) {
          throw new GraphQLError("Person not found", {
            extensions: { code: "NOT_FOUND", invalidArgs: args.id },
          });
        }

        // Check if the person is already a friend
        const isAlreadyFriend = currentUser.friends.some(
          (friendId) => friendId.toString() === person._id.toString()
        );

        if (isAlreadyFriend) {
          throw new GraphQLError("Person is already a friend", {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: args.id },
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
          throw new GraphQLError("Validation error", {
            extensions: {
              code: "BAD_USER_INPUT",
              errorDetails: error.errors,
            },
          });
        }

        // Handle other errors
        throw new GraphQLError("Failed to add friend", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    toggleFriendStatus: async (root, args, context) => {
      const { traceId, currentUser } = context;

      logger.debug(
        `[${traceId}] 🔍 Mutation 'toggleFriendStatus' called with person ID ${args.id}`
      );

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if the ID argument is provided
      if (!args.id) {
        throw new GraphQLError("Person ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Check if the person exists
        const person = await Person.findById(args.id);
        if (!person) {
          throw new GraphQLError("Person not found", {
            extensions: { code: "NOT_FOUND", invalidArgs: args.id },
          });
        }

        // Check if the person is already a friend
        const isAlreadyFriend = currentUser.friends.some(
          (friendId) => friendId.toString() === person._id.toString()
        );
        if (isAlreadyFriend) {
          // Remove the person from the user's friends list
          currentUser.friends = currentUser.friends.filter(
            (friendId) => friendId.toString() !== person._id.toString()
          );
        } else {
          // Add the person to the user's friends list
          currentUser.friends = currentUser.friends.concat(person._id);
        }
        await currentUser.save();
        // Return the updated user object with populated friends
        // return await currentUser.populate("friends");
        return await User.findById(currentUser._id).populate("friends");

        // Vérifier si la personne est déjà un ami avec une méthode plus robuste
        // Convertir tous les IDs en strings pour la comparaison
        // const friendIds = currentUser.friends.map((id) => id.toString());
        // const personId = person._id.toString();

        // Log pour débogage
        // console.log("Current friends:", friendIds);
        // console.log("Person to toggle:", personId);
        // console.log("Is already friend?", friendIds.includes(personId));

        // if (friendIds.includes(personId)) {
        // La personne est déjà un ami, la supprimer
        // logger.debug(
        //   `[${traceId}] Removing friend ${person.name} (${personId})`
        // );

        // currentUser.friends = currentUser.friends.filter(
        //   (id) => id.toString() !== personId
        // );
        // } else {
        // La personne n'est pas un ami, l'ajouter
        // logger.debug(
        //   `[${traceId}] Adding friend ${person.name} (${personId})`
        // );

        //   currentUser.friends.push(person._id);
        // }

        // Sauvegarder les modifications
        // await currentUser.save();

        // Retourner l'utilisateur mis à jour avec les amis populés
        // return await User.findById(currentUser._id).populate("friends");
      } catch (error) {
        // If the error is a GraphQLError, rethrow it
        if (error instanceof GraphQLError) {
          throw error;
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
          throw new GraphQLError("Validation error", {
            extensions: {
              code: "BAD_USER_INPUT",
              errorDetails: error.errors,
            },
          });
        }

        // Handle other errors
        throw new GraphQLError("Failed to toggle friend status", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
  },
};

module.exports = userResolvers;
