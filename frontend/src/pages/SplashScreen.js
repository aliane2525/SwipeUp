import splash from "../assets/splash.png";

export default function SplashScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      <img
        src={splash}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}