"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Music } from "lucide-react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export function Swiper({ previewUrl }) {
  const [data, setData] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);
  const timeoutRef = useRef(null);
  const draggableRef = useRef(null);

  // Audio-related refs
  const audioRef = useRef(null);
  const [currentAudioSrc, setCurrentAudioSrc] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://127.0.0.1:5000/song/?name=${previewUrl}&limit=200`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const responseData = await response.json();
        setData(responseData);
    
        const formattedImages = responseData.map((song, index) => ({
          id: index + 1,
          src: song.albumCoverUrl,
          title: song.title,
          artist: song.artist,
          albumTitle: song.albumTitle,
          preview: song.previewUrl
        }));
    
        setDisplayImages(formattedImages);
        console.log(formattedImages);
      } catch (error) {
        console.error("Error:", error);
        setDisplayImages([]);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (previewUrl) {
      fetchData();
    }
  }, [previewUrl]);

  useEffect(() => {
    if (isClient && sliderRef.current && displayImages.length > 0) {
      initializeCards();
      initializeDraggable();
      window.addEventListener('mousemove', handleMouseMove);
      // Initialize audio for the top card
      playCurrentAudio();
    }

    return () => {
      if (draggableRef.current && draggableRef.current[0]) {
        draggableRef.current[0].kill();
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isClient, displayImages]);

  useEffect(() => {
    // When the top card changes, play the new audio
    playCurrentAudio();
  }, [displayImages]);

  const playCurrentAudio = () => {
    const topSong = displayImages[0];
    if (!topSong || !topSong.preview) return;

    // If the current audio source is the same as the new one, do nothing
    if (currentAudioSrc === topSong.preview) return;

    // Pause and cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create a new Audio instance
    const audio = new Audio(topSong.preview);
    audioRef.current = audio;
    setCurrentAudioSrc(topSong.preview);

    // Optional: Set additional audio properties
    audio.loop = false;
    audio.autoplay = true;

    // Handle any errors
    audio.onerror = (e) => {
      console.error("Audio playback failed:", e);
    };

    // Play the audio
    audio.play().catch((error) => {
      console.error("Audio play error:", error);
    });
  };

  const initializeDraggable = () => {
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const frontCard = cards[0]; // The new top-most card
  
    if (!frontCard) return;
  
    if (draggableRef.current && draggableRef.current[0]) {
      draggableRef.current[0].kill(); // Remove the old Draggable instance
    }
  
    draggableRef.current = Draggable.create(frontCard, {
      type: "x,y",
      inertia: true,
      onDrag: function () {
        const rotation = this.x / 10;
        gsap.set(frontCard, { rotation });
  
        const opacity = 1 - Math.abs(this.x) / 500;
        gsap.set(frontCard, { opacity: Math.max(opacity, 0) });
      },
      onDragEnd: function () {
        const threshold = 150;
  
        if (Math.abs(this.x) > threshold) {
          const direction = this.x > 0 ? "right" : "left";
          completeSwipe(direction);
        } else if (Math.abs(this.y) > threshold) {
          const direction = this.y > 0 ? "down" : "up";
          traverseStack(direction);
        } else {
          // Magnet the card back to its original position
          gsap.to(frontCard, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          });
        }
      },
    });
  };

  const initializeCards = () => {
    if (!sliderRef.current || displayImages.length === 0) return;
  
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
  
    const baseY = 100; // Adjust this value to move the stack down
    cards.forEach((card, i) => {
      gsap.to(card, {
        zIndex: displayImages.length - i,
        y: `${baseY + -i * 20}px`, // Base offset + stacked spacing
        scale: 1 - i * 0.05,
        visibility: i < 4 ? "visible" : "hidden",
        duration: 0.5,
      });
    });
  };

  const traverseStack = (direction) => {
    setDisplayImages((prev) => {
      const newImages = [...prev];
      if (direction === "up") {
        // Move the top card to the bottom
        const topCard = newImages.shift();
        newImages.push(topCard);
      } else if (direction === "down") {
        // Move the bottom card to the top
        const bottomCard = newImages.pop();
        newImages.unshift(bottomCard);
      }
      return newImages;
    });

    // Reinitialize card positions
    setTimeout(() => initializeCards(), 100);
  };

  const completeSwipe = (direction) => {
    if (isAnimating || !sliderRef.current || displayImages.length === 0) return;
  
    setIsAnimating(true);
    const slider = sliderRef.current;
    const cards = Array.from(slider.querySelectorAll(".card"));
    const frontCard = cards[0]; // Top-most card
  
    if (!frontCard) {
      setIsAnimating(false);
      return;
    }
  
    const currentSong = displayImages[0];
  
    // Animate card off-screen
    gsap.to(frontCard, {
      x: direction === "right" ? window.innerWidth + 200 : -window.innerWidth - 200,
      rotation: direction === "right" ? 45 : -45,
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        setDisplayImages((prev) => {
          const newImages = [...prev];
          newImages.shift(); // Remove top card
          return newImages;
        });
  
        if (direction === "right") {
          setLikedSongs((prev) => [...prev, currentSong]);
        }
  
        setTimeout(() => {
          setIsAnimating(false);
          initializeCards(); // Update the card stack visually
          initializeDraggable(); // Reinitialize Draggable for the new top card
        }, 100);
      },
    });
  };

  const handleMouseMove = () => {
    if (!sliderRef.current || displayImages.length === 0) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Loading state
  if (displayImages.length === 0) {
    return (
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="text-2xl font-bold">melodize</h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Music className="h-6 w-6 text-black" />
          <h1 className="header-title">melodize</h1>
        </div>
      </header>

      {loading ? (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
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
      ) : (
        <div className="slider" ref={sliderRef}>
          {displayImages.map((image, index) => (
            <div
              key={image.id}
              className="card relative cursor-grab active:cursor-grabbing"
              style={{
                zIndex: displayImages.length - index,
                touchAction: "none",
                visibility: index < 4 ? "visible" : "hidden",
              }}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover"
                draggable="false"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-white">
                <h3 className="text-lg font-bold">{image.title}</h3>
                {image.artist && <p className="text-sm">{image.artist}</p>}
                {image.albumTitle && (
                  <p className="text-xs mt-1">{image.albumTitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );  
}

export default Swiper;
