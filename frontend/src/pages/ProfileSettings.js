import { useEffect, useState } from "react";
import API from "../api";

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [image, setImage] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const uploadPhoto = async () => {
    if (!image) {
      alert("Choose an image first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", image);

      const res = await API.post("/api/user/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfileImage(res.data?.user?.profileImage || "");
      window.dispatchEvent(new Event("profileUpdated"));
      alert("✅ Photo uploaded successfully");
    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data || err.message);
      alert("❌ Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const loadUser = async () => {
    try {
      const res = await API.get("/api/user/me");

      setName(res.data?.name || "");
      setBio(res.data?.bio || "");
      setEmail(res.data?.email || "");
      setEmailVerified(res.data?.emailVerified || false);
      setVerificationPending(!res.data?.emailVerified);
      setProfileImage(res.data?.profileImage || "");
    } catch (err) {
      console.log("LOAD ERROR:", err.response?.data || err.message);
      alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const saveProfile = async () => {
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      const res = await API.put("/api/user/update", {
        name,
        bio,
        email,
      });

      setName(res.data?.user?.name || "");
      setBio(res.data?.user?.bio || "");
      setEmail(res.data?.user?.email || email);
      setEmailVerified(res.data?.user?.emailVerified || false);
      setVerificationPending(res.data?.verificationSent || false);
      setProfileImage(res.data?.user?.profileImage || profileImage);

      window.dispatchEvent(new Event("profileUpdated"));
      if (res.data?.verificationSent) {
        alert("✅ Verification code sent to your new email.");
      } else {
        alert("✅ Profile updated successfully.");
      }
    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const verifyEmailCode = async () => {
    if (!verificationCode.trim()) {
      alert("Please enter the verification code.");
      return;
    }

    try {
      setVerifying(true);
      await API.post("/api/auth/verify-email", {
        email,
        code: verificationCode,
      });

      setEmailVerified(true);
      setVerificationPending(false);
      setVerificationCode("");
      alert("✅ Email verified successfully.");
    } catch (err) {
      console.log("VERIFY ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>⚙️ Profile Settings</h2>

        <img
          src={
            profileImage ||
            "https://i.pravatar.cc/300?img=1"
          }
          alt="Profile"
          style={styles.avatar}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          onClick={uploadPhoto}
          disabled={uploading}
          style={styles.button}
        >
          {uploading ? "Uploading..." : "📷 Upload Photo"}
        </button>

        <label style={styles.label}>Name</label>

        <input
          type="text"
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={styles.input}
        />

        <label style={styles.label}>Bio</label>

        <textarea
          value={bio || ""}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people about yourself..."
          style={styles.textarea}
        />

        <label style={styles.label}>Email</label>

        <input
          type="email"
          value={email || ""}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          style={styles.input}
        />

        <div style={styles.emailStatus}>
          {emailVerified ? (
            <span style={styles.verified}>Verified</span>
          ) : (
            <span style={styles.pending}>Email verification required</span>
          )}
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          style={styles.button}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {verificationPending && (
          <div style={styles.verifyBox}>
            <label style={styles.label}>Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter code from email"
              style={styles.input}
            />
            <button
              onClick={verifyEmailCode}
              disabled={verifying}
              style={{
                ...styles.button,
                background: "#4a90e2",
                marginTop: 12,
              }}
            >
              {verifying ? "Verifying..." : "Verify Email"}
            </button>
            <button
              onClick={async () => {
                try {
                  await API.post("/api/auth/resend-verification");
                  alert("✅ Verification code resent to your email.");
                } catch (err) {
                  console.log("RESEND ERROR:", err.response?.data || err.message);
                  alert(err.response?.data?.message || "Failed to resend verification code.");
                }
              }}
              style={{
                ...styles.button,
                background: "#ffa726",
                marginTop: 12,
              }}
            >
              Resend Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    fontWeight: "600",
  },

  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
    color: "#ff4458",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    margin: "0 auto 20px",
    border: "4px solid #ff4458",
  },

  label: {
    display: "block",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 15,
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    resize: "none",
    fontSize: 15,
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    marginTop: 25,
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#ff4458",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
  },
  emailStatus: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 14,
    color: "#555",
  },
  verified: {
    color: "#00b894",
    fontWeight: "700",
  },
  pending: {
    color: "#ff7f50",
    fontWeight: "700",
  },
  verifyBox: {
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    background: "#fafafa",
    border: "1px solid #e0e0e0",
  },
};