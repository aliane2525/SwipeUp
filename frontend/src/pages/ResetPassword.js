import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !email ||
      !code ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill all fields"
      );
      return;
    }

    if (code.length !== 6) {
      setError(
        "Verification code must be 6 digits"
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    try {
      setLoading(true);

      await API.post(
        "/api/auth/reset-password",
        {
          email: email.trim(),
          code: code.trim(),
          newPassword,
        }
      );

      setSuccess(
        "Password changed successfully!"
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed"
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
          Reset Password
        </h1>

        <p style={styles.subtitle}>
          Enter the code sent to your email
          and create a new password.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
          />

          <input
            type="text"
            placeholder="6-digit reset code"
            value={code}
            maxLength={6}
            onChange={(e) =>
              setCode(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            style={styles.input}
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Changing..."
              : "Change Password"}
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