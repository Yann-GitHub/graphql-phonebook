import { useQuery } from "@apollo/client";
import Persons from "./components/Persons";
import PersonForm from "./components/PersonForm";
import { ALL_PERSONS } from "./queries";
import { useState } from "react";
import Notify from "./components/Notify";
import PhoneForm from "./components/PhoneForm";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
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

  // Simple error handling function that sets the error message and clears it after 10 seconds.s
  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <Persons persons={data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </div>
  );
};

export default App;
