import React, { useState } from "react";
import "../../styles/home.css";
import { Navbar } from "../component/Navbar.jsx";

export const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  const userList = ["User 1", "User 2", "User 3", "User 4", "User 5"];

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

  return (
    <>
      <Navbar />
      <div className="chat-dashboard">
        <div className="sidebar">
          <div className="header">
            <h2>Workspace Users</h2>
          </div>
          <div className="user-list">
            {userList.map((user, index) => (
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
