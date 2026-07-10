import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api";
import logo from "../assets/logo.png";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [moments, setMoments] = useState([]);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const res = await API.get("/api/user/all");
      setUsers(res.data.reverse());
    } catch (err) {
      console.log("LOAD USERS ERROR:", err);
    }
  };

  const loadMoments = async () => {
    try {
      const res = await API.get("/api/moments");
      setMoments(res.data.slice(0, 3));
    } catch (err) {
      console.log("LOAD MOMENTS ERROR:", err);
    }
  };

  // ================= LOAD USERS =================
  useEffect(() => {
    const load = () => {
      loadUsers();
      loadMoments();
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
          if (res.data.chatId) {
            navigate(`/chat/${res.data.chatId}`);
          }
        }
      } catch (err) {
        console.log("MATCH ERROR:", err);
      }
    }
  };

  const requestMessage = async (targetId) => {
    const text = prompt(
      "Send a message request (up to 3 messages). Your receiver can accept or reject it."
    );

    if (!text || !text.trim()) return;

    try {
      await API.post(`/api/message-request/${targetId}`, {
        text: text.trim(),
      });
      alert("✅ Message request sent!");
    } catch (err) {
      console.log("REQUEST ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to send request");
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

        <div style={styles.topButtons}>
          <button
            style={styles.settingsBtn}
            onClick={() => navigate("/requests")}
          >
            📩
          </button>

          <button
            style={styles.settingsBtn}
            onClick={() => navigate("/settings")}
          >
            ⚙️
          </button>
        </div>
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
              requestMessage={requestMessage}
            />
          ))
        ) : (
          <div style={styles.emptyBox}>
            <h2>No More Profiles</h2>
            <p>Come back later for more people.</p>
          </div>
        )}
      </div>

      <div style={styles.momentsSection}>
        <h3 style={styles.sectionTitle}>Latest Posts</h3>
        {moments.length > 0 ? (
          moments.map((m) => (
            <div key={m._id} style={styles.momentCard}>
              {m.image ? (
                <img
                  src={m.image}
                  alt="Moment"
                  style={styles.momentImage}
                />
              ) : (
                <div style={styles.momentImagePlaceholder} />
              )}
              <div style={styles.momentInfo}>
                <div style={styles.momentUser}>{m.user?.name || "User"}</div>
                <div style={styles.momentCaption}>{m.caption || "Shared a moment"}</div>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.emptyMoments}>No posts yet. Check back later.</p>
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
function SwipeCard({ user, index, swipe, requestMessage }) {
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
      dragElastic={0.75}
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
        <div style={styles.overlayHeader}>
          <h2 style={styles.name}>{user.name}</h2>
          <button
            style={styles.requestBtn}
            onClick={() => requestMessage(user._id)}
          >
            💬 Request
          </button>
        </div>
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

  topButtons: {
    display: "flex",
    gap: 10,
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

  momentsSection: {
    padding: 16,
    margin: "0 10px 12px",
    background: "#fff",
    borderRadius: 24,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    margin: "0 0 12px",
    color: "#ff4458",
  },

  momentCard: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
    background: "#fafafa",
  },

  momentImage: {
    width: 90,
    height: 90,
    objectFit: "cover",
    borderRadius: 18,
  },

  momentImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 18,
    background: "#f0f0f0",
  },

  momentInfo: {
    flex: 1,
  },

  momentUser: {
    margin: 0,
    fontSize: 16,
    fontWeight: "700",
  },

  overlayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  requestBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.9)",
    color: "#ff4458",
    fontWeight: "700",
    cursor: "pointer",
  },

  momentCaption: {
    marginTop: 6,
    color: "#555",
    fontSize: 14,
  },

  emptyMoments: {
    color: "#777",
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