import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

function SharedLayout() {
  return (
    <div className="sharedLayout">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default SharedLayout;
