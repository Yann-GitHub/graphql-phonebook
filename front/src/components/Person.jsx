import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ME, ALL_PERSONS, TOGGLE_FRIEND } from "../queries";
import { useNotificationStore } from "../store/index.js";
import { useUserStore } from "../store/index.js";
import { getAvatarColor } from "../utils/colorUtils.js";

const Person = ({ person, onClose, isFriend }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [isFriendState, setIsFriendState] = useState(isFriend);

  const setUser = useUserStore((state) => state.setUser);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

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

        // Show notification
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
