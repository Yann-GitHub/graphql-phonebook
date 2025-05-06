const typeDefs = `

 type User {
    username: String!
    friends: [Person!]!
    id: ID!
  }

  type Token {
    token: String!
  }

  type Address {
    street: String!
    city: String! 
  }

  enum YesNo {
    YES
    NO
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(
      id: ID!
      phone: String!
    ): Person

    createUser(
      username: String!
      password: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

    addAsFriend(
      id: ID!
    ): User

    toggleFriendStatus(
      id: ID!
    ): User
  }
`;

module.exports = typeDefs;
