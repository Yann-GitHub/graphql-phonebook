import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import { useState, useEffect } from "react";
// import { useQuery, useApolloClient } from "@apollo/client";
// import { ALL_PERSONS } from "./queries";
// import Persons from "./components/Persons";
// import PersonForm from "./components/PersonForm";
// import Notify from "./components/Notify";
// import PhoneForm from "./components/PhoneForm";
// import LoginForm from "./components/LoginForm";
import Login from "./pages/Login";
import PersonsList from "./pages/PersonsList";
import NewPerson from "./pages/NewPerson";
import SharedLayout from "./pages/SharedLayout";
import Error from "./pages/Error";

const App = () => {
  // const [token, setToken] = useState(null);
  // const [errorMessage, setErrorMessage] = useState(null);
  // const client = useApolloClient();

  // Simple error handling function that sets the error message and clears it after 10 seconds.s
  // const notify = (message) => {
  //   setErrorMessage(message);
  //   setTimeout(() => {
  //     setErrorMessage(null);
  //   }, 10000);
  // };

  // useEffect(() => {
  //   // Solution to handle token expiration has there is no global state management :(
  //   const authMessage = localStorage.getItem("auth-message");
  //   if (authMessage) {
  //     notify(authMessage);
  //     localStorage.removeItem("auth-message");
  //   }

  //   // Check if a token is already stored in localStorage - in case of a page refresh
  //   const storedToken = localStorage.getItem("phonenumbers-user-token");
  //   if (storedToken) {
  //     setToken(storedToken);
  //   }
  // }, []);

  // const result = useQuery(ALL_PERSONS);
  // const { loading, data, error } = useQuery(ALL_PERSONS, {
  //   // pollInterval: 2000, // Polling the server every 2 seconds
  // });

  // if (error) {
  //   return <div>error...</div>;
  // }

  // if (loading) {
  //   return <div>loading...</div>;
  // }

  // const logout = () => {
  //   console.log("Logging out...");
  //   setToken(null);
  //   localStorage.clear();
  //   client.resetStore(); // Clear the Apollo Client cache
  // };

  // if (!token) {
  //   return (
  //     <>
  //       <Notify errorMessage={errorMessage} />
  //       <h2>Login</h2>
  //       <LoginForm setToken={setToken} setError={notify} />
  //     </>
  //   );
  // }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<PersonsList />} />
          <Route path="newPerson" element={<NewPerson />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
