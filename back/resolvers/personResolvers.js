const { GraphQLError } = require("graphql");
const Person = require("../models/persons");
const logger = require("../utils/logger");

const personResolvers = {
  Query: {
    personCount: async (root, args, context) => {
      const { traceId, currentUser } = context;
      logger.debug(`[${traceId}] Query 'personCount' called`);

      // Check if the user is authenticated
      // if (!currentUser) {
      //     throw new GraphQLError("Authentication required", {
      //         extensions: { code: "UNAUTHENTICATED" },
      //     });
      // }

      try {
        // Count the number of documents in the Person collection
        const count = await Person.countDocuments();
        return count;
      } catch (error) {
        throw new GraphQLError("Failed to fetch person count", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    allPersons: async (root, args, context) => {
      const { traceId, currentUser } = context;
      logger.debug(`[${traceId}] Query 'allPersons' called`);

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        if (!args.phone) {
          return await Person.find({});
        }

        return await Person.find({ phone: { $exists: args.phone === "YES" } });
      } catch (error) {
        throw new GraphQLError("Failed to fetch persons", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    findPerson: async (root, args, context) => {
      const { traceId, currentUser } = context;
      logger.debug(`[${traceId}] Query 'findPerson' called`);

      // Check if the user is authenticated
      // if (!currentUser) {
      //     throw new GraphQLError("Authentication required", {
      //         extensions: { code: "UNAUTHENTICATED" },
      //     });
      // }

      // Check if the name argument is provided and valid
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

        return person;
      } catch (error) {
        // If the error is a GraphQLError, rethrow it
        if (error instanceof GraphQLError) {
          throw error;
        }

        throw new GraphQLError("Failed to fetch person", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },

  Mutation: {
    addPerson: async (root, args, context) => {
      const { traceId, currentUser } = context;
      logger.debug(`[${traceId}] Mutation 'addPerson' called`);

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if all required fields are present and valid
      if (
        !args.name ||
        typeof args.name !== "string" ||
        args.name.trim() === ""
      ) {
        throw new GraphQLError(
          "Invalid or missing 'name'. It must be a non-empty string.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "name" },
          }
        );
      }

      if (
        !args.street ||
        typeof args.street !== "string" ||
        args.street.trim() === ""
      ) {
        throw new GraphQLError(
          "Invalid or missing 'street'. It must be a non-empty string.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "street" },
          }
        );
      }

      if (
        !args.city ||
        typeof args.city !== "string" ||
        args.city.trim() === ""
      ) {
        throw new GraphQLError(
          "Invalid or missing 'city'. It must be a non-empty string.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "city" },
          }
        );
      }

      try {
        // Check if the person already exists
        const personExists = await Person.findOne({ name: args.name });

        if (personExists) {
          throw new GraphQLError("Name must be unique", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
            },
          });
        }

        // Create a new person object
        const person = new Person({ ...args });

        // Save the person to the database and the returned object
        const savedPerson = await person.save();

        // Add the person to the current user's friends list
        currentUser.friends = currentUser.friends.concat(savedPerson._id);
        await currentUser.save();

        return savedPerson;
      } catch (error) {
        // If the error is a GraphQLError, rethrow it
        if (error instanceof GraphQLError) {
          throw error;
        }

        // Handle Mongoose validation errors - transform them into GraphQLError
        if (error.name === "ValidationError") {
          throw new GraphQLError("Validation error", {
            extensions: {
              code: "BAD_USER_INPUT",
              errorDetails: error.errors,
            },
          });
        }

        // Handle other errors
        throw new GraphQLError("Saving person failed", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },

    editNumber: async (root, args, context) => {
      const { traceId, currentUser } = context;
      logger.debug(`[${traceId}] Mutation 'editNumber' called`);

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if the name and phone arguments are provided and valid
      if (
        !args.name ||
        typeof args.name !== "string" ||
        args.name.trim() === ""
      ) {
        throw new GraphQLError(
          "Invalid or missing 'name'. It must be a non-empty string.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "name" },
          }
        );
      }

      if (
        !args.phone ||
        typeof args.phone !== "string" ||
        args.phone.trim() === ""
      ) {
        throw new GraphQLError(
          "Invalid or missing 'phone'. It must be a non-empty string.",
          {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: "phone" },
          }
        );
      }

      try {
        // Search for the person by name
        const person = await Person.findOne({ name: args.name });

        // Set error if person is not found
        if (!person) {
          throw new GraphQLError("Person not found", {
            extensions: {
              code: "NOT_FOUND",
              invalidArgs: args.name,
            },
          });
        }

        // Update the phone number if the person is found
        person.phone = args.phone;

        // Save the updated person to the database and return the updated object
        return await person.save();
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
        throw new GraphQLError("Saving number failed", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
  },
};

module.exports = personResolvers;
