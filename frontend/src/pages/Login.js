import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= INPUT HANDLER =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // ================= LOGIN =================
  const login = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return setError("⚠️ Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await API.post("/api/auth/login", form);

      // ================= SAVE JWT (IMPORTANT) =================
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // DEBUG (optional)
      console.log("TOKEN:", res.data.token);

      navigate("/home");
    } catch (err) {
      console.log(err.response?.data || err.message);

      setError(
        "❌ " + (err.response?.data?.message || "Login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.blur1}></div>
      <div style={styles.blur2}></div>

      <form style={styles.form} onSubmit={login}>
        {/* ================= LOGO ================= */}
        <div style={styles.logoBox}>
          <img
            src={logo}
            alt="SwipeUp Logo"
            style={styles.logoImage}
          />

          <h1 style={styles.logo}>🔥 SwipeUp</h1>

          <p style={styles.subtitle}>
            💕 Meet new people around you
          </p>
        </div>

        {/* ================= ERROR ================= */}
        {error && <div style={styles.error}>{error}</div>}

        {/* ================= INPUTS ================= */}
        <input
          type="email"
          name="email"
          placeholder="📧 Enter email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="🔒 Enter password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />

        {/* ================= BUTTON ================= */}
        <button type="submit" style={styles.button}>
          {loading ? "⏳ Logging in..." : "🚀 Login"}
        </button>

        {/* ================= REGISTER ================= */}
        <p style={styles.bottomText}>
          🆕 Don't have an account?
        </p>

        <button
          type="button"
          style={styles.registerBtn}
          onClick={() => navigate("/register")}
        >
          ✨ Create Account
        </button>
      </form>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#ff4458,#ff7b54)",
    position: "relative",
    overflow: "hidden",
  },

  blur1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    top: -120,
    left: -120,
  },

  blur2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    bottom: -80,
    right: -80,
  },

  form: {
    width: "90%",
    maxWidth: 400,
    background: "#fff",
    padding: 35,
    borderRadius: 28,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    zIndex: 10,
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  },

  logoBox: {
    textAlign: "center",
  },

  logoImage: {
    width: 120,
    height: 120,
    objectFit: "contain",
    marginBottom: 10,
  },

  logo: {
    margin: 0,
    color: "#ff4458",
    fontSize: 38,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#777",
    fontSize: 14,
  },

  error: {
    background: "#ffe5e5",
    color: "#ff2d55",
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
  },

  input: {
    padding: 16,
    borderRadius: 14,
    border: "1px solid #ddd",
    fontSize: 16,
    outline: "none",
  },

  button: {
    padding: 16,
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg,#ff4458,#ff7b54)",
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    cursor: "pointer",
  },

  bottomText: {
    textAlign: "center",
    color: "#666",
    margin: 0,
  },

  registerBtn: {
    padding: 15,
    borderRadius: 14,
    border: "2px solid #ff4458",
    background: "#fff",
    color: "#ff4458",
    fontWeight: "bold",
    cursor: "pointer",
  },
};