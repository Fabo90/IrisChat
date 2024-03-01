import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert";
import "../../styles/userinfo.css";

export const UserInfo = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    actions.isLogged();
    actions.getInfo();
    if (!store.loggedIn) {
      navigate("/");
      Swal.fire({
        icon: "info",
        title: "Alert",
        text: "Your session has expired. Please log in",
      });
    }
  }, [store.token]);

  function handleSubmit(e) {
    e.preventDefault();
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Swal({
        icon: "error",
        title: "Error",
        text: "New password must be at least 8 characters long and contain at least one capital letter and one number",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      return;
    }
    actions.changePassword(currentPassword, newPassword, confirmPassword);
    actions.tokenLogout();
    navigate("/");
  }

  return (
    <div className="userinfo-container">
      <div className="container mt-5">
        <h2 className="mb-4">User Name</h2>
        <h4 className="mb-4">{store.userInfo}</h4>
        <h2 className="mb-4">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 col-3">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 col-3">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 col-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button-changePassword me-1">
            Change Password
          </button>
          <Link to={"/home"} className="button-goBack mx-1">
            Go Back
          </Link>
        </form>
      </div>
    </div>
  );
};
