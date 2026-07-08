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

  // ================= INPUT =================
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

      // 🔐 SAVE AUTH DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
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
        {/* LOGO */}
        <div style={styles.logoBox}>
          <img src={logo} alt="logo" style={styles.logoImage} />
          <h1 style={styles.logo}>🔥 SwipeUp</h1>
          <p style={styles.subtitle}>💖 Meet new people around you</p>
        </div>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* INPUTS */}
        <input
          name="email"
          type="email"
          placeholder="📧 Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="password"
          type="password"
          placeholder="🔒 Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />

        {/* BUTTON */}
        <button type="submit" style={styles.button}>
          {loading ? "⏳ Logging in..." : "🚀 Login"}
        </button>

        <p style={styles.bottomText}>Don't have an account?</p>

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
  },

  blur1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    top: -100,
    left: -100,
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
    width: 380,
    background: "#fff",
    padding: 30,
    borderRadius: 25,
    display: "flex",
    flexDirection: "column",
    gap: 15,
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },

  logoBox: {
    textAlign: "center",
  },

  logoImage: {
    width: 110,
    height: 110,
    objectFit: "contain",
  },

  logo: {
    color: "#ff4458",
    fontSize: 34,
    margin: 0,
  },

  subtitle: {
    color: "#777",
    fontSize: 13,
  },

  error: {
    background: "#ffe5e5",
    color: "#ff2d55",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
  },

  input: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #ddd",
    fontSize: 15,
  },

  button: {
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#ff4458,#ff7b54)",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  bottomText: {
    textAlign: "center",
    margin: 0,
    color: "#666",
  },

  registerBtn: {
    padding: 12,
    borderRadius: 12,
    border: "2px solid #ff4458",
    background: "#fff",
    color: "#ff4458",
    fontWeight: "bold",
    cursor: "pointer",
  },
};