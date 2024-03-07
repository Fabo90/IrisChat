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
  const [headerName, setHeaderName] = useState(null);

  useEffect(() => {
    // Listen for the new_message event
    console.log(io.version);
    console.log(store.socket);
    store.socket.on("new_message", (data) => {
      // Handle the incoming message
      console.log("New message received:", data);
      // Update your store or state with the new message
      // Example: actions.updateMessages(data);
    });

    return () => {
      // Clean up socket connection when component unmounts
      store.socket.disconnect();
    };
  }, []);

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
    console.log(store.messages);
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
              store.messages[selectedUser.id]?.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.sender_id === store.userInfo.user_id
                      ? "sent"
                      : "received"
                  }`}
                >
                  <span>{message.message_text}</span>
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
