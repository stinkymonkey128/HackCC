import { useState } from "react";

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

const Slider = () => {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [animation, setAnimation] = useState("");

  const albums = Array(10)
    .fill(0)
    .map(() => ({
      color: randomColor(),
      id: Math.random().toString(36).substr(2, 9),
    }));

  const handleSwipe = (direction) => {
    if (animation) return; // Prevent multiple swipes at once

    let newIndex = index;

    if (direction === "up" && index < albums.length - 1) newIndex += 1;
    if (direction === "down" && index > 0) newIndex -= 1;

    if (direction === "left") {
      setLiked((prev) => [...prev, albums[index]]);
      newIndex += 1;
    }

    if (direction === "right") {
      setDisliked((prev) => [...prev, albums[index]]);
      newIndex += 1;
    }

    if (newIndex !== index && newIndex >= 0 && newIndex < albums.length) {
      setAnimation(`swipe-${direction}`);
      setTimeout(() => {
        setIndex(newIndex);
        setAnimation("");
      }, 500); // Duration of the animation
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-900">
      <div className="relative h-96 w-96 overflow-hidden">
        {albums.map((album, i) => (
          <div
            key={album.id}
            className={`absolute top-0 left-0 h-full w-full flex items-center justify-center text-white font-bold text-xl rounded-lg transition-transform transform ${
              i === index
                ? `bg-[${album.color}] scale-100 z-20`
                : i > index
                ? "scale-90 z-10 opacity-50"
                : "scale-80 z-0 opacity-30"
            } ${i === index && animation && animation}`}
            style={{
              backgroundColor: album.color,
            }}
          >
            Album {i + 1}
          </div>
        ))}
      </div>

      <div className="mt-8 flex space-x-4">
        <button
          className="px-4 py-2 bg-red-500 rounded-lg text-white"
          onClick={() => handleSwipe("left")}
        >
          Dislike (←)
        </button>
        <button
          className="px-4 py-2 bg-blue-500 rounded-lg text-white"
          onClick={() => handleSwipe("down")}
        >
          Previous (↓)
        </button>
        <button
          className="px-4 py-2 bg-green-500 rounded-lg text-white"
          onClick={() => handleSwipe("up")}
        >
          Next (↑)
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 rounded-lg text-white"
          onClick={() => handleSwipe("right")}
        >
          Like (→)
        </button>
      </div>

      <div className="mt-4 text-white">
        <div>
          <strong>Liked:</strong> {liked.length}
        </div>
        <div>
          <strong>Disliked:</strong> {disliked.length}
        </div>
      </div>
    </div>
  );
};

export default Slider;
