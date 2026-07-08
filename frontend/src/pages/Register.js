import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      return setError("Please fill all fields");
    }

    try {
      setLoading(true);
await API.post("/api/auth/register", form);

      alert("Registration successful");

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.blur1}></div>
      <div style={styles.blur2}></div>

      <form
        style={styles.form}
        onSubmit={register}
      >
        <div style={styles.logoBox}>
          <div style={styles.fire}>🔥</div>

          <h1 style={styles.logo}>
            Swipe Up
          </h1>

          <p style={styles.subtitle}>
            Create your account
          </p>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />

        <button
          type="submit"
          style={styles.button}
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>

        <p style={styles.bottomText}>
          Already have an account?
        </p>

        <button
          type="button"
          style={styles.loginBtn}
          onClick={() => navigate("/")}
        >
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#ff4458,#ff7b54)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial",
  },

  blur1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background:
      "rgba(255,255,255,0.12)",
    top: -120,
    left: -120,
  },

  blur2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: "50%",
    background:
      "rgba(255,255,255,0.1)",
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
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.2)",
  },

  logoBox: {
    textAlign: "center",
    marginBottom: 10,
  },

  fire: {
    fontSize: 50,
  },

  logo: {
    margin: 0,
    color: "#ff4458",
    fontSize: 38,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#777",
    marginTop: 8,
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
    background:
      "linear-gradient(135deg,#ff4458,#ff7b54)",
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    cursor: "pointer",
  },

  bottomText: {
    textAlign: "center",
    margin: 0,
    marginTop: 10,
    color: "#666",
  },

  loginBtn: {
    padding: 15,
    borderRadius: 14,
    border: "2px solid #ff4458",
    background: "#fff",
    color: "#ff4458",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
};