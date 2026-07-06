import { useEffect, useState } from "react";
import API from "../api";

export default function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await API.get(
        "/api/notifications"
      );

      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const markRead = async (id) => {
    try {
      await API.put(
        `/api/notifications/${id}/read`
      );

      loadNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔔 Notifications</h2>

      {notifications.map((n) => (
        <div
          key={n._id}
          style={{
            ...styles.card,
            opacity: n.read ? 0.6 : 1,
          }}
          onClick={() => markRead(n._id)}
        >
          <img
            src={
              n.senderId?.profileImage ||
              "https://i.pravatar.cc/100"
            }
            alt=""
            style={styles.avatar}
          />

          <div>
            <h4>{n.senderId?.name}</h4>

            <p>{n.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },

  card: {
    display: "flex",
    gap: 15,
    alignItems: "center",
    background: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: "50%",
    objectFit: "cover",
  },
};