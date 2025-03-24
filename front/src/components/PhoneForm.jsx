import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";

import { EDIT_NUMBER } from "../queries";

const PhoneForm = ({ setError }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [changeNumber, result] = useMutation(EDIT_NUMBER, {
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      setError(messages);
    },
  });

  const submit = (event) => {
    event.preventDefault();

    changeNumber({ variables: { name, phone } });

    setName("");
    setPhone("");

    // If the mutation is successful, the result object will contain the data returned by the server.
    // If the mutation fails, the result object will contain an error property.
    // console.log("result", result);
    // console.log("result.data", result.data);
    // console.log("result.error", result.error);

    // setError(`Number changed successfully for ${name} to ${phone}`);
  };

  useEffect(() => {
    if (result.data && result.data.editNumber === null) {
      setError("person not found");
    }
  }, [result.data]); // eslint-disable-line

  return (
    <div>
      <h2>change number</h2>

      <form onSubmit={submit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone
          <input
            value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <button type="submit">change number</button>
      </form>
    </div>
  );
};

export default PhoneForm;
