import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { signOut } from "../../redux/authSlice";

const Main: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome, {user?.username}!</h1>
      <button onClick={handleSignOut} style={{ padding: "8px 16px" }}>
        Sign Out
      </button>
    </div>
  );
};

export default Main;
