import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/api/auth/forgot-password",
        {
          email: email.trim(),
        }
      );

      setMessage(res.data.message);

      // Move to reset page
      navigate("/reset-password", {
        state: {
          email: email.trim(),
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send reset code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <div style={styles.logo}>🔥</div>

        <h1 style={styles.title}>
          Forgot Password?
        </h1>

        <p style={styles.subtitle}>
          Enter the email you used to create
          your SwipeUp account.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Sending..."
              : "Send Reset Code"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={styles.backButton}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#ff4458,#ff7b54)",
    fontFamily: "Arial",
    padding: "20px",
    boxSizing: "border-box",
  },

  form: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "35px",
    borderRadius: "28px",
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
  },

  logo: {
    textAlign: "center",
    fontSize: "50px",
  },

  title: {
    textAlign: "center",
    color: "#ff4458",
    marginBottom: "10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    lineHeight: "1.5",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "15px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box",
    marginBottom: "15px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#ff4458,#ff7b54)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    padding: "14px",
    marginTop: "15px",
    borderRadius: "14px",
    border: "2px solid #ff4458",
    background: "#fff",
    color: "#ff4458",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    background: "#ffe5e5",
    color: "#d60000",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "15px",
  },

  success: {
    background: "#e5ffe9",
    color: "#16852d",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "15px",
  },
};