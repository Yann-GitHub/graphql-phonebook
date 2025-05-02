import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ALL_PERSONS, CREATE_PERSON } from "../queries";

const PersonForm = ({ setError }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  // Here we use the useMutation hook to send the mutation to the server.
  // Cache is updated automatically.
  const [createPerson] = useMutation(CREATE_PERSON, {
    // refetchQueries: [{ query: ALL_PERSONS }],

    // This is a more efficient way to update the cache than refetching the query.
    update: (cache, response) => {
      cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
        return { allPersons: allPersons.concat(response.data.addPerson) };
      });
    },
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      setError(messages);
    },
  });

  const submit = (event) => {
    event.preventDefault();

    // createPerson({ variables: { name, phone, street, city } });

    // We can also use the following syntax to conditionally add the phone variable to the variables object.
    const variables = { name, street, city };
    if (phone) {
      variables.phone = phone;
    }

    createPerson({ variables });

    setName("");
    setPhone("");
    setStreet("");
    setCity("");
  };

  return (
    <div>
      <form onSubmit={submit} className="custom-form larger">
        {/* <h2 className="form-title">Add new person</h2> */}
        <div className="form-main-wrap">
          <div className="form-group-wrap">
            <label htmlFor="">name</label>
            <input
              value={name}
              type="text"
              placeholder="Example: John Doe"
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div className="form-group-wrap">
            <label htmlFor="">phone</label>
            <input
              type="text"
              value={phone}
              placeholder="Example: 123-456-7890"
              onChange={({ target }) => setPhone(target.value)}
            />
          </div>
          <div className="form-group-wrap">
            <label htmlFor="">street</label>
            <input
              type="text"
              value={street}
              placeholder="Example: 123 Main St"
              onChange={({ target }) => setStreet(target.value)}
            />
          </div>
          <div className="form-group-wrap">
            <label htmlFor="">city</label>
            <input
              type="text"
              value={city}
              placeholder="Example: New York"
              onChange={({ target }) => setCity(target.value)}
            />
          </div>
        </div>
        <button type="submit">add</button>
      </form>
    </div>
  );
};

export default PersonForm;
