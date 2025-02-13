import { useQuery } from "@apollo/client";
import Persons from "./components/Persons";
import PersonForm from "./components/PersonForm";
import { ALL_PERSONS } from "./queries";

const App = () => {
  // Here we use the useQuery hook to send the query to the server.
  // const result = useQuery(ALL_PERSONS);

  const { loading, data, error } = useQuery(ALL_PERSONS, {
    // pollInterval: 2000, // Polling the server every 2 seconds
  });

  if (error) {
    return <div>error...</div>;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <Persons persons={data.allPersons} />
      <PersonForm />
    </div>
  );
};

export default App;
