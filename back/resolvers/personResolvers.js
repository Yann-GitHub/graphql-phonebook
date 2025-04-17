const { GraphQLError } = require("graphql");
const Person = require("../models/persons");

const personResolvers = {
  Query: {
    personCount: async () => {
      console.log("Query 'personCount' called");

      // Check if the user is authenticated
      // if (!context.currentUser) {
      //     throw new GraphQLError("Authentication required", {
      //         extensions: { code: "UNAUTHENTICATED" },
      //     });
      // }

      try {
        // Count the number of documents in the Person collection
        const count = await Person.countDocuments();
        return count;
      } catch (error) {
        console.error("Error fetching person count:", error);

        throw new GraphQLError("Failed to fetch person count", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    allPersons: async (root, args, context) => {
      console.log("Query 'allPersons' called");

      // Check if the user is authenticated
      // if (!context.currentUser) {
      //     throw new GraphQLError("Authentication required", {
      //         extensions: { code: "UNAUTHENTICATED" },
      //     });
      // }

      try {
        if (!args.phone) {
          return await Person.find({});
        }

        return await Person.find({ phone: { $exists: args.phone === "YES" } });
      } catch (error) {
        console.error("Error fetching persons:", error);

        throw new GraphQLError("Failed to fetch persons", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    findPerson: async (root, args, context) => {
      console.log("Query 'findPerson' called");

      // Check if the user is authenticated
      // if (!context.currentUser) {
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
        console.error("Error fetching person:", error);
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
    addPerson: async (root, args, { currentUser }) => {
      console.log("Mutation 'addPerson' called");

      // Check if the user is authenticated
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if all required fields are present and valid
      const requiredFields = ["name", "street", "city"];
      const missingFields = requiredFields.filter(
        (field) => !args[field] || typeof args[field] !== "string"
      );

      if (missingFields.length > 0) {
        throw new GraphQLError("Missing or invalid required fields", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: missingFields,
          },
        });
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
        console.error("Error saving person:", error);
        throw new GraphQLError("Saving person failed", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },

    editNumber: async (root, args, { currentUser }) => {
      console.log("Mutation 'editNumber' called");

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
        console.error("Error saving number:", error);
        throw new GraphQLError("Saving number failed", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            invalidArgs: args.name,
            error,
          },
        });
      }
    },
  },
};

module.exports = personResolvers;
