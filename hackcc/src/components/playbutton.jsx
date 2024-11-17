import { useState, useRef } from "react";

import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";

const PlayButton = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hovering, setHovering] = useState(false);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <audio ref={audioRef} src={audioUrl} loop />
      <button
        onClick={handlePlayPause}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="transition-transform transform hover:scale-125"
      >
        {hovering
          ? isPlaying
            ? <PauseCircleIcon className="text-green-500" style={{ fontSize: "3rem" }} />
            : <PlayCircleIcon className="text-green-500" style={{ fontSize: "3rem" }} />
          : isPlaying
          ? <PauseCircleOutlineIcon className="text-green-500" style={{ fontSize: "3rem" }} />
          : <PlayCircleOutlineIcon className="text-green-500" style={{ fontSize: "3rem" }} />}
      </button>
    </div>
  );
};

export default PlayButton;
