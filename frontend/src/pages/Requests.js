import { useEffect, useState } from "react";
import API from "../api";

export default function Requests() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        API.get("/api/message-request/received"),
        API.get("/api/message-request/sent"),
      ]);

      setReceived(receivedRes.data);
      setSent(sentRes.data);
    } catch (err) {
      console.log("REQUESTS LOAD ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateRequest = async (id, action) => {
    try {
      await API.put(`/api/message-request/${action}/${id}`);
      loadRequests();
    } catch (err) {
      console.log(`REQUEST ${action.toUpperCase()} ERROR:`, err.response?.data || err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Message Requests</h2>

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <>
          <section style={styles.section}>
            <h3>Incoming Requests</h3>
            {received.length === 0 ? (
              <p>No incoming requests.</p>
            ) : (
              received.map((request) => (
                <div key={request._id} style={styles.card}>
                  <div style={styles.header}>
                    <strong>{request.sender?.name || "User"}</strong>
                    <div>
                      <button
                        style={styles.accept}
                        onClick={() => updateRequest(request._id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        style={styles.reject}
                        onClick={() => updateRequest(request._id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <div style={styles.requestMessages}>
                    {request.messages.map((msg, index) => (
                      <p key={index} style={styles.messageText}>
                        {msg.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          <section style={styles.section}>
            <h3>Sent Requests</h3>
            {sent.length === 0 ? (
              <p>No sent requests.</p>
            ) : (
              sent.map((request) => (
                <div key={request._id} style={styles.card}>
                  <div style={styles.header}>
                    <strong>{request.receiver?.name || "User"}</strong>
                    <span style={styles.status}>{request.status}</span>
                  </div>
                  <div style={styles.requestMessages}>
                    {request.messages.map((msg, index) => (
                      <p key={index} style={styles.messageText}>
                        {msg.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accept: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "none",
    background: "#00c851",
    color: "#fff",
    cursor: "pointer",
    marginRight: 8,
  },
  reject: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "none",
    background: "#ff4444",
    color: "#fff",
    cursor: "pointer",
  },
  status: {
    textTransform: "capitalize",
    color: "#777",
    fontSize: 14,
  },
  requestMessages: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  messageText: {
    margin: 0,
    background: "#f5f5f5",
    padding: 10,
    borderRadius: 12,
  },
};
