import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api";
import logo from "../assets/logo.png";

export default function Home() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const res = await API.get("/api/user/all");
      setUsers(res.data.reverse());
    } catch (err) {
      console.log("LOAD USERS ERROR:", err);
    }
  };

  // ================= LOAD USERS =================
  useEffect(() => {
    const load = () => {
      loadUsers();
    };

    load();

    window.addEventListener("profileUpdated", load);

    return () => {
      window.removeEventListener("profileUpdated", load);
    };
  }, []);

  // ================= SWIPE =================
  const swipe = async (dir, targetId) => {
    setUsers((prev) => prev.filter((u) => u._id !== targetId));

    if (dir === "right") {
      try {
        const res = await API.post(`/api/match/like/${targetId}`);

        if (res.data.match) {
          alert("❤️ It's a Match!");
        }
      } catch (err) {
        console.log("MATCH ERROR:", err);
      }
    }
  };

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.logoBox}>
          <img src={logo} alt="SwipeUp Logo" style={styles.logoImage} />
          <h2 style={styles.logoText}>SwipeUp</h2>
        </div>

        <button
          style={styles.settingsBtn}
          onClick={() => navigate("/settings")}
        >
          ⚙️
        </button>
      </div>

      {/* CARDS */}
      <div style={styles.cardContainer}>
        {users.length > 0 ? (
          users.map((user, index) => (
            <SwipeCard
              key={user._id}
              user={user}
              index={index}
              swipe={swipe}
            />
          ))
        ) : (
          <div style={styles.emptyBox}>
            <h2>No More Profiles</h2>
            <p>Come back later for more people.</p>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={styles.bottomNav}>
        <button onClick={() => navigate("/home")} style={styles.navBtn}>🔥</button>
        <button onClick={() => navigate("/notifications")} style={styles.navBtn}>🔔</button>
        <button onClick={() => navigate("/matches")} style={styles.navBtn}>❤️</button>

  <button onClick={() => navigate("/chat")} style={styles.navBtn}>💬</button>
        <button onClick={() => navigate("/settings")} style={styles.navBtn}>👤</button>
      </div>
    </div>
  );
}

/* ================= SWIPE CARD ================= */
function SwipeCard({ user, index, swipe }) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) swipe("right", user._id);
    if (info.offset.x < -120) swipe("left", user._id);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.03 }}
      style={{
        ...styles.card,
        x,
        rotate,
        zIndex: 100 - index,
      }}
    >
      <img
        src={user.profileImage || "https://i.pravatar.cc/600"}
        alt="profile"
        style={styles.image}
      />

      <motion.div style={{ ...styles.likeBadge, opacity: likeOpacity }}>
        LIKE
      </motion.div>

      <motion.div style={{ ...styles.nopeBadge, opacity: nopeOpacity }}>
        NOPE
      </motion.div>

      <div style={styles.overlay}>
        <h2 style={styles.name}>{user.name}</h2>
        <p style={styles.bio}>{user.bio || "No bio yet"}</p>
      </div>
    </motion.div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "linear-gradient(to bottom, #fff0f3, #ffffff)",
  },

  topBar: {
    height: 75,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },

  logoText: {
    margin: 0,
    color: "#ff4458",
    fontWeight: "700",
    fontSize: 26,
  },

  settingsBtn: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    cursor: "pointer",
  },

  cardContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: 10,
  },

  card: {
    width: "92vw",
    maxWidth: 420,
    height: "72vh",
    position: "absolute",
    borderRadius: 28,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    cursor: "grab",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 22,
    color: "#fff",
    background: "linear-gradient(transparent, rgba(0,0,0,0.88))",
  },

  name: {
    margin: 0,
    fontSize: 28,
    fontWeight: "700",
  },

  bio: {
    marginTop: 8,
    fontSize: 15,
  },

  likeBadge: {
    position: "absolute",
    top: 45,
    left: 20,
    padding: "10px 18px",
    border: "4px solid #00ff88",
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: 30,
    transform: "rotate(-18deg)",
  },

  nopeBadge: {
    position: "absolute",
    top: 45,
    right: 20,
    padding: "10px 18px",
    border: "4px solid #ff4458",
    color: "#ff4458",
    fontWeight: "bold",
    fontSize: 30,
    transform: "rotate(18deg)",
  },

  emptyBox: {
    textAlign: "center",
    color: "#555",
  },

  bottomNav: {
    height: 80,
    background: "#fff",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
  },

  navBtn: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    fontSize: 24,
    cursor: "pointer",
  },
};