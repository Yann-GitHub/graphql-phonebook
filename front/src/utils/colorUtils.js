/**
 * Generates an avatar color based on a person's name
 * @param {string} name - Person's name
 * @returns {string} - Hexadecimal color code
 */
export const getAvatarColor = (name) => {
  const colors = [
    "#646cff", // Blue/purple (main theme)
    "#ff6464", // Red
    "#64ff64", // Green
    "#ffb164", // Orange
    "#64b1ff", // Light blue
    "#9c64ff", // Purple
    "#ff64dc", // Pink
    "#ffdc64", // Yellow
    "#64ffdc", // Turquoise
    "#ff7c41", // Coral
  ];

  // Uses the first letter to ensure consistency
  const firstCharCode = name.charCodeAt(0);
  return colors[firstCharCode % colors.length];
};
