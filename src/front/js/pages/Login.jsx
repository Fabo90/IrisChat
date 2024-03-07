import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert";
import background from "../../img/background.png";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

import "../../styles/login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [inputUser, setInputUser] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const save = () => {
    actions
      .postLogin(inputUser, inputPassword)
      .then(() => {
        // If login is successful and socket is not already connected, establish socket connection
        if (!isSocketConnected) {
          actions.SocketConnection();
          setIsSocketConnected(true);
          console.log(store.socket);
        }
      })
      .catch((error) => {
        Swal({
          icon: "error",
          title: "Error",
          text: error.message || "An error occurred during login",
        });
      });
  };

  useEffect(() => {
    if (store.socket) {
      store.socket.on("connect", () => {
        joinRoom(); // Join the room when connected
        navigate("/home");
      });
    }
  }, [store.socket]);

  const joinRoom = () => {
    const token = localStorage.getItem("token");
    if (store.socket && token) {
      store.socket.emit("join_room", { token });
    }
  };

  return (
    <div className="login-container">
      <div
        className="container"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div>
          <div className="form-signin">
            <form className="text-center">
              <div className="form-floating m-1">
                <input
                  type="text"
                  className="form-control"
                  id="user"
                  placeholder="User name"
                  onChange={(e) => setInputUser(e.target.value)}
                  value={inputUser}
                />
                <label htmlFor="user">User name</label>
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
              <div>
                <button
                  className="button-login m-2"
                  type="button"
                  onClick={() => {
                    if (inputUser !== "" && inputPassword !== "") {
                      save();
                    } else {
                      Swal({
                        icon: "error",
                        title: "Error",
                        text: "Please fill out all input fields",
                      });
                    }
                  }}
                >
                  Log in
                </button>
                <button
                  className="button-login m-2"
                  type="button"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
