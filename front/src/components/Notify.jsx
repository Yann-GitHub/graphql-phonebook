import { useEffect, useState } from "react";

const Notify = ({ errorMessage }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (!errorMessage) {
    return null;
  }
  return (
    <div className={`notification ${show ? "show" : ""}`}> {errorMessage} </div>
  );
};

export default Notify;
