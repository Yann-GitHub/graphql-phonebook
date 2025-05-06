import { useState } from "react";
import { useQuery } from "@apollo/client";
import Person from "./Person";
import { FIND_PERSON, ALL_PERSONS } from "../queries";
import Loader from "./Loader";
import { useUserStore } from "../store";
import { getAvatarColor } from "../utils/colorUtils";

function Persons() {
  const [nameToSearch, setNameToSearch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

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

  // Filter the list based on search query and favorite status
  const filteredList = personsList.filter((p) => {
    // Text search condition
    const matchesSearchQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery));

    // Favorite filter condition
    const matchesFavoriteFilter = !showOnlyFavorites || isFriend(p.id);

    // Combine both conditions
    return matchesSearchQuery && matchesFavoriteFilter;
  });

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

      {/* Filtre des favoris */}
      <div className="filter-container">
        <span className="toggle-label">Only favorites</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {filteredList.length === 0 ? (
        <div className="no-results">
          <p>
            {showOnlyFavorites
              ? "No favorite contacts found"
              : `No contacts found matching ${searchQuery}`}
          </p>
        </div>
      ) : (
        <div className="persons-grid">
          {filteredList.map((p) => (
            <div key={p.id || p.name} className="person-card">
              <div
                className="person-avatar"
                style={{ backgroundColor: getAvatarColor(p.name) }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              <div className="person-info">
                <div className="person-name-container">
                  <h3>{p.name}</h3>
                  {isFriend(p.id) && (
                    <span className="friend-badge" title="Favorite">
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
