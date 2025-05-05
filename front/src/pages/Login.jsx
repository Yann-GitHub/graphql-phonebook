import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

const Login = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="login-page">
      {/* <h2>{showRegister ? "Register" : "Login"}</h2> */}
      {/* <div className="login-page">
        <LoginForm />
      </div> */}
      {showRegister ? (
        <>
          <RegisterForm onSuccess={() => setShowRegister(false)} />
          <p className="auth-toggle">
            Already have an account?{" "}
            <button onClick={() => setShowRegister(false)}>
              Login instead
            </button>
          </p>
        </>
      ) : (
        <>
          <LoginForm />
          <p className="auth-toggle">
            Do not have an account yet?{" "}
            <button onClick={() => setShowRegister(true)}>Register now</button>
          </p>
        </>
      )}
    </div>
  );
};

export default Login;
