import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const LoginForm = ({ setError, setToken }) => {
  // Form control with local state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.token;
      setToken(token);
      localStorage.setItem("phonenumbers-user-token", token);
    }
  }, [result.data, setToken]);

  const submit = async (event) => {
    event.preventDefault();

    login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  return (
    <div className="form-container">
      <form onSubmit={submit} className="custom-form">
        {/* <h2 className="form-title">Login form</h2> */}
        <div className="form-main-wrap">
          <div className="form-group-wrap">
            <label htmlFor="">username</label>
            <input
              value={username}
              type="text"
              placeholder="Example: johndoe"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div className="form-group-wrap">
            <label htmlFor="">password</label>
            <input
              type="password"
              value={password}
              placeholder="Example: ********"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
