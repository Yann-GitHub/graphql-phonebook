import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../queries";
import { useNotificationStore } from "../store/index.js";

const RegisterForm = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      addNotification({
        type: "success",
        message: "Account created successfully! You can now log in.",
      });
      onSuccess(); // Back to login
    },
    onError: (error) => {
      console.error("Registration error:", error);
      addNotification({
        type: "error",
        message: error.graphQLErrors[0]?.message || "Error creating account",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation locale
    if (password !== passwordConfirm) {
      addNotification({
        type: "error",
        message: "Passwords don't match",
      });

      setPassword("");
      setPasswordConfirm("");
      return;
    }

    if (password.length < 6) {
      addNotification({
        type: "error",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    createUser({
      variables: { username, password },
    });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="custom-form">
        <h2 className="form-title">Create an account</h2>
        <div className="form-main-wrap">
          <div className="form-group-wrap">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username (min. 3 characters)"
              required
              minLength={3}
            />
          </div>

          <div className="form-group-wrap">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              required
              minLength={8}
            />
          </div>

          <div className="form-group-wrap">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
