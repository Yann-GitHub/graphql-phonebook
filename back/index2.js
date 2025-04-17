// const { ApolloServer } = require("@apollo/server");
// const { startStandaloneServer } = require("@apollo/server/standalone");
// const { v1: uuid } = require("uuid");
// const { GraphQLError } = require("graphql");
// const bcrypt = require("bcrypt");

// const mongoose = require("mongoose");
// mongoose.set("strictQuery", false);

// const Person = require("./models/persons");
// const User = require("./models/users");

// require("dotenv").config(); // Load environment variables from the .env file

// const MONGODB_URI = process.env.MONGODB_URI;

// console.log("connecting to", MONGODB_URI);

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => {
//     console.log("connected to MongoDB");
//   })
//   .catch((error) => {
//     console.log("error connection to MongoDB:", error.message);
//   });

// const jwt = require("jsonwebtoken");

// const typeDefs = `
//   type User {
//     username: String!
//     friends: [Person!]!
//     id: ID!
//   }

//   type Token {
//     token: String!
//   }

//   type Address {
//     street: String!
//     city: String!
//   }

//   enum YesNo {
//     YES
//     NO
//   }

//   type Person {
//     name: String!
//     phone: String
//     address: Address!
//     id: ID!
//   }

//   type Query {
//     personCount: Int!
//     allPersons(phone: YesNo): [Person!]!
//     findPerson(name: String!): Person
//     me: User
//   }

//   type Mutation {
//     addPerson(
//       name: String!
//       phone: String
//       street: String!
//       city: String!
//     ): Person

//     editNumber(
//       name: String!
//       phone: String!
//     ): Person

//     createUser(
//       username: String!
//       password: String!
//     ): User

//     login(
//       username: String!
//       password: String!
//     ): Token

//     addAsFriend(
//     name: String!
//     ): User
//   }
// `;

// const resolvers = {
//   Query: {
//     personCount: async () => {
//       console.log("Query 'personCount' called");

//       try {
//         // Use Mongoose's countDocuments method
//         const count = await Person.countDocuments();
//         return count;

//         // Use MongoDB's countDocuments method
//         // const count = await Person.collection.countDocuments();
//         // return count;
//       } catch (error) {
//         console.error("Error fetching person count:", error);
//         throw new GraphQLError("Failed to fetch person count", {
//           extensions: { code: "INTERNAL_SERVER_ERROR" },
//         });
//       }
//     },
//     allPersons: async (root, args, context) => {
//       console.log("Query 'allPersons' called");

//       // if (!context.currentUser) {
//       //   throw new GraphQLError("Authentication required", {
//       //     extensions: { code: "UNAUTHENTICATED" },
//       //   });
//       // }

//       try {
//         if (!args.phone) {
//           return await Person.find({});
//         }

//         return await Person.find({ phone: { $exists: args.phone === "YES" } });
//       } catch (error) {
//         console.error("Error fetching persons:", error);
//         throw new GraphQLError("Failed to fetch persons", {
//           extensions: { code: "INTERNAL_SERVER_ERROR" },
//         });
//       }
//     },
//     findPerson: async (root, args, context) => {
//       console.log("Query 'findPerson' called");

//       // Check if the user is authenticated
//       if (!context.currentUser) {
//         throw new GraphQLError("Authentication required", {
//           extensions: { code: "UNAUTHENTICATED" },
//         });
//       }

//       // Check if the name argument is provided and valid
//       if (!args.name || typeof args.name !== "string") {
//         throw new GraphQLError("Invalid name provided", {
//           extensions: { code: "BAD_USER_INPUT" },
//         });
//       }

//       try {
//         // Check if the person exists
//         const person = await Person.findOne({ name: args.name });

//         if (!person) {
//           throw new GraphQLError("Person not found", {
//             extensions: { code: "NOT_FOUND", invalidArgs: args.name },
//           });
//         }

//         // Return the found person
//         return person;
//       } catch (error) {
//         // report the previous GraphQLError
//         if (error instanceof GraphQLError) {
//           throw error;
//         }
//         console.error("Error fetching person:", error);
//         throw new GraphQLError("Failed to fetch person", {
//           extensions: { code: "INTERNAL_SERVER_ERROR" },
//         });
//       }
//     },

//     me: (root, args, context) => {
//       console.log("Query 'me' called");

//       // Check if the user is authenticated
//       if (!context.currentUser) {
//         console.log("Unauthenticated access attempt to 'me'");
//         throw new GraphQLError("Authentication required", {
//           extensions: { code: "UNAUTHENTICATED" },
//         });
//       }

//       return context.currentUser;
//     },
//   },
//   Person: {
//     address: (root) => {
//       return {
//         street: root.street,
//         city: root.city,
//       };
//     },
//   },

//   Mutation: {
//     addPerson: async (root, args, { currentUser }) => {
//       console.log("Mutation 'addPerson' called");

//       // Check if the user is authenticated
//       if (!currentUser) {
//         throw new GraphQLError("Authentication required", {
//           extensions: { code: "UNAUTHENTICATED" },
//         });
//       }

//       // Check if all required fields are present and valid
//       const requiredFields = ["name", "street", "city"];
//       const missingFields = requiredFields.filter(
//         (field) => !args[field] || typeof args[field] !== "string"
//       );

//       if (missingFields.length > 0) {
//         throw new GraphQLError("Missing or invalid required fields", {
//           extensions: {
//             code: "BAD_USER_INPUT",
//             invalidArgs: missingFields,
//           },
//         });
//       }
//       // if (!args.name || !args.street || !args.city) {
//       //   throw new GraphQLError("Name, street, and city are required", {
//       //     extensions: {
//       //       code: "BAD_USER_INPUT",
//       //       // invalidArgs: args,
//       //       invalidArgs: Object.keys(args).filter((key) => !args[key]),
//       //     },
//       //   });
//       // }

//       try {
//         // Check if the person already exists
//         const personExists = await Person.findOne({ name: args.name });
//         if (personExists) {
//           throw new GraphQLError("Name must be unique", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//               invalidArgs: args.name,
//             },
//           });
//         }

//         // Create a new person object
//         const person = new Person({ ...args });

//         // Save the person to the database and the returned object
//         const savedPerson = await person.save();

//         // Add the person to the current user's friends list
//         currentUser.friends = currentUser.friends.concat(savedPerson._id);
//         await currentUser.save();

//         // Return the saved person object
//         return savedPerson;
//       } catch (error) {
//         // if the error is a GraphQLError, rethrow it
//         if (error instanceof GraphQLError) {
//           throw error;
//         }

//         // Handle validation errors from Mongoose
//         if (error.name === "ValidationError") {
//           throw new GraphQLError("Validation error", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//               errorDetails: error.errors,
//             },
//           });
//         }

//         // Handle other errors
//         throw new GraphQLError("Saving person failed", {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//             error,
//           },
//         });
//       }
//     },

//     editNumber: async (root, args, { currentUser }) => {
//       console.log("Mutation 'editNumber' called");

//       // Check if the user is authenticated
//       if (!currentUser) {
//         throw new GraphQLError("Authentication required", {
//           extensions: { code: "UNAUTHENTICATED" },
//         });
//       }

//       // Check if the name and phone arguments are provided and valid
//       if (
//         !args.name ||
//         typeof args.name !== "string" ||
//         args.name.trim() === ""
//       ) {
//         throw new GraphQLError(
//           "Invalid or missing 'name'. It must be a non-empty string.",
//           {
//             extensions: { code: "BAD_USER_INPUT", invalidArgs: "name" },
//           }
//         );
//       }

//       if (
//         !args.phone ||
//         typeof args.phone !== "string" ||
//         args.phone.trim() === ""
//       ) {
//         throw new GraphQLError(
//           "Invalid or missing 'phone'. It must be a non-empty string.",
//           {
//             extensions: { code: "BAD_USER_INPUT", invalidArgs: "phone" },
//           }
//         );
//       }

//       try {
//         // Search for the person by name
//         const person = await Person.findOne({ name: args.name });

//         // Set error if person is not found
//         if (!person) {
//           throw new GraphQLError("Person not found", {
//             extensions: {
//               code: "NOT_FOUND",
//               invalidArgs: args.name,
//             },
//           });
//         }

//         // Update the phone number if the person is found
//         person.phone = args.phone;

//         // Save the updated person to the database and return the updated object
//         return await person.save();
//       } catch (error) {
//         // If the error is a GraphQLError, rethrow it
//         if (error instanceof GraphQLError) {
//           throw error;
//         }

//         // Sinon, on gère les autres types d'erreurs
//         if (error.name === "ValidationError") {
//           throw new GraphQLError("Validation error", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//               errorDetails: error.errors,
//             },
//           });
//         }

//         // Handle other errors
//         throw new GraphQLError("Saving number failed", {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//             invalidArgs: args.name,
//             error,
//           },
//         });
//       }
//     },

//     // Without password hashing :(
//     // createUser: async (root, args) => {
//     //   try {
//     //     // Create a new user object
//     //     const user = new User({ username: args.username });

//     //     // Save the user to the database
//     //     return await user.save();
//     //   } catch (error) {
//     //     // If the user creation fails, throw an error
//     //     throw new GraphQLError("Creating the user failed", {
//     //       extensions: {
//     //         code: "BAD_USER_INPUT",
//     //         invalidArgs: args.username,
//     //         error,
//     //       },
//     //     });
//     //   }
//     // },

//     createUser: async (root, args) => {
//       console.log("Mutation 'createUser' called");

//       // Check if the username and password are provided and valid
//       if (
//         !args.username ||
//         typeof args.username !== "string" ||
//         args.username.length < 3
//       ) {
//         throw new GraphQLError(
//           "Invalid username. It must be at least 3 characters long.",
//           {
//             extensions: { code: "BAD_USER_INPUT", invalidArgs: "username" },
//           }
//         );
//       }

//       if (
//         !args.password ||
//         typeof args.password !== "string" ||
//         args.password.length < 6
//       ) {
//         throw new GraphQLError(
//           "Invalid password. It must be at least 6 characters long.",
//           {
//             extensions: { code: "BAD_USER_INPUT", invalidArgs: "password" },
//           }
//         );
//       }

//       try {
//         // Hash the password before saving it
//         const saltRounds = 10;
//         const passwordHash = await bcrypt.hash(args.password, saltRounds);

//         // Create a new user object with the hashed password
//         const user = new User({
//           username: args.username,
//           passwordHash,
//         });

//         return await user.save();
//       } catch (error) {
//         // If the error is a duplicate key error (MongoDB) - error code 11000
//         if (error.code === 11000) {
//           throw new GraphQLError("Username already exists", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//               invalidArgs: "username",
//             },
//           });
//         }

//         // Handle validation errors from Mongoose
//         if (error.name === "ValidationError") {
//           throw new GraphQLError("Validation error", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//               errorDetails: error.errors,
//             },
//           });
//         }

//         // Handle other errors
//         throw new GraphQLError("Creating the user failed", {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//           },
//         });
//       }
//     },

//     login: async (root, args) => {
//       console.log("Login mutation called");

//       // Check if the username and password are provided and valid
//       if (!args.username || typeof args.username !== "string") {
//         throw new GraphQLError("Username is required", {
//           extensions: {
//             code: "BAD_USER_INPUT",
//             invalidArgs: "username",
//           },
//         });
//       }

//       if (!args.password || typeof args.password !== "string") {
//         throw new GraphQLError("Password is required", {
//           extensions: {
//             code: "BAD_USER_INPUT",
//             invalidArgs: "password",
//           },
//         });
//       }

//       try {
//         const user = await User.findOne({ username: args.username });

//         // Check if the user exists
//         if (!user) {
//           console.log(`Failed login attempt for username: ${args.username}`);
//           throw new GraphQLError("wrong credentials", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//             },
//           });
//         }

//         // Compare the provided password with the stored password hash
//         const isPasswordValid = await bcrypt.compare(
//           args.password,
//           user.passwordHash
//         );

//         if (!isPasswordValid) {
//           console.log(`Failed login attempt for username: ${args.username}`);
//           throw new GraphQLError("wrong credentials", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//             },
//           });
//         }

//         const userForToken = {
//           username: user.username,
//           id: user._id,
//         };

//         return {
//           token: jwt.sign(userForToken, process.env.JWT_SECRET, {
//             expiresIn: "1m",
//           }),
//         };
//       } catch (error) {
//         // If the error is a GraphQLError, rethrow it
//         if (error instanceof GraphQLError) {
//           throw error;
//         }

//         // If error is from JWT verification
//         if (error.name === "JsonWebTokenError") {
//           console.error("JWT error:", error.message);
//           throw new GraphQLError("Authentication system error", {
//             extensions: {
//               code: "INTERNAL_SERVER_ERROR",
//               errorType: error.name,
//               errorMessage: error.message,
//             },
//           });
//         }

//         // Handle other errors
//         console.error("Login error:", error);
//         throw new GraphQLError("Login failed due to a technical error", {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//           },
//         });
//       }
//     },

//     // Without password hashing :(
//     // login: async (root, args) => {
//     //   const user = await User.findOne({ username: args.username });

//     //   if (!user || args.password !== "secret") {
//     //     throw new GraphQLError("wrong credentials", {
//     //       extensions: {
//     //         code: "BAD_USER_INPUT",
//     //       },
//     //     });
//     //   }

//     //   const userForToken = {
//     //     username: user.username,
//     //     id: user._id,
//     //   };

//     //   return { token: jwt.sign(userForToken, process.env.JWT_SECRET) };
//     // },

//     addAsFriend: async (root, args, { currentUser }) => {
//       console.log("Mutation 'addAsFriend' called");

//       // Check if the user is authenticated
//       if (!currentUser) {
//         throw new GraphQLError("Authentication required", {
//           extensions: { code: "UNAUTHENTICATED" },
//         });
//       }

//       // Check if the name argument is provided and valid format
//       if (!args.name || typeof args.name !== "string") {
//         throw new GraphQLError("Invalid name provided", {
//           extensions: { code: "BAD_USER_INPUT" },
//         });
//       }

//       try {
//         // Check if the person exists
//         const person = await Person.findOne({ name: args.name });
//         if (!person) {
//           throw new GraphQLError("Person not found", {
//             extensions: { code: "NOT_FOUND", invalidArgs: args.name },
//           });
//         }

//         // Check if the person is already a friend
//         const isAlreadyFriend = currentUser.friends.some(
//           (friendId) => friendId.toString() === person._id.toString()
//         );

//         if (isAlreadyFriend) {
//           throw new GraphQLError("Person is already a friend", {
//             extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name },
//           });
//         }

//         // Add the person to the user's friends list
//         currentUser.friends = currentUser.friends.concat(person._id);
//         await currentUser.save();

//         // Return the updated user object with populated friends
//         return await currentUser.populate("friends");
//       } catch (error) {
//         // Si l'erreur est déjà une GraphQLError, on la propage
//         if (error instanceof GraphQLError) {
//           throw error;
//         }

//         // Si c'est une erreur de validation Mongoose
//         if (error.name === "ValidationError") {
//           console.error("Validation error:", error);
//           throw new GraphQLError("Validation error", {
//             extensions: {
//               code: "BAD_USER_INPUT",
//               errorDetails: error.errors,
//             },
//           });
//         }

//         // Pour les autres erreurs techniques
//         console.error("Error adding friend:", error);
//         throw new GraphQLError("Failed to add friend", {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//           },
//         });
//       }

//       // Less robust version
//       // // Check if the person exists
//       // const person = await Person.findOne({ name: args.name });
//       // if (!person) {
//       //   throw new GraphQLError("Person not found", {
//       //     extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name },
//       //   });
//       // }

//       // // Check if the person is already a friend
//       // const isAlreadyFriend = currentUser.friends.some(
//       //   (friendId) => friendId.toString() === person._id.toString()
//       // );

//       // if (isAlreadyFriend) {
//       //   throw new GraphQLError("Person is already a friend", {
//       //     extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name },
//       //   });
//       // }

//       // // Add the person to the user's friends list
//       // // Note: You can also use the $addToSet operator to avoid duplicates
//       // currentUser.friends = currentUser.friends.concat(person._id);
//       // await currentUser.save();

//       // // Return the updated user object with populated friends
//       // return await currentUser.populate("friends");
//     },
//   },
// };

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// startStandaloneServer(server, {
//   listen: { port: 4000 },
//   // context without error handling
//   // context: async ({ req, res }) => {
//   //   const auth = req ? req.headers.authorization : null;
//   //   if (auth && auth.startsWith("Bearer ")) {
//   //     const decodedToken = jwt.verify(
//   //       auth.substring(7),
//   //       process.env.JWT_SECRET
//   //     );
//   //     const currentUser = await User.findById(decodedToken.id).populate(
//   //       "friends"
//   //     );
//   //     return { currentUser };
//   //   }
//   // },
//   context: async ({ req, res }) => {
//     const auth = req ? req.headers.authorization : null;

//     if (auth && auth.startsWith("Bearer ")) {
//       try {
//         // Verify the token and extract the user ID
//         const decodedToken = jwt.verify(
//           auth.substring(7),
//           process.env.JWT_SECRET
//         );

//         // Get the current user from the database
//         const currentUser = await User.findById(decodedToken.id).populate(
//           "friends"
//         );

//         return { currentUser };
//       } catch (error) {
//         if (error.name === "TokenExpiredError") {
//           console.error("Token has expired:", error.message);
//           throw new GraphQLError("Token has expired", {
//             extensions: { code: "UNAUTHENTICATED" },
//           });
//         }

//         console.error("Invalid token:", error.message);
//         throw new GraphQLError("Invalid token", {
//           extensions: { code: "UNAUTHENTICATED" },
//         });
//       }
//     }
//     // If no token is provided or if it is invalid, return null
//     // This will allow unauthenticated access to the API
//     // Could modify this behavior as needed For example, you could throw an error or return a default user
//     return { currentUser: null };
//   },
// }).then(({ url }) => {
//   console.log(`🚀 Server ready at ${url}`);
// });

// // startStandaloneServer(server, {
// //   listen: { port: 4000 },
// // }).then(({ url }) => {
// //   console.log(`Server ready at ${url}`);
// // });

// //////////////////////////////////////////////////////////////////////////////////////

// // Used for mocking data
// // let persons = [
// //   {
// //     name: "Arto Hellas",
// //     phone: "040-123543",
// //     street: "Tapiolankatu 5 A",
// //     city: "Espoo",
// //     id: "3d594650-3436-11e9-bc57-8b80ba54c431",
// //   },
// //   {
// //     name: "Matti Luukkainen",
// //     phone: "040-432342",
// //     street: "Malminkaari 10 A",
// //     city: "Helsinki",
// //     id: "3d599470-3436-11e9-bc57-8b80ba54c431",
// //   },
// //   {
// //     name: "Venla Ruuska",
// //     street: "Nallemäentie 22 C",
// //     city: "Helsinki",
// //     id: "3d599471-3436-11e9-bc57-8b80ba54c431",
// //   },
// // ];

// // Used with mock data
// // const resolvers = {
// //   Query: {
// //     personCount: () => persons.length,
// //     allPersons: (root, args) => {
// //       if (!args.phone) {
// //         return persons;
// //       }
// //       const byPhone = (person) =>
// //         args.phone === "YES" ? person.phone : !person.phone;
// //       return persons.filter(byPhone);
// //     },
// //     findPerson: (root, args) => persons.find((p) => p.name === args.name),
// //   },
// //   Person: {
// //     address: ({ street, city }) => {
// //       return {
// //         street,
// //         city,
// //       };
// //     },
// //   },
// //   Mutation: {
// //     addPerson: (root, args) => {
// //       if (persons.find((p) => p.name === args.name)) {
// //         throw new GraphQLError("Name must be unique", {
// //           extensions: {
// //             code: "BAD_USER_INPUT",
// //             invalidArgs: args.name,
// //           },
// //         });
// //       }
// //       const person = { ...args, id: uuid() };
// //       persons = persons.concat(person);
// //       return person;
// //     },
// //     editNumber: (root, args) => {
// //       const person = persons.find((p) => p.name === args.name);
// //       if (!person) {
// //         return null;
// //       }

// //       const updatedPerson = { ...person, phone: args.phone };
// //       persons = persons.map((p) => (p.name === args.name ? updatedPerson : p));
// //       return updatedPerson;
// //     },
// //   },
// // };
