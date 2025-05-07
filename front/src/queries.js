import { gql } from "@apollo/client";

// Fragment
export const PERSON_BASIC_DETAILS = gql`
  fragment PersonBasicDetails on Person {
    name
    phone
    id
  }
`;

export const PERSON_FULL_DETAILS = gql`
  fragment PersonFullDetails on Person {
    ...PersonBasicDetails
    address {
      street
      city
    }
  }
  ${PERSON_BASIC_DETAILS}
`;

export const USER_BASIC_DETAILS = gql`
  fragment UserBasicDetails on User {
    username
    id
  }
`;

export const USER_FULL_DETAILS = gql`
  fragment UserFullDetails on User {
    ...UserBasicDetails
    friends {
      ...PersonBasicDetails
    }
  }
  ${USER_BASIC_DETAILS}
  ${PERSON_BASIC_DETAILS}
`;

export const ALL_PERSONS = gql`
  query GetAllPersons {
    allPersons {
      ...PersonBasicDetails
    }
  }
  ${PERSON_BASIC_DETAILS}
`;

export const CREATE_PERSON = gql`
  mutation CreatePerson(
    $name: String!
    $street: String!
    $city: String!
    $phone: String
  ) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      ...PersonFullDetails
    }
  }
  ${PERSON_FULL_DETAILS}
`;

export const FIND_PERSON = gql`
  query FindPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonFullDetails
    }
  }
  ${PERSON_FULL_DETAILS}
`;

export const EDIT_NUMBER = gql`
  mutation EditNumber($id: ID!, $phone: String!) {
    editNumber(id: $id, phone: $phone) {
      ...PersonFullDetails
    }
  }
  ${PERSON_FULL_DETAILS}
`;

export const LOGIN = gql`
  mutation UserLogin($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const ME = gql`
  query GetCurrentUser {
    me {
      ...UserFullDetails
    }
  }
  ${USER_FULL_DETAILS}
`;

export const CREATE_USER = gql`
  mutation RegisterNewUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      ...UserBasicDetails
    }
  }
  ${USER_BASIC_DETAILS}
`;

export const ADD_FRIEND = gql`
  mutation AddAsFriend($id: ID!) {
    addAsFriend(id: $id) {
      ...UserFullDetails
    }
  }
  ${USER_FULL_DETAILS}
`;

export const TOGGLE_FRIEND = gql`
  mutation ToggleFriendStatus($id: ID!) {
    toggleFriendStatus(id: $id) {
      ...UserFullDetails
    }
  }
  ${USER_FULL_DETAILS}
`;
