import { gql } from "@apollo/client";

export const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`;

export const CREATE_PERSON = gql`
  mutation createPerson(
    $name: String!
    $street: String!
    $city: String!
    $phone: String
  ) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`;

export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`;

export const EDIT_NUMBER = gql`
  mutation editNumber($id: ID!, $phone: String!) {
    editNumber(id: $id, phone: $phone) {
      name
      phone
      address {
        street
        city
      }
      id
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const ME = gql`
  query {
    me {
      username
      id
      friends {
        id
        name
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      id
      username
    }
  }
`;

export const ADD_FRIEND = gql`
  mutation addAsFriend($id: ID!) {
    addAsFriend(id: $id) {
      id
      username
      friends {
        id
        name
      }
    }
  }
`;

export const TOGGLE_FRIEND = gql`
  mutation toggleFriendStatus($id: ID!) {
    toggleFriendStatus(id: $id) {
      id
      username
      friends {
        id
        name
      }
    }
  }
`;
