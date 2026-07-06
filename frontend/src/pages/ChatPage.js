import { useParams } from "react-router-dom";
import Chat from "../components/Chat";

export default function ChatPage() {
  const { roomId } = useParams();

  return (
    <div
      style={{
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Chat roomId={roomId} />
    </div>
  );
}