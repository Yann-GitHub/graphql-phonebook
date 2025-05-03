import { useState } from "react";
import { useQuery } from "@apollo/client";
import Person from "./Person";
import { FIND_PERSON, ALL_PERSONS } from "../queries";
import Loader from "./Loader";
import { useUserStore } from "../store";

function Persons() {
  const [nameToSearch, setNameToSearch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get the user from the store
  const user = useUserStore((state) => state.user);

  // Create a Set of friend IDs for quick lookup
  const friendIds = user
    ? new Set(user.friends?.map((friend) => friend.id) || [])
    : new Set();

  // Function to check if a person is a friend
  const isFriend = (personId) => friendIds.has(personId);

  const {
    loading: loadingAllPersons,
    error: errorAllPersons,
    data: allPersons,
  } = useQuery(ALL_PERSONS);

  const {
    loading: loadingPerson,
    // error: errorPerson,
    data: person,
  } = useQuery(FIND_PERSON, {
    variables: { nameToSearch },
    skip: !nameToSearch, // Skip the query if nameToSearch is null
  });

  if (errorAllPersons) {
    console.error("Error fetching persons:", errorAllPersons);
    return (
      <div className="error-container">
        <h3>Error fetching persons</h3>
        <p>{errorAllPersons.message}</p>
      </div>
    );
  }

  if (loadingAllPersons) {
    return <Loader />;
  }

  const personsList = allPersons?.allPersons || [];
  // console.log("personsList", personsList);

  // Filter the persons list based on the search query
  const filteredList = searchQuery
    ? personsList.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.phone && p.phone.includes(searchQuery))
      )
    : personsList;

  if (nameToSearch) {
    if (loadingPerson) {
      return <Loader />;
    }

    if (person && person.findPerson) {
      return (
        <Person
          person={person.findPerson}
          onClose={() => setNameToSearch(null)}
          isFriend={isFriend(person.findPerson.id)}
        />
      );
    }

    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h3>Person not found</h3>
          <p>We could not find anyone named {nameToSearch} in the phonebook.</p>
          <button onClick={() => setNameToSearch(null)}>
            Back to contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="persons-page">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery("")}>
            ✕
          </button>
        )}
      </div>

      {filteredList.length === 0 ? (
        <div className="no-results">
          <p>No contacts found matching {searchQuery}</p>
        </div>
      ) : (
        <div className="persons-grid">
          {filteredList.map((p) => (
            <div key={p.id || p.name} className="person-card">
              <div className="person-avatar">
                {p.name.charAt(0).toUpperCase()}
              </div>

              <div className="person-info">
                <div className="person-name-container">
                  <h3>{p.name}</h3>
                  {isFriend(p.id) && (
                    <span className="friend-badge" title="Friend">
                      ★
                    </span>
                  )}
                </div>
                <p className="phone-number">{p.phone || "No phone number"}</p>
              </div>

              <button
                className="details-button"
                onClick={() => setNameToSearch(p.name)}
              >
                Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Persons;
