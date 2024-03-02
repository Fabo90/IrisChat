import Swal from "sweetalert";

const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      userInfo: "",
      loggedIn: false,
      token: null,
      userNames: [],
    },
    actions: {
      postLogin: async (user, password) => {
        let data = {
          user_name: user,
          password: password,
        };
        try {
          const response = await fetch(process.env.BACKEND_URL + "/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          const json = await response.json();

          if (!response.ok) {
            console.log(response.statusText);
            Swal({
              icon: "error",
              title: "Error",
              text: "Wrong user or password",
            });
            return;
          }

          const expirationTime = new Date().getTime() + 30 * 60 * 1000;
          getActions().tokenLogin(json.access_token, expirationTime);
          setStore({ token: json.access_token });
        } catch (error) {
          console.log("Error login in", error);
          Swal({
            icon: "error",
            title: "Error",
            text: "Failed to log in. Please try again later.",
          });
        }
      },
      postSignUp: async (user, email, password) => {
        let newUser = {
          email: email,
          user_name: user,
          password: password,
        };
        try {
          const response = await fetch(
            process.env.BACKEND_URL + "/api/signup",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newUser),
            }
          );
          const json = await response.json();

          if (!response.ok) {
            console.log(response.statusText);
            return Swal({
              icon: "error",
              title: "Error",
              text: "User name or email already registered, please try again",
            });
          }

          Swal({
            icon: "success",
            title: "Success",
            text: "User created, please log in",
          });
        } catch (error) {
          console.log("Error creating user:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: "Failed to create user. Please try again later.",
          });
        }
      },
      tokenLogin: (token, expirationTime) => {
        setStore({ loggedIn: true });
        localStorage.setItem("token", token);
        localStorage.setItem("expirationTime", expirationTime);
      },
      tokenLogout: () => {
        setStore({ loggedIn: false });
        localStorage.removeItem("token");
        localStorage.removeItem("expirationTime");
        setStore({ token: null });
      },
      isLogged: () => {
        const token = localStorage.getItem("token");
        const expirationTime = localStorage.getItem("expirationTime");

        if (token && expirationTime) {
          if (new Date().getTime() < parseInt(expirationTime)) {
            setStore({ loggedIn: true });
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("expirationTime");
            setStore({ loggedIn: false });
          }
        } else {
          setStore({ loggedIn: false });
        }
      },
      getInfo: async () => {
        try {
          const store = getStore();
          const token = store.token || localStorage.getItem("token");

          if (!token) {
            Swal({
              icon: "error",
              title: "Error",
              text: "Session expired, please log in again",
              didClose: () => {
                window.location.href = "/";
              },
            });
            throw new Error("Token is missing");
          }

          const response = await fetch(
            process.env.BACKEND_URL + "/api/protected",
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }

          const json = await response.json();
          setStore({ userInfo: json });
        } catch (error) {
          console.log("Error getting user information:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: "Failed to obtain user information. Please try again later.",
          });
        }
      },
      changePassword: async (currentPassword, newPassword, confirmPassword) => {
        let passwordInfo = {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        };
        try {
          const store = getStore();
          const token = store.token || localStorage.getItem("token");

          if (!token) {
            Swal({
              icon: "error",
              title: "Error",
              text: "Session expired, please log in again",
              didClose: () => {
                window.location.href = "/";
              },
            });
            throw new Error("Token is missing");
          }
          const response = await fetch(
            process.env.BACKEND_URL + "/api/change_password",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify(passwordInfo),
            }
          );
          const data = await response.json();

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error("Incorrect current password");
            } else if (response.status === 400) {
              throw new Error("New password and confirm password do not match");
            } else {
              throw new Error(
                "Failed to change password. Please try again later."
              );
            }
          }

          Swal({
            icon: "success",
            title: "Success",
            text: "Password changed, please log in again",
          });
        } catch (error) {
          console.log("Error changing password:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: error.message + ", please log in and try again",
          });
        }
      },
      getUser: async () => {
        try {
          const store = getStore();
          const token = store.token || localStorage.getItem("token");

          if (!token) {
            Swal({
              icon: "error",
              title: "Error",
              text: "Session expired, please log in again",
              didClose: () => {
                window.location.href = "/";
              },
            });
            throw new Error("Token is missing");
          }
          const response = await fetch(process.env.BACKEND_URL + "/api/user", {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();

          setStore({ userNames: data });
        } catch (error) {
          console.error("Error fetching user:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: "Failed to get Users. Please try again later.",
          });
        }
      },
      postMessage: async (senderId, receiverId, messageText) => {
        let newMessage = {
          sender_id: senderId,
          receiver_id: receiverId,
          message_text: messageText,
        };
        try {
          const store = getStore();
          const token = store.token || localStorage.getItem("token");

          if (!token) {
            Swal({
              icon: "error",
              title: "Error",
              text: "Session expired, please log in again",
              didClose: () => {
                window.location.href = "/";
              },
            });
            throw new Error("Session expired, please log in again");
          }
          const response = await fetch(
            process.env.BACKEND_URL + "/api/send_message",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify(newMessage),
            }
          );
          if (!response.ok) {
            throw new Error("Failed to send message");
          }
        } catch (error) {
          console.error("Error sending message:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        }
      },
      getMessagesForUser: async (userId) => {
        try {
          const store = getStore();
          const token = store.token || localStorage.getItem("token");

          if (!token) {
            Swal({
              icon: "error",
              title: "Error",
              text: "Session expired, please log in again",
              didClose: () => {
                window.location.href = "/";
              },
            });
            throw new Error("Session expired, please log in again");
          }
          const response = await fetch(
            process.env.BACKEND_URL + `/api/get_messages/${userId}`,
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          const data = await response.json();
          // Process received messages
          // Update store or perform any other actions as needed
        } catch (error) {
          console.error("Error getting messages:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        }
      },
      getMessagesForCurrentUser: async (currentUserId) => {
        try {
          const store = getStore();
          const token = store.token || localStorage.getItem("token");

          if (!token) {
            Swal({
              icon: "error",
              title: "Error",
              text: "Session expired, please log in again",
              didClose: () => {
                window.location.href = "/";
              },
            });
            throw new Error("Session expired, please log in again");
          }
          const response = await fetch(
            process.env.BACKEND_URL + `/api/get_messages/${currentUserId}`,
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          const data = await response.json();
          // Process received messages
          // Update store or perform any other actions as needed
        } catch (error) {
          console.error("Error getting messages:", error);
          Swal({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        }
      },
    },
  };
};

export default getState;
