import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Navbar } from "../component/Navbar.jsx";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    // You can implement logic here to fetch messages for the selected user
    // and update the 'messages' state accordingly.
  };

  const handleMessageChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleMessageSend = () => {
    if (messageInput.trim() === "") return;
    const newMessage = {
      user: "current_user", // Assuming the current user is sending the message
      text: messageInput,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);
    setMessageInput("");
    // You can implement logic here to send the message to the selected user
  };

  useEffect(() => {
    actions.getUser();
    actions.isLogged();
    if (!store.loggedIn) {
      navigate("/");
      Swal.fire({
        icon: "info",
        title: "Alert",
        text: "Your session has expired. Please log in",
      });
    }
  }, [store.loggedIn]);

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
                onClick={() => handleUserClick(user)}
              >
                {user}
              </div>
            ))}
          </div>
        </div>
        <div className="chat-window">
          <div className="header">
            <h2>
              {selectedUser ? selectedUser : "Select a user to start chatting"}
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
                onChange={handleMessageChange}
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
