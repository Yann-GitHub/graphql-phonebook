import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ME, ALL_PERSONS, TOGGLE_FRIEND } from "../queries";
import { useNotificationStore } from "../store/index.js";
import { useUserStore } from "../store/index.js";

const Person = ({ person, onClose, isFriend }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [isFriendState, setIsFriendState] = useState(isFriend);
  // const [isProcessing, setIsProcessing] = useState(false);

  // const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // Mutation to add a friend
  // const [addFriend, { loading: addingFriend }] = useMutation(ADD_FRIEND, {
  //   variables: { id: person.id },
  //   refetchQueries: [{ query: ME }, { query: ALL_PERSONS }],
  //   onCompleted: () => {
  //     setIsFriendState(true);
  //     const updatedUser = {
  //       ...user,
  //       friends: [...(user.friends || []), person],
  //     };
  //     setUser(updatedUser);
  //     addNotification({
  //       type: "success",
  //       message: `${person.name} added to your friends!`,
  //     });
  //   },
  //   onError: (error) => {
  //     console.error("Error adding friend:", error);
  //     addNotification({
  //       type: "error",
  //       message: error.graphQLErrors[0]?.message || "Could not add friend",
  //     });
  //   },
  // });

  // Mutation to toggle friend status
  const [toggleFriendStatus, { loading: processingFriend }] = useMutation(
    TOGGLE_FRIEND,
    {
      variables: { id: person.id },
      refetchQueries: [{ query: ME }, { query: ALL_PERSONS }],
      onCompleted: (data) => {
        // Check if the person is now in the friends list
        const isFriendNow = data.toggleFriendStatus.friends.some(
          (friend) => friend.id === person.id
        );

        setIsFriendState(isFriendNow);

        // Set user data in store
        setUser({
          ...data.toggleFriendStatus,
          profilePicture:
            data.toggleFriendStatus.profilePicture ||
            "https://thispersondoesnotexist.com/",
        });
        // const updatedUser = {
        //   ...user,
        //   friends: [...(user.friends || []), person],
        // };
        // setUser(updatedUser);

        // Show appropriate notification
        addNotification({
          type: "success",
          message: isFriendNow
            ? `${person.name} added to your favorites!`
            : `${person.name} removed from your favorites!`,
        });
      },
      onError: (error) => {
        console.error("Error toggling friend status:", error);
        addNotification({
          type: "error",
          message:
            error.graphQLErrors[0]?.message || "Could not change friend status",
        });
      },
    }
  );

  // Entry animation
  useEffect(() => {
    // Small delay to allow the CSS transition to take effect
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Update friend state when props change
  useEffect(() => {
    setIsFriendState(isFriend);
  }, [isFriend, person]);

  // Exit animation
  const handleClose = () => {
    setAnimateIn(false);
    // Delay the onClose callback to allow the exit animation to finish
    setTimeout(onClose, 300);
  };

  // Default avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "#646cff", // Couleur principale de votre thème
      "#ff6464", // Rouge
      "#64ff64", // Vert
      "#ffb164", // Orange
      "#64b1ff", // Bleu clair
    ];

    // Utiliser une somme simple des codes ASCII comme hash
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className={`person-details-overlay ${animateIn ? "visible" : ""}`}>
      <div className="person-details-backdrop" onClick={handleClose}></div>
      <div className="person-details-card">
        <div
          className="person-details-avatar"
          style={{ backgroundColor: getAvatarColor(person.name) }}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>

        <h2 className="person-details-name">{person.name}</h2>

        <div className="person-details-section">
          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <span className="detail-label">Phone:</span>
            <span className="detail-value">
              {person.phone || "No phone number"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-icon">🏠</span>
            <span className="detail-label">Address:</span>
            <div className="detail-value address">
              <div className="street">{person.address.street}</div>
              <div className="city">{person.address.city}</div>
            </div>
          </div>

          {/* <div className="detail-item">
            <span className="detail-icon">👫</span>
            <span className="detail-label">Is friend:</span>
            <span className="detail-value">{isFriendState ? "Yes" : "No"}</span>
          </div> */}
          {/* <div className="detail-item">
            <span className="detail-icon">👫</span>
            <span className="detail-label">Friend:</span>
            <div className="detail-value toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isFriendState}
                  onChange={toggleFriendStatus}
                  disabled={isLoading}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">
                {isLoading
                  ? isFriendState
                    ? "Removing..."
                    : "Adding..."
                  : isFriendState
                  ? "Yes"
                  : "No"}
              </span>
            </div>
          </div> */}
          {/* <div className="detail-item">
            <button
              className={`action-button ${
                isFriendState ? "remove-friend-button" : "add-friend-button"
              }`}
              onClick={toggleFriendStatus}
              disabled={processingFriend}
            >
              {processingFriend
                ? "Processing..."
                : isFriendState
                ? "❌ Remove friend"
                : "➕ Add friend"}
            </button>
          </div> */}
          <div className="detail-item">
            <span className="detail-icon">👤</span>
            <span className="detail-label">Favorite:</span>
            <div className="detail-value toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isFriendState}
                  onChange={toggleFriendStatus}
                  disabled={processingFriend}
                />
                <span className="toggle-slider"></span>
              </label>
              {/* <span className="toggle-label">
                {processingFriend
                  ? "Processing..."
                  : isFriendState
                  ? "In contacts"
                  : "Add to contacts"}
              </span> */}
            </div>
          </div>
        </div>

        <div className="person-details-actions">
          <button
            className="action-button call-button"
            disabled={!person.phone}
          >
            📞 Call
          </button>
          {/* {!isFriendState && (
            <button
              className="action-button add-friend-button"
              onClick={addFriend}
              disabled={addingFriend}
            >
              {addingFriend ? "Adding..." : "➕ Add friend"}
            </button>
          )} */}
          <button className="action-button edit-button">✏️ Edit</button>
          <button className="action-button close-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Person;
