"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Music } from "lucide-react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export function Result() {
  const searchParams = useSearchParams();
  const song = searchParams.get('song');
  const [data, setData] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const sliderRef = useRef(null);
  const timeoutRef = useRef(null);
  const isIdleRef = useRef(false);
  const draggableRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/song/?name=${encodeURIComponent(song)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

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
          albumTitle: song.albumTitle
        }));
        
        setDisplayImages(formattedImages);
      } catch (error) {
        console.error('Error:', error);
        setDisplayImages([]);
      }
    };

    if (song) {
      fetchData();
    }
  }, [song]);

  useEffect(() => {
    if (isClient && sliderRef.current && displayImages.length > 0) {
      initializeCards();
      initializeDraggable();
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (draggableRef.current && draggableRef.current[0]) {
        draggableRef.current[0].kill();
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isClient, displayImages]);

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

    if (isIdleRef.current) {
      initializeCards();
      isIdleRef.current = false;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!isAnimating) {
        applyIdleAnimation();
      }
    }, 4000);
  };

  const applyIdleAnimation = () => {
    if (!sliderRef.current || displayImages.length === 0) return;

    isIdleRef.current = true;
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const visibleCards = cards.slice(0, Math.min(4, cards.length));
    const frontCard = visibleCards[visibleCards.length - 1];
    const otherCards = visibleCards.slice(0, -1);

    gsap.to(frontCard, {
      y: "48%",
      duration: 1.2,
      ease: "power2.out"
    });

    gsap.to(otherCards, {
      y: (i) => 20 + (i * 2) + "%",
      z: (i) => -15 * (otherCards.length - i),
      duration: 2.5,
      ease: "power2.out",
      stagger: 0.05
    });
  };

  // Loading state
  if (displayImages.length === 0) {
    return (
      <div className="container">
        <header className="header">
          <div className="header-content">
            <Music className="h-6 w-6 text-black" />
            <h1 className="header-title">melodize</h1>
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
  
      <div className="slider" ref={sliderRef}>
  {displayImages.map((image, index) => (
    <div
      key={image.id}
      className="card relative cursor-grab active:cursor-grabbing"
      style={{
        zIndex: displayImages.length - index, // Ensure proper stacking
        touchAction: "none",
        visibility: index < 4 ? "visible" : "hidden", // Show top 4 cards
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
        {image.albumTitle && <p className="text-xs mt-1">{image.albumTitle}</p>}
      </div>
    </div>
  ))}
</div>

    </div>
  );  
}

export default Result;