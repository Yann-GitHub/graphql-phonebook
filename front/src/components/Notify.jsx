import { useEffect, useState } from "react";

const Notify = ({ errorMessage }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);
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
