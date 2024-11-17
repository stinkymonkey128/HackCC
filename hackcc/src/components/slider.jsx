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
    // Get the last visible card (front-most from user's perspective)
    const numVisibleCards = Math.min(4, cards.length);
    const frontCard = cards[numVisibleCards - 1];
    
    if (!frontCard) return;

    if (draggableRef.current && draggableRef.current[0]) {
      draggableRef.current[0].kill();
    }

    draggableRef.current = Draggable.create(frontCard, {
      type: "x",
      inertia: true,
      onDrag: function() {
        const rotation = this.x / 10;
        gsap.set(frontCard, { rotation: rotation });
        
        const opacity = 1 - Math.abs(this.x) / 500;
        gsap.set(frontCard, { opacity: Math.max(opacity, 0) });
      },
      onDragEnd: function() {
        const threshold = 150;
        
        if (Math.abs(this.x) > threshold) {
          const direction = this.x > 0 ? 'right' : 'left';
          completeSwipe(direction);
        } else {
          gsap.to(frontCard, {
            x: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out"
          });
        }
      }
    });
  };

  const completeSwipe = (direction) => {
    if (isAnimating || !sliderRef.current || displayImages.length === 0) return;
    
    setIsAnimating(true);
    const slider = sliderRef.current;
    const cards = Array.from(slider.querySelectorAll(".card"));
    const numVisibleCards =  cards.length;
    const frontCard = cards[numVisibleCards - 1];
    
    if (!frontCard) {
      setIsAnimating(false);
      return;
    }

    // Get the current song data (front-most visible card)
    const currentSong = displayImages[numVisibleCards - 1];

    gsap.to(frontCard, {
      x: direction === 'right' ? window.innerWidth + 200 : -window.innerWidth - 200,
      rotation: direction === 'right' ? 45 : -45,
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        // Remove the front-most visible card from displayImages
        setDisplayImages(prev => {
          const newImages = [...prev];
          const numVisibleCards =  newImages.length
          newImages.splice(numVisibleCards - 1, 1); // Remove the front-most visible card
          return newImages;
        });

        // If swiped right, add to liked songs
        if (direction === 'right') {
          setLikedSongs(prev => [...prev, currentSong]);
        }
        
        setTimeout(() => {
          setIsAnimating(false);
          if (displayImages.length > 1) {
            initializeCards();
            initializeDraggable();
          }
        }, 500);
      }
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

  const initializeCards = () => {
    if (!sliderRef.current || displayImages.length === 0) return;

    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const visibleCards = cards.slice(0, Math.min(4, cards.length));
    
    gsap.to(visibleCards, {
      visibility: "visible",
      y: (i) => 0 + 20 * i + "%",
      z: (i) => 15 * i,
      duration: 0.5,
      ease: "power3.out",
      stagger: -0.1,
    });

    gsap.to(cards.slice(4), {
      visibility: "hidden",
      duration: 0
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
          index > displayImages.length - 4 ? (<div 
            key={image.id} 
            className="card relative cursor-grab active:cursor-grabbing"
            style={{
              // visibility: index > d ? 'visible' : 'hidden',
              touchAction: 'none'
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
          </div>) : null
        ))}
      </div>
    </div>
  );
}

export default Result;