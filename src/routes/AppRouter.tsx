import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/SignIn/SignIn";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
    </Routes>
  );
};

export default AppRouter;
