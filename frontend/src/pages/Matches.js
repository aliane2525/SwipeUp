import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api";

export default function Matches() {
  const [matches, setMatches] =
    useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await API.get(
        "/api/match/matches"
      );

      setMatches(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Your Matches ❤️</h2>

      <div style={styles.grid}>
        {matches.map((match) => {
          const currentUser = JSON.parse(localStorage.getItem("user")) || {};
          const otherUser =
            match.users.find((u) => u._id !== currentUser._id) ||
            match.users[0];

          return (
            <div
              key={match._id}
              style={styles.card}
            >
              <img
                src={
                  otherUser?.profileImage ||
                  "https://i.pravatar.cc/300"
                }
                alt=""
                style={styles.image}
              />

              <h3>{otherUser?.name || "Match"}</h3>

              <button
                style={styles.button}
                onClick={() =>
                  navigate(`/chat/${match._id}`)
                }
              >
                Chat
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(160px,1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 15,
    textAlign: "center",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)",
  },

  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 15,
  },

  button: {
    marginTop: 10,
    padding: "10px 16px",
    border: "none",
    borderRadius: 10,
    background: "#ff4458",
    color: "#fff",
    cursor: "pointer",
  },
};