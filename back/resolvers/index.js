const personResolvers = require("./personResolvers");
const userResolvers = require("./userResolvers");

const resolvers = {
  Query: {
    ...personResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...personResolvers.Mutation,
    ...userResolvers.Mutation,
  },
  Person: personResolvers.Person,
};

module.exports = resolvers;
