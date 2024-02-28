import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import Swal from "sweetalert";
import backgroundsignup from "../../img/backgroundsignup.png";
import "../../styles/signup.css";
import { useNavigate } from "react-router-dom";

export const SignUp = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [inputUser, setInputUser] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputConfirmPassword, setInputConfirmPassword] = useState("");

  /*  function save() {
    actions.postSignUp(inputUser, inputEmail, inputPassword);
    navigate("/");
  } */

  return (
    <div
      className="container"
      style={{ backgroundImage: `url(${backgroundsignup})` }}
    >
      <div>
        <div className="form-signin">
          <form className="text-center">
            <div className="form-floating m-1">
              <input
                type="text"
                className="form-control"
                id="userName"
                placeholder="User name"
                onChange={(e) => setInputUser(e.target.value)}
                value={inputUser}
              />
              <label htmlFor="userName">User name</label>
            </div>
            <div className="form-floating m-1">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="name@example.com"
                onChange={(e) => setInputEmail(e.target.value)}
                value={inputEmail}
              />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-floating m-1">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                onChange={(e) => setInputPassword(e.target.value)}
                value={inputPassword}
              />
              <label htmlFor="password">Password</label>
            </div>
            <div className="form-floating m-1">
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm password"
                onChange={(e) => setInputConfirmPassword(e.target.value)}
                value={inputConfirmPassword}
              />
              <label htmlFor="confirmPassword">Confirm password</label>
            </div>
            <div>
              <button
                className="button-signup m-2"
                type="button"
                onClick={() => {
                  if (inputPassword !== inputConfirmPassword) {
                    Swal.fire({
                      icon: "info",
                      title: "Alert",
                      text: "Please confirm your password to continue",
                    });
                  } else if (
                    inputUser !== "" &&
                    inputEmail !== "" &&
                    inputPassword !== "" &&
                    inputConfirmPassword !== ""
                  ) {
                    save();
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Please fill out all input fields",
                    });
                  }
                }}
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
