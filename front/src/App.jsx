import { gql, useQuery } from "@apollo/client";
import Persons from "./components/Persons";

const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`;

const App = () => {
  // Here we use the useQuery hook to send the query to the server.
  const result = useQuery(ALL_PERSONS);

  if (result.loading) {
    return <div>loading...</div>;
  }

  return <Persons persons={result.data.allPersons} />;
};

export default App;
