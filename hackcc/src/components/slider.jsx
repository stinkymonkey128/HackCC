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

  const audioRef = useRef(null);
  const [currentAudioSrc, setCurrentAudioSrc] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(previewUrl)
        // http://127.0.0.1:5000/song/?name=${previewUrl}&limit=200
        // 
        const response = await fetch(
          `http://127.0.0.1:5000/similar/?url=${previewUrl}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const responseData = await response.json();
        console.log(responseData)
        setData(responseData);
    
        const formattedImages = responseData.map((song, index) => ({
          id: index + 1,
          src: song["data"].albumCoverUrl,
          title: song["data"].title,
          artist: song["data"].artist,
          albumTitle: song["data"].albumTitle,
          preview: song["data"].previewUrl
        }));
    
        setDisplayImages(formattedImages);
        console.log(formattedImages);
      } catch (error) {
        console.error("Error:", error);
        setDisplayImages([]);
      } finally {
        setLoading(false);
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isClient, displayImages]);

  useEffect(() => {
    playCurrentAudio();
  }, [displayImages]);

  const playCurrentAudio = () => {
    const topSong = displayImages[0];
    if (!topSong || !topSong.preview) return;

    if (currentAudioSrc === topSong.preview) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(topSong.preview);
    audioRef.current = audio;
    setCurrentAudioSrc(topSong.preview);

    audio.loop = false;
    audio.autoplay = true;

    audio.onerror = (e) => {
      console.error("Audio playback failed:", e);
    };

    audio.play().catch((error) => {
      console.error("Audio play error:", error);
    });
  };

  const initializeDraggable = () => {
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const frontCard = cards[0]; 
  
    if (!frontCard) return;
  
    if (draggableRef.current && draggableRef.current[0]) {
      draggableRef.current[0].kill(); 
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
  
    const baseY = 100;
    cards.forEach((card, i) => {
      gsap.to(card, {
        zIndex: displayImages.length - i,
        y: `${baseY + -i * 20}px`,
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
        const topCard = newImages.shift();
        newImages.push(topCard);
      } else if (direction === "down") {
        const bottomCard = newImages.pop();
        newImages.unshift(bottomCard);
      }
      return newImages;
    });

    setTimeout(() => initializeCards(), 100);
  };

  const completeSwipe = (direction) => {
    if (isAnimating || !sliderRef.current || displayImages.length === 0) return;
  
    setIsAnimating(true);
    const slider = sliderRef.current;
    const cards = Array.from(slider.querySelectorAll(".card"));
    const frontCard = cards[0];
  
    if (!frontCard) {
      setIsAnimating(false);
      return;
    }
  
    const currentSong = displayImages[0];
  
    gsap.to(frontCard, {
      x: direction === "right" ? window.innerWidth + 200 : -window.innerWidth - 200,
      rotation: direction === "right" ? 45 : -45,
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        setDisplayImages((prev) => {
          const newImages = [...prev];
          newImages.shift();
          return newImages;
        });
  
        if (direction === "right") {
          setLikedSongs((prev) => [...prev, currentSong]);
        }
  
        setTimeout(() => {
          setIsAnimating(false);
          initializeCards();
          initializeDraggable();
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
         <h1 className="text-2xl font-bold">melodize</h1>
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
