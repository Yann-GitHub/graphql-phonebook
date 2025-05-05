import { useState } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { LOGIN, ME } from "../queries";
import {
  useAuthStore,
  useUserStore,
  useNotificationStore,
} from "../store/index.js";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader.jsx";

const LoginForm = () => {
  // Zustand stores
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // Form control with local state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Local loading state for fetching user - Resolving the issue with the ME query
  const [fetchingUser, setFetchingUser] = useState(false);

  // React Router
  const navigate = useNavigate();

  // Lazy query to get current user data after
  const [getMe] = useLazyQuery(ME, {
    onCompleted: (data) => {
      console.log("getMe onCompleted with:", data);
      // Update user state in store
      // setUser({
      //   id: data.me.id,
      //   username: data.me.username,
      //   friends: data.me.friends,
      //   profilePicture:
      //     data.me.profilePicture || "https://thispersondoesnotexist.com/",
      // });
      setUser({
        ...data.me,
        profilePicture:
          data.me.profilePicture || "https://thispersondoesnotexist.com/",
      });
      setFetchingUser(false); // Stop loader
      navigate("/"); // Now safe to navigate
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
      addNotification({
        type: "error",
        message: "Impossible de récupérer vos informations utilisateur",
      });
      setFetchingUser(false); // Stop loader even on error
    },
    fetchPolicy: "network-only", // Force fresh fetch after login
  });

  // Mutation to login
  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      addNotification({
        type: "success",
        message: "Connexion réussie !",
      });
      setToken(data.login.token);
      setFetchingUser(true);
      getMe(); // Fetch user data after login
    },
    onError: (error) => {
      console.error("Login error:", error);
      addNotification({
        type: "error",
        message:
          error.graphQLErrors[0]?.message || "Erreur lors de la connexion",
      });
    },
  });

  const submit = (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  // Render loading state if fetching user after login
  if (fetchingUser) {
    return <Loader />;
  }

  return (
    <div className="form-container">
      <form onSubmit={submit} className="custom-form">
        <h2 className="form-title">Login form</h2>
        <div className="form-main-wrap">
          <div className="form-group-wrap">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              value={username}
              type="text"
              placeholder="Example: johndoe"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div className="form-group-wrap">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              placeholder="Example: ********"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
