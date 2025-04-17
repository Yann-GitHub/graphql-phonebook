import ReactDOM from "react-dom/client";
import App from "./App";
// import { ALL_PERSONS } from "./queries";
import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

// Used for quick testing of the Apollo Client connection.
// client.query({ query: ALL_PERSONS }).then((response) => {
//   console.log(response.data);
// });

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
