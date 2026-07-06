import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Peer from "simple-peer";
import socket from "../socket";

export default function Call() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const callType = state?.type || "video"; // "video" | "audio"

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const audioRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= INIT MEDIA =================
  useEffect(() => {
    let currentStream;

    const startMedia = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: callType === "video",
          audio: true,
        });

        setStream(currentStream);

        if (callType === "video" && myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        listenForCalls(currentStream);
      } catch (err) {
        console.log(err);
        alert("Permission denied");
      }
    };

    startMedia();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }

      socket.off("incoming-call");
      socket.off("call-accepted");
    };
  }, [callType]);

  // ================= LISTEN CALL =================
  const listenForCalls = (currentStream) => {
    socket.off("incoming-call");

    socket.on("incoming-call", (data) => {
      if (!data?.from) return;

      setIncomingCall(data);

      // 📳 vibration
      if (navigator.vibrate) {
        navigator.vibrate([500, 300, 500]);
      }

      // 🔔 optional ringtone
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {});
      }
    });
  };

  // ================= ACCEPT CALL =================
  const acceptCall = () => {
    setCallAccepted(true);
    setIncomingCall(null);

    stopRingtone();

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("answer-call", {
        signal,
        to: incomingCall.from,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (callType === "video" && userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(incomingCall.signalData);

    connectionRef.current = peer;
  };

  // ================= REJECT CALL =================
  const rejectCall = () => {
    setIncomingCall(null);
    stopRingtone();
  };

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // ================= START CALL =================
  const startCall = (receiverId) => {
    if (!receiverId) return alert("User not found");

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signalData) => {
      socket.emit("call-user", {
        userToCall: receiverId,
        signalData,
        from: user?._id,
        type: callType,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (callType === "video" && userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    socket.off("call-accepted");

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // ================= END CALL =================
  const endCall = () => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    navigate("/home");
  };

  // ================= UI =================
  return (
    <div style={styles.container}>

      {/* AUDIO (optional ringtone) */}
      <audio ref={audioRef} />

      {/* HEADER */}
      <div style={styles.topBar}>
        <h2>
          {callType === "video" ? "📹 Video Call" : "📞 Audio Call"}
        </h2>

        <button style={styles.endBtn} onClick={endCall}>
          ❌ End
        </button>
      </div>

      {/* INCOMING CALL */}
      {incomingCall && (
        <div style={styles.popup}>
          <h3>📞 Incoming {incomingCall.type || "call"}</h3>

          <button style={styles.accept} onClick={acceptCall}>
            ✅ Accept
          </button>

          <button style={styles.reject} onClick={rejectCall}>
            ❌ Reject
          </button>
        </div>
      )}

      {/* VIDEO */}
      {callType === "video" && (
        <div style={styles.videoWrap}>
          <video playsInline muted ref={myVideo} autoPlay style={styles.video} />

          <video playsInline ref={userVideo} autoPlay style={styles.video} />
        </div>
      )}

      {/* AUDIO UI */}
      {callType === "audio" && (
        <div style={styles.audioUI}>
          <h2>🎧 Voice Call Active</h2>
          <p>{callAccepted ? "Connected" : "Waiting..."}</p>
        </div>
      )}

      {/* START CALL */}
      <div style={styles.bottom}>
        <button
          style={styles.callBtn}
          onClick={() => {
            const id = prompt("Enter User ID");
            if (id) startCall(id);
          }}
        >
          {callType === "video" ? "📹 Start Video" : "📞 Start Voice"}
        </button>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },

  topBar: {
    padding: 15,
    display: "flex",
    justifyContent: "space-between",
    background: "#222",
  },

  endBtn: {
    background: "red",
    border: "none",
    color: "#fff",
    padding: "10px 15px",
  },

  videoWrap: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    flex: 1,
    padding: 20,
  },

  video: {
    width: 300,
    borderRadius: 10,
    background: "#000",
  },

  audioUI: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  bottom: {
    padding: 20,
    textAlign: "center",
  },

  callBtn: {
    padding: 15,
    background: "#ff4458",
    border: "none",
    color: "#fff",
    borderRadius: 12,
    fontWeight: "bold",
  },

  popup: {
    position: "absolute",
    top: "25%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#333",
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
  },

  accept: {
    background: "green",
    padding: 10,
    margin: 5,
    border: "none",
    color: "#fff",
  },

  reject: {
    background: "red",
    padding: 10,
    margin: 5,
    border: "none",
    color: "#fff",
  },
};