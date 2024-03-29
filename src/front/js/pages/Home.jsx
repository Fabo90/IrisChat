import React, { useState, useContext, useEffect, useRef } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Navbar } from "../component/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert";

export const Home = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [headerName, setHeaderName] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    actions.SocketConnection();
    store.socket.on("connect", () => {});
    store.socket.on("new_message", (data) => {
      console.log("New message received:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      if (store.socket) {
        store.socket.off("new_message");
        store.socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    actions.getUsers();
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

  useEffect(() => {
    if (selectedUser) {
      actions
        .getMessageHistory(store.userInfo.user_id, selectedUser.id)
        .then((data) => {
          setMessages(data);
        })
        .catch((error) => {
          console.error("Error fetching message history:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: "Failed to fetch message history. Please try again later.",
          });
        });
      store.socket.emit("join_room", {
        user_id: store.userInfo.user_id,
        other_user_id: selectedUser.id,
      });
    }
  }, [selectedUser]);

  const handleUserClick = (userName) => {
    const user = store.userNames.find((user) => user.user_name === userName);
    setSelectedUser(user);
    setHeaderName(user.user_name);
  };

  const handleMessageSend = () => {
    if (!selectedUser) return;
    if (messageInput.trim() === "") return;
    const senderId = store.userInfo.user_id;
    actions.postMessage(senderId, selectedUser.id, messageInput);
    setMessageInput("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender_id === store.userInfo.user_id
                    ? "sent"
                    : "received"
                }`}
              >
                <div className="message-footer">
                  <p className="message-text">{message.text}</p>
                </div>
                <div className="message-content">
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {selectedUser && (
            <div className="message-input">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleMessageSend();
                  }
                }}
              />
              <button onClick={handleMessageSend}>Send</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
