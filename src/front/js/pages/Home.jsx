import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Navbar } from "../component/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Swal from "sweetalert";

export const Home = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [headerName, setHeaderName] = useState(null);

  useEffect(() => {
    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("new_message", (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });
    }
  }, [socket]);

  useEffect(() => {
    actions.getUser();
    actions.getInfo();
    actions.isLogged();
    if (!store.loggedIn) {
      navigate("/");
      Swal({
        icon: "info",
        title: "Alert",
        text: "Your session has expired. Please log in",
      });
    }
  }, [store.loggedIn]);

  const handleUserClick = (userName) => {
    const user = store.userNames.find((user) => user.user_name === userName);
    if (user) {
      actions.getInfo();
      setHeaderName(user.user_name);
      setSelectedUser(user);
      actions.getMessagesForUser(user.id);
      actions.getMessagesForCurrentUser(store.userInfo.user_id);
    }
  };

  const handleMessageSend = () => {
    if (messageInput.trim() === "") return;
    actions.getInfo();
    const senderId = store.userInfo.user_id;
    actions.postMessage(senderId, selectedUser.id, messageInput);
    setMessageInput("");
  };

  return (
    <>
      <Navbar />
      <div className="chat-dashboard">
        <div className="sidebar">
          <div className="header">
            <h2>Workspace Users</h2>
          </div>
          <div className="user-list">
            {store.userNames.map((user, index) => (
              <div
                key={index}
                className="user"
                onClick={() => handleUserClick(user.user_name)}
              >
                {user.user_name}
              </div>
            ))}
          </div>
        </div>
        <div className="chat-window">
          <div className="header">
            <h2>
              {headerName ? headerName : "Select a user to start chatting"}
            </h2>
          </div>
          <div className="messages">
            {selectedUser &&
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.user === "current_user" ? "sent" : "received"
                  }`}
                >
                  <span>{message.text}</span>
                  <span className="timestamp">{message.timestamp}</span>
                </div>
              ))}
          </div>
          {selectedUser && (
            <div className="message-input">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={handleMessageSend}>Send</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
