import { useEffect, useState } from "react";

const Person = ({ person, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);

  // Animation d'entrée
  useEffect(() => {
    // Petit délai pour permettre au DOM de se mettre à jour avant l'animation
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fonction pour gérer la fermeture avec animation
  const handleClose = () => {
    setAnimateIn(false);
    // Attendre que l'animation de sortie soit terminée avant de fermer
    setTimeout(onClose, 300);
  };

  // Déterminer la couleur de l'avatar en fonction du nom
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

          <div className="detail-item">
            <span className="detail-icon">🆔</span>
            <span className="detail-label">ID:</span>
            <span className="detail-value id">{person.id}</span>
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
