import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
// import { ALL_PERSONS } from "./queries";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("phonenumbers-user-token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const httpLink = createHttpLink({
  uri: "http://localhost:4000",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    const authError = graphQLErrors.find(
      ({ extensions }) => extensions.code === "UNAUTHENTICATED"
    );
    if (authError) {
      console.log("Token expired, logging out...");
      localStorage.removeItem("phonenumbers-user-token");
      window.location.reload(); // solution before global state management :(
    }
  }
  // Log all GraphQL errors
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, authLink, httpLink]),

  // uri: "http://localhost:4000",
  // link: createHttpLink({
  //   uri: authLink.concat(httpLink),
  // }),
  // link: authLink.concat(httpLink),
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
