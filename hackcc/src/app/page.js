"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Swiper from "@/components/slider";
import PlayButton from "@/components/playbutton";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CancelIcon from "@mui/icons-material/Cancel";

export default function Home() {
  const router = useRouter();
  const [songInput, setSongInput] = useState("");
  const [apiResponse, setApiResponse] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState({ check: false, cancel: false });
  const [selectedSong, setSelectedSong] = useState(0);

  const QUESTION_ARRAY = 
  ["How are you feeling today?",
    "What are you in the mood to listen to?",
    "You got a vibe in mind?",
    "Whats the move?",
    "Switch it up?"
  ];

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:5000/song/?name=${encodeURIComponent(songInput)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch songs.");
      }

      const data = await response.json();
      setApiResponse(data);
      setIsCorrect(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (songInput.trim()) {
      setApiResponse([]);
      setIsCorrect(null);
      setSelectedSong(0)
      fetchSongs();
    }
  };

  const handleSongSelection = (index) => {
    if (index < 0 || index >= apiResponse.length) {
      console.error("Invalid index:", index);
      return;
    }
    setSelectedSong(index);
    setIsCorrect(true);
  };

  return (
    <>
    {(isCorrect === null || !isCorrect) && (
      <div className="grid min-h-screen">
        <header className="absolute top-0 left-0 w-full p-4 flex items-center z-10">
          <h1 className="text-2xl font-bold">melodize</h1>
        </header>
        <main className="flex flex-col items-center justify-center flex-1 mt-16">
          <Label
            htmlFor="songInput"
            className="mb-4 text-5xl text-center text-gray-700"
          >
            {QUESTION_ARRAY[Math.floor(Math.random() * QUESTION_ARRAY.length)]}
          </Label>

          <Label
            htmlFor="songInput"
            className="mb-4 text-2xl text-center text-gray-500"
          >
            Let us find the perfect melody for your mood
          </Label>

          <div className="w-full max-w-md">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md flex flex-col items-center"
            >
              <Input
                id="songInput"
                placeholder="Type a song name..."
                className="w-full mb-4"
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                disabled={loading}
              />
            </form>
          </div>

          {loading && (
            <div className="w-full max-w-2xl mt-8 space-y-4">
              {Array.from({ length: 1 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-700 rounded-lg shadow-md p-4"
                >
                  <Skeleton className="w-24 h-24 rounded-lg mr-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && apiResponse.length > 0 && (
            <div className="w-full max-w-2xl mt-8">
              {isCorrect === null && (
                <div className="relative bg-gray-800 rounded-xl shadow-md p-4 flex items-center">
                  <img
                    src={apiResponse[0].albumCoverUrl}
                    alt={apiResponse[0].title}
                    className="w-32 h-32 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {apiResponse[0].title}
                    </h3>
                    <p className="text-gray-400">{apiResponse[0].artist}</p>
                    <p className="text-gray-500 text-sm">
                      {apiResponse[0].albumTitle}
                    </p>
                    {apiResponse[0].year && (
                      <p className="text-gray-500 text-xs mt-1">
                        Released: {apiResponse[0].year}
                      </p>
                    )}
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => {
                          handleSongSelection(0);
                        }}
                        className="transition-transform transform hover:scale-110"
                        tabIndex={0}
                        onMouseEnter={() => setHovering({ ...hovering, check: true })}
                        onMouseLeave={() => setHovering({ ...hovering, check: false })}
                      >
                        {hovering.check ? (
                          <CheckCircleIcon
                            className="text-blue-500"
                            style={{ fontSize: "2.5rem" }}
                          />
                        ) : (
                          <CheckCircleOutlineIcon
                            className="text-blue-500"
                            style={{ fontSize: "2.5rem" }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setIsCorrect(false)}
                        className="transition-transform transform hover:scale-110"
                        onMouseEnter={() => setHovering({ ...hovering, cancel: true })}
                        onMouseLeave={() => setHovering({ ...hovering, cancel: false })}
                      >
                        {hovering.cancel ? (
                          <CancelIcon
                            className="text-red-500"
                            style={{ fontSize: "2.5rem" }}
                          />
                        ) : (
                          <CancelOutlinedIcon
                            className="text-red-500"
                            style={{ fontSize: "2.5rem" }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <PlayButton audioUrl={apiResponse[0].previewUrl} />
                  </div>
                </div>
              )}

              {isCorrect === false && (
                <div className="mt-8 space-y-4 max-w-2xl">
                  {apiResponse.slice(1, 6).map((song, index) => (
                    <div
                      key={index}
                      className="relative flex items-center bg-gray-700 rounded-lg shadow-md p-4 transform transition-transform hover:scale-105 w-full"
                    >
                      <img
                        src={song.albumCoverUrl}
                        alt={song.title}
                        className="w-24 h-24 object-cover rounded-lg mr-4 flex-shrink-0"
                      />
                      <div
                        className="flex-1 text-left cursor-pointer"
                        onClick={() => handleSongSelection(index + 1)}
                      >
                        <h3 className="text-lg font-bold text-white">
                          {song.title}
                        </h3>
                        <p className="text-gray-400">{song.artist}</p>
                        <p className="text-gray-500 text-sm">{song.albumTitle}</p>
                        {song.year && (
                          <p className="text-gray-500 text-xs mt-1">
                            Released: {song.year}
                          </p>
                        )}
                      </div>
                      <div
                        className="absolute bottom-2 right-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PlayButton audioUrl={song.previewUrl} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    )}
    {(isCorrect) && 
      <Swiper previewUrl={apiResponse[selectedSong]['previewUrl']}/>
      //<Swiper previewUrl={apiResponse[selectedSong]['title']}/>
    }
    </>
  );
}