"use client";

export default function Card({ albumCover, songName, songUrl }) {
  const handleClick = () => {
    const audio = new Audio(songUrl);
    audio.play();
  };

  return (
    <div
      className="card"
      style={{
        position: "relative",
        perspective: "1000px",
        width: "100%",
        height: "100%",
        cursor: "pointer",
        transformStyle: "preserve-3d",
        transition: "transform 0.6s ease",
      }}
      onClick={handleClick}
    >
      {/* Front of the card */}
      <div
        className="front"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          backgroundColor: "black",
        }}
      >
        <img
          src={albumCover}
          alt="Album Cover"
          style={{
            width: "100%",
            height: "75%",
            objectFit: "cover",
          }}
        />
        <p
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "0",
            padding: "5px",
            color: "white",
            backgroundColor: "#333",
          }}
        >
          {songName}
        </p>
      </div>

      {/* Back of the card */}
      <div
        className="back"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backfaceVisibility: "hidden",
          transform: "rotateY(0deg)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "black"
        }}
      ></div>
    </div>
  );
}
