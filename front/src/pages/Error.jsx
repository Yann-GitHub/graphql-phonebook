import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div className="error">
      <h1>Error 404</h1>
      <p>Page not found.</p>
      <Link to="/">Return to home page</Link>
    </div>
  );
};

export default Error;
