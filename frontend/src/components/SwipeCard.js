import { useRef } from "react";
import { motion } from "framer-motion";

export default function SwipeCard({ user }) {
  const cardRef = useRef(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        width: 300,
        height: 400,
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <img
        src={user?.profileImage || "https://i.pravatar.cc/300"}
        alt=""
        style={{ width: "100%", height: "80%", objectFit: "cover" }}
      />

      <div style={{ padding: 10 }}>
        <h3>{user?.name}</h3>
      </div>
    </motion.div>
  );
}