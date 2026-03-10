import React, { type JSX } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/hooks/store";
import SignIn from "./pages/SignIn/SignIn";
import Main from "./pages/MainPage/MainPage";
import { useAppSelector } from "./redux/hooks/hooks";

// eslint-disable-next-line react-refresh/only-export-components
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return <Navigate to="/signin" replace />;
  return children;
};

// eslint-disable-next-line react-refresh/only-export-components
const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/signin" element={<SignIn />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Main />
        </ProtectedRoute>
      }
    />
  </Routes>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
