const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const { GraphQLError } = require("graphql");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Person = require("./models/persons");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

// Used for mocking data
// let persons = [
//   {
//     name: "Arto Hellas",
//     phone: "040-123543",
//     street: "Tapiolankatu 5 A",
//     city: "Espoo",
//     id: "3d594650-3436-11e9-bc57-8b80ba54c431",
//   },
//   {
//     name: "Matti Luukkainen",
//     phone: "040-432342",
//     street: "Malminkaari 10 A",
//     city: "Helsinki",
//     id: "3d599470-3436-11e9-bc57-8b80ba54c431",
//   },
//   {
//     name: "Venla Ruuska",
//     street: "Nallemäentie 22 C",
//     city: "Helsinki",
//     id: "3d599471-3436-11e9-bc57-8b80ba54c431",
//   },
// ];

const typeDefs = `
  type Address {
    street: String!
    city: String! 
  }

  enum YesNo {
    YES
    NO
  }
  
  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(
      name: String!
      phone: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) {
        return Person.find({});
      }

      return Person.find({ phone: { $exists: args.phone === "YES" } });
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
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
    addPerson: async (root, args) => {
      // Check if all required fields are present
      if (!args.name || !args.street || !args.city) {
        throw new GraphQLError("Name, street, and city are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            // invalidArgs: args,
            invalidArgs: Object.keys(args).filter((key) => !args[key]),
          },
        });
      }

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

      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError("Saving person failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      return person.save();
    },

    editNumber: async (root, args) => {
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

      try {
        // Save the updated person to the database
        await person.save();
      } catch (error) {
        throw new GraphQLError("Saving number failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      return person.save();
    },
  },
};

// Used with mock data
// const resolvers = {
//   Query: {
//     personCount: () => persons.length,
//     allPersons: (root, args) => {
//       if (!args.phone) {
//         return persons;
//       }
//       const byPhone = (person) =>
//         args.phone === "YES" ? person.phone : !person.phone;
//       return persons.filter(byPhone);
//     },
//     findPerson: (root, args) => persons.find((p) => p.name === args.name),
//   },
//   Person: {
//     address: ({ street, city }) => {
//       return {
//         street,
//         city,
//       };
//     },
//   },
//   Mutation: {
//     addPerson: (root, args) => {
//       if (persons.find((p) => p.name === args.name)) {
//         throw new GraphQLError("Name must be unique", {
//           extensions: {
//             code: "BAD_USER_INPUT",
//             invalidArgs: args.name,
//           },
//         });
//       }
//       const person = { ...args, id: uuid() };
//       persons = persons.concat(person);
//       return person;
//     },
//     editNumber: (root, args) => {
//       const person = persons.find((p) => p.name === args.name);
//       if (!person) {
//         return null;
//       }

//       const updatedPerson = { ...person, phone: args.phone };
//       persons = persons.map((p) => (p.name === args.name ? updatedPerson : p));
//       return updatedPerson;
//     },
//   },
// };

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
