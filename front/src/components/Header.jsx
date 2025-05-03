import { Link, NavLink, useNavigate } from "react-router-dom";
import UserIcon from "../components/icons/UserIcon.jsx";
import UserIconOutLine from "./icons/UserIconOutLine.jsx";
import {
  useAuthStore,
  useUserStore,
  useNotificationStore,
} from "../store/index.js";

const Header = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const user = useUserStore((state) => state.user);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addNotification({
      type: "success",
      message: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  return (
    <header className="header">
      <nav className="">
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Persons
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/newPerson"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Add Person
            </NavLink>
          </li>
        </ul>
      </nav>
      {token ? (
        <div className="user-icon-container">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="profile-picture"
            />
          ) : (
            <UserIconOutLine className="user-icon" />
          )}
          <span className="username">
            {user?.username
              ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
              : "User"}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <div className="user-icon-container">
          <UserIcon className="user-icon" />
          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>
      )}
    </header>
  );
};
export default Header;
