import { useEffect, useState } from "react";
import API from "../api";

export default function ChatList() {
  const [chats, setChats] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?._id) {
      console.log("No user found in localStorage");
      return;
    }

    API.get(`/api/chat/chats/${user._id}`)
      .then((res) => {
        console.log("Chats from backend:", res.data);
        setChats(res.data);
      })
      .catch((err) => console.log("ERROR:", err));
  }, []);

  return (
    <div>
      <h2>Chats </h2>

      {chats.length === 0 ? (
        <p>No chats found</p>
      ) : (
        chats.map((chat) => (
          <div key={chat._id}>
            Chat ID: {chat._id}
          </div>
        ))
      )}
    </div>
  );
}import { useEffect, useState } from "react";
import axios from "axios";

export default function ChatList() {
  const [chats, setChats] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user?._id) return;

  axios
    .get(`http://localhost:5000/api/chat/chats/${user._id}`)
    .then((res) => {
      setChats(res.data);
    })
    .catch((err) => console.log(err));
}, []);

  return (
    <div>
      <h2>Chats </h2>

      {chats.length === 0 ? (
        <p>No chats found</p>
      ) : (
        chats.map((chat) => (
          <div key={chat._id}>
            Chat ID: {chat._id}
          </div>
        ))
      )}
    </div>
  );
}