import { useEffect, useState } from "react";
import API from "../api";

export default function Moments() {
  const [moments, setMoments] = useState([]);
  const [image, setImage] = useState(null);
  const [caption, setCaption] =
    useState("");

  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = async () => {
    const res = await API.get(
      "/api/moments"
    );

    setMoments(res.data);
  };

  const uploadMoment = async () => {
    const formData = new FormData();

    formData.append("image", image);

    formData.append("caption", caption);

    await API.post(
      "/api/moments/create",
      formData
    );

    loadMoments();

    setCaption("");
    setImage(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Moments</h2>

      <input
        type="file"
        onChange={(e) =>
          setImage(e.target.files[0])
        }
      />

      <input
        placeholder="caption"
        value={caption}
        onChange={(e) =>
          setCaption(e.target.value)
        }
      />

      <button onClick={uploadMoment}>
        Upload
      </button>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          marginTop: 20,
        }}
      >
        {moments.map((m) => (
          <div key={m._id}>
            <img
              src={m.image}
              alt=""
              style={{
                width: 200,
                height: 300,
                objectFit: "cover",
                borderRadius: 15,
              }}
            />

            <h4>{m.user?.name}</h4>

            <p>{m.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}