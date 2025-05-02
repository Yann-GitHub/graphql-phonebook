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

import { useAuthStore, useNotificationStore } from "./store/index.js";

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;

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
      // Get the token from the Zustand store
      const token = useAuthStore.getState().token;

      if (token) {
        // Check if the token is expired or invalid
        console.log("Token expired or invalid, logging out...");

        useAuthStore.getState().logout();
        useNotificationStore.getState().addNotification({
          type: "error",
          message: "Your session has expired. Please log in again.",
        });

        // Redirection optionnelle
      } else {
        // Token is not present
        console.log("Authentication required for this operation");

        useNotificationStore.getState().addNotification({
          type: "error",
          message: "Please log in to access this resource.",
        });

        // Redirection optionnelle !!
      }
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

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, authLink, httpLink]),
  connectToDevTools: true,

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
