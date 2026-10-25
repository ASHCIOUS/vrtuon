import React, { useState, useRef } from "react";
import axios from "axios";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

function useImage(url) {
  const [image, setImage] = useState(null);
  React.useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => setImage(img);
  }, [url]);
  return image;
}

const mannequins = {
  male: (skin) => `
    <svg width="400" height="600" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="60" rx="40" ry="50" fill="${skin}"/>
      <rect x="60" y="110" width="80" height="150" rx="40" fill="${skin}"/>
      <rect x="40" y="110" width="20" height="100" rx="10" fill="${skin}"/>
      <rect x="140" y="110" width="20" height="100" rx="10" fill="${skin}"/>
      <rect x="80" y="260" width="20" height="60" rx="10" fill="${skin}"/>
      <rect x="100" y="260" width="20" height="60" rx="10" fill="${skin}"/>
    </svg>
  `,
  female: (skin) => `
    <svg width="400" height="600" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="60" rx="38" ry="48" fill="${skin}"/>
      <rect x="65" y="110" width="70" height="140" rx="35" fill="${skin}"/>
      <rect x="45" y="110" width="20" height="100" rx="10" fill="${skin}"/>
      <rect x="135" y="110" width="20" height="100" rx="10" fill="${skin}"/>
      <rect x="85" y="250" width="15" height="60" rx="8" fill="${skin}"/>
      <rect x="100" y="250" width="15" height="60" rx="8" fill="${skin}"/>
    </svg>
  `
};

function App() {
  const [skinTone, setSkinTone] = useState("#f5d6c6");
  const [productUrl, setProductUrl] = useState("");
  const [productImgUrl, setProductImgUrl] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState("female");
  const [presetTones] = useState([
    "#f5d6c6", "#e0ac69", "#c68642", "#8d5524", "#f9e4b7"
  ]);
  const [clothingPos, setClothingPos] = useState({ x: 100, y: 150, width: 200, height: 200 });
  const stageRef = useRef();

  const productImg = useImage(productImgUrl);

  const mannequinImg = useImage(
    URL.createObjectURL(
      new Blob([mannequins[gender](skinTone)], { type: "image/svg+xml" })
    )
  );

  const handleProductUrl = async (e) => {
    e.preventDefault();
    setError("");
    setProductImgUrl("");
    try {
      const res = await axios.post("http://localhost:5000/get-image", { url: productUrl });
      setProductImgUrl(res.data.imgUrl);
    } catch (err) {
      setError("Could not fetch product image.");
    }
  };

  const handleSave = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "virtual-outfit.png";
    link.href = uri;
    link.click();
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Virtual Try-On</h2>
      <div style={{ marginBottom: 10 }}>
        <label>Gender: </label>
        <select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <span style={{ marginLeft: 20 }}>Pick skin tone: </span>
        {presetTones.map(tone => (
          <button
            key={tone}
            style={{
              background: tone,
              border: skinTone === tone ? "2px solid #333" : "1px solid #ccc",
              width: 24, height: 24, borderRadius: "50%", margin: "0 2px"
            }}
            onClick={() => setSkinTone(tone)}
          />
        ))}
        <input
          type="color"
          value={skinTone}
          onChange={e => setSkinTone(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </div>
      <form onSubmit={handleProductUrl} style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Paste product link (Myntra, Flipkart, Amazon)"
          value={productUrl}
          onChange={e => setProductUrl(e.target.value)}
          style={{ width: 400 }}
        />
        <button type="submit">Get Product Image</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <Stage width={400} height={600} ref={stageRef} style={{ border: "1px solid #ccc" }}>
        <Layer>
          {mannequinImg && (
            <KonvaImage image={mannequinImg} width={400} height={600} />
          )}
          {productImg && (
            <KonvaImage
              image={productImg}
              x={clothingPos.x}
              y={clothingPos.y}
              width={clothingPos.width}
              height={clothingPos.height}
              draggable
              onDragEnd={e =>
                setClothingPos({ ...clothingPos, x: e.target.x(), y: e.target.y() })
              }
              onTransformEnd={e => {
                const node = e.target;
                setClothingPos({
                  ...clothingPos,
                  x: node.x(),
                  y: node.y(),
                  width: node.width() * node.scaleX(),
                  height: node.height() * node.scaleY()
                });
                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          )}
        </Layer>
      </Stage>
      <div style={{ marginTop: 10 }}>
        <button onClick={handleSave} disabled={!productImg}>
          Save Outfit as Image
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#888" }}>
        Drag and resize the clothing image to fit the mannequin.<br />
        You can change gender, pose, and skin tone anytime.
      </p>
    </div>
  );
}

export default App;