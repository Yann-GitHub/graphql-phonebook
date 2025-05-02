import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>
          <Link to="/error" className="">
            Privacy Policy
          </Link>
          |
          <Link to="/error" className="">
            Terms of Service
          </Link>
        </p>
        <p>&copy; 2025 Phonebook App. All rights reserved.</p>
      </div>
    </footer>
  );
};
export default Footer;
