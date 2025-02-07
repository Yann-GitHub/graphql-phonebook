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
  // const result = useQuery(ALL_PERSONS);
  const { loading, data, error } = useQuery(ALL_PERSONS);

  if (error) {
    return <div>error...</div>;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  return <Persons persons={data.allPersons} />;
};

export default App;
