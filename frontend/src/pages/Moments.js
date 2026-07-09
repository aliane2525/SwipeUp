import { useEffect, useState } from "react";
import API from "../api";

export default function Moments() {
  const [moments, setMoments] = useState([]);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = async () => {
    try {
      const res = await API.get("/api/moments");
      setMoments(res.data);
    } catch (err) {
      console.log("LOAD MOMENTS ERROR:", err);
    }
  };

  const uploadMoment = async () => {
    if (!image && !caption.trim()) return;

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("caption", caption);

    try {
      await API.post("/api/moments/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      loadMoments();
      setCaption("");
      setImage(null);
    } catch (err) {
      console.log("UPLOAD MOMENT ERROR:", err);
    }
  };

  const toggleLike = async (id) => {
    try {
      await API.post(`/api/moments/${id}/like`);
      loadMoments();
    } catch (err) {
      console.log("LIKE ERROR:", err);
    }
  };

  const addComment = async (id) => {
    const text = commentText[id]?.trim();
    if (!text) return;

    try {
      await API.post(`/api/moments/${id}/comment`, { text });
      setCommentText((prev) => ({ ...prev, [id]: "" }));
      loadMoments();
    } catch (err) {
      console.log("COMMENT ERROR:", err);
    }
  };

  const sharePost = async (id) => {
    try {
      await API.post(`/api/moments/${id}/share`);
      loadMoments();
      alert("Post shared!");
    } catch (err) {
      console.log("SHARE ERROR:", err);
    }
  };

  return (
    <div style={{ padding: 20, background: "#f8f8f8", minHeight: "100vh" }}>
      <h2 style={{ color: "#ff4458" }}>Posts</h2>

      <div style={{ background: "#fff", padding: 16, borderRadius: 16, marginBottom: 20 }}>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <input
          placeholder="Write something..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button onClick={uploadMoment} style={{ marginTop: 10, padding: "10px 14px", border: "none", borderRadius: 10, background: "#ff4458", color: "#fff" }}>
          Post
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {moments.map((m) => (
          <div key={m._id} style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}>
            {m.image ? <img src={m.image} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 12 }} /> : null}

            <h4 style={{ marginBottom: 6 }}>{m.user?.name || "User"}</h4>
            <p style={{ marginTop: 0 }}>{m.caption}</p>

            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button onClick={() => toggleLike(m._id)} style={{ border: "none", background: "#fff0f3", color: "#ff4458", padding: "8px 12px", borderRadius: 10 }}>
                ❤️ {m.likes?.length || 0}
              </button>
              <button onClick={() => sharePost(m._id)} style={{ border: "none", background: "#f5f5f5", padding: "8px 12px", borderRadius: 10 }}>
                🔁 {m.shares || 0}
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <strong>Comments</strong>
              {m.comments?.map((c, i) => (
                <div key={i} style={{ background: "#fafafa", padding: 8, borderRadius: 8, marginTop: 6 }}>
                  <div style={{ fontWeight: 600 }}>{c.user?.name || "User"}</div>
                  <div>{c.text}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                value={commentText[m._id] || ""}
                onChange={(e) => setCommentText((prev) => ({ ...prev, [m._id]: e.target.value }))}
                placeholder="Write a comment"
                style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
              <button onClick={() => addComment(m._id)} style={{ border: "none", background: "#ff4458", color: "#fff", padding: "10px 12px", borderRadius: 10 }}>
                Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}