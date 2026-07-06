import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import socket from "../socket";

export default function VideoCall() {
  const navigate = useNavigate();

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const audioRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= INIT CAMERA =================
  useEffect(() => {
    let currentStream;

    const listenForCalls = (stream) => {
      socket.off("incoming-call");

      socket.on("incoming-call", (data) => {
        if (!data?.from) return;

        setIncomingCall({
          from: data.from,
          signal: data.signalData,
        });

        // 📳 vibration
        if (navigator.vibrate) {
          navigator.vibrate([500, 300, 500]);
        }

        // 🔔 ringtone
        if (audioRef.current) {
          audioRef.current.loop = true;
          audioRef.current.play().catch(() => {});
        }
      });
    };

    const startVideo = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(currentStream);

        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        listenForCalls(currentStream);
      } catch (err) {
        console.log(err);
        alert("📷 Camera / Microphone permission denied");
      }
    };

    startVideo();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }

      socket.off("incoming-call");
      socket.off("call-accepted");
    };
  }, []);

  // ================= START CALL =================
  const startCall = (receiverId) => {
    if (!receiverId) return alert("User not found ❌");

    setIsCalling(true);

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
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    socket.off("call-accepted");

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      setIsCalling(false);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // ================= ANSWER CALL =================
  const answerCall = () => {
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
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(incomingCall.signal);

    connectionRef.current = peer;
  };

  // ================= REJECT CALL =================
  const rejectCall = () => {
    setIncomingCall(null);
    stopRingtone();
  };

  // ================= RINGTONE CONTROL =================
  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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

      {/* AUDIO */}
      <audio ref={audioRef} />

      {/* HEADER */}
      <div style={styles.topBar}>
        <h2>📹 SwipeUp Video Call</h2>

        <button style={styles.endBtn} onClick={endCall}>
          ❌ End
        </button>
      </div>

      {/* INCOMING CALL UI */}
      {incomingCall && (
        <div style={styles.popup}>
          <h3>📞 Incoming Call</h3>
          <p>User: {incomingCall.from}</p>

          <div style={styles.btnRow}>
            <button style={styles.accept} onClick={answerCall}>
              ✅ Accept
            </button>

            <button style={styles.reject} onClick={rejectCall}>
              ❌ Reject
            </button>
          </div>
        </div>
      )}

      {/* CALLING */}
      {isCalling && (
        <div style={styles.calling}>
          📞 Calling...
        </div>
      )}

      {/* VIDEOS */}
      <div style={styles.videoContainer}>

        <div style={styles.videoBox}>
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={styles.video}
          />
          <div style={styles.label}>🧑 You</div>
        </div>

        <div style={styles.videoBox}>
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={styles.video}
          />
          <div style={styles.label}>
            {callAccepted ? "🟢 Connected" : "⏳ Waiting"}
          </div>
        </div>

      </div>

      {/* START CALL */}
      <div style={styles.bottom}>
        <button
          style={styles.callBtn}
          onClick={() => {
            const id = prompt("Enter User ID");
            if (id) startCall(id);
          }}
        >
          📞 Start Call
        </button>
      </div>

    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },

  topBar: {
    padding: 15,
    display: "flex",
    justifyContent: "space-between",
    background: "#1a1a1a",
  },

  endBtn: {
    background: "red",
    border: "none",
    padding: "10px 15px",
    color: "#fff",
    borderRadius: 10,
  },

  videoContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    gap: 20,
    padding: 20,
    flexWrap: "wrap",
  },

  videoBox: {
    width: 350,
    position: "relative",
  },

  video: {
    width: "100%",
    borderRadius: 15,
    background: "#000",
  },

  label: {
    position: "absolute",
    bottom: 10,
    left: 10,
    background: "rgba(0,0,0,0.6)",
    padding: "5px 10px",
    borderRadius: 8,
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
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#222",
    padding: 20,
    borderRadius: 15,
    textAlign: "center",
  },

  btnRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 10,
  },

  accept: {
    background: "green",
    padding: 10,
    border: "none",
    color: "#fff",
    borderRadius: 8,
  },

  reject: {
    background: "red",
    padding: 10,
    border: "none",
    color: "#fff",
    borderRadius: 8,
  },

  calling: {
    position: "absolute",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#333",
    padding: 10,
    borderRadius: 10,
  },
};