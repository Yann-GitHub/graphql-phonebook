import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ME, ALL_PERSONS, TOGGLE_FRIEND, EDIT_NUMBER } from "../queries";
import { useNotificationStore } from "../store/index.js";
import { useUserStore } from "../store/index.js";
import { getAvatarColor } from "../utils/colorUtils.js";

const Person = ({ person, onClose, isFriend }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [isFriendState, setIsFriendState] = useState(isFriend);

  const [editMode, setEditMode] = useState(false);
  const [phoneValue, setPhoneValue] = useState(person.phone || "");

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

  const [updatePhoneNumber, { loading: updatingPhone }] = useMutation(
    EDIT_NUMBER,
    {
      onCompleted: (data) => {
        console.log("Phone number updated:", data);
        addNotification({
          type: "success",
          message: `Phone number updated for ${data.editNumber.name}!`,
        });
      },
      onError: (error) => {
        console.error("Error updating phone number:", error);
        addNotification({
          type: "error",
          message:
            error.graphQLErrors[0]?.message || "Could not update phone number",
        });
        // Revenir à l'ancienne valeur en cas d'erreur
        setPhoneValue(person.phone || "");
      },
      refetchQueries: [{ query: ALL_PERSONS }],
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

  const handleEditToggle = () => {
    if (editMode) {
      // Si on quitte le mode édition, soumettre les changements
      if (phoneValue !== person.phone) {
        updatePhoneNumber({ variables: { id: person.id, phone: phoneValue } });
      }
    }
    setEditMode(!editMode);
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
          {/* <div className="detail-item">
            <span className="detail-icon">📱</span>
            <span className="detail-label">Phone:</span>
            <span className="detail-value">
              {person.phone || "No phone number"}
            </span>
          </div> */}
          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <span className="detail-label">Phone:</span>
            {editMode ? (
              <div className="detail-value edit-mode">
                <input
                  type="text"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  placeholder="Enter phone number"
                  className="phone-edit-input"
                  autoFocus
                />
                <div className="edit-actions">
                  <button
                    onClick={() => {
                      updatePhoneNumber({
                        variables: { id: person.id, phone: phoneValue },
                      });
                      setEditMode(false);
                    }}
                    disabled={updatingPhone}
                    className="save-btn"
                  >
                    {updatingPhone ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setPhoneValue(person.phone || "");
                      setEditMode(false);
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span className="detail-value">
                {person.phone || "No phone number"}
              </span>
            )}
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
          {/* <button className="action-button edit-button">✏️ Edit</button> */}
          <button
            className={`action-button ${
              editMode ? "save-button" : "edit-button"
            }`}
            onClick={handleEditToggle}
            disabled={updatingPhone}
          >
            {editMode ? "✓ Done" : "✏️ Edit"}
          </button>
          <button className="action-button close-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Person;
