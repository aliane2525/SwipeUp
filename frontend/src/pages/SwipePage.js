import { useCallback, useEffect, useMemo, useState } from "react";

export default function SwipePage({ profiles = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [profiles.length]);

  const goPrev = useCallback(() => {
    if (!profiles.length) return;
    setActiveIndex((prev) => (prev === 0 ? profiles.length - 1 : prev - 1));
  }, [profiles.length]);

  const goNext = useCallback(() => {
    if (!profiles.length) return;
    setActiveIndex((prev) => (prev === profiles.length - 1 ? 0 : prev + 1));
  }, [profiles.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName;
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable;

      if (isTyping) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  const profile = useMemo(() => profiles[activeIndex] || null, [profiles, activeIndex]);

  if (!profiles.length) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        No profiles available.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
        <button
          onClick={goPrev}
          aria-label="Previous profile"
          style={{
            position: "absolute",
            left: -10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            border: "none",
            background: "#ff4458",
            color: "#fff",
            width: 42,
            height: 42,
            borderRadius: "50%",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {profile?.image ? (
            <img
              src={profile.image}
              alt={profile?.name || "Profile"}
              style={{
                width: "100%",
                height: 320,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
          ) : null}

          <h2 style={{ marginBottom: 6 }}>{profile?.name || "User"}</h2>
          <p style={{ marginTop: 0, color: "#555" }}>
            {profile?.bio || "No bio yet"}
          </p>
        </div>

        <button
          onClick={goNext}
          aria-label="Next profile"
          style={{
            position: "absolute",
            right: -10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            border: "none",
            background: "#ff4458",
            color: "#fff",
            width: 42,
            height: 42,
            borderRadius: "50%",
            cursor: "pointer",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}