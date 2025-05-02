import { Link, NavLink } from "react-router-dom";
import UserIcon from "../components/icons/UserIcon.jsx";

const Header = () => {
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

      <div className="user-icon-container">
        <UserIcon className="user-icon" />
        <Link to="/login" className="login-button">
          Login
        </Link>
      </div>
    </header>
  );
};
export default Header;
