import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PersonsList from "./pages/PersonsList";
import NewPerson from "./pages/NewPerson";
import SharedLayout from "./pages/SharedLayout";
import Error from "./pages/Error";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<PersonsList />} />
          <Route path="newPerson" element={<NewPerson />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
