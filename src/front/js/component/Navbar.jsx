import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../img/Logo.png";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

  function handleLogOut() {
    actions.tokenLogout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to={"/home"}>
          <img src={Logo} alt="IRIS Logo" />
        </Link>
        <div className="navbar-nav ms-auto">
          <div className="dropdown">
            <button
              className="dropdown-toggle d-inline-flex"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <p className="navbarUser">{store.userInfo.user_name}</p>
            </button>
            <ul
              className="dropdown-menu dropdown-menu-dark dropdown-menu-end"
              aria-labelledby="userDropdown"
            >
              <li
                type="button"
                className="dropdown-item"
                onClick={handleLogOut}
              >
                Log Out
              </li>
              <li>
                <Link className="dropdown-item" to="/userinfo">
                  User Information
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};
