"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Music } from "lucide-react";
import gsap from "gsap";

// Default images in case the fetch fails
const defaultImages = [
  { id: 1, src: "/image1.jpg", title: "Default 1" },
  { id: 2, src: "/image2.jpg", title: "Default 2" },
  { id: 3, src: "/image3.jpg", title: "Default 3" },
  { id: 4, src: "/image4.jpg", title: "Default 4" },
  { id: 5, src: "/image5.jpg", title: "Default 5" },
];

export function Result() {
  const searchParams = useSearchParams();
  const song = searchParams.get('song');
  const [data, setData] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const sliderRef = useRef(null);
  const timeoutRef = useRef(null);
  const isIdleRef = useRef(false);

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
        
        // Transform the response data into the image format
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
        setDisplayImages(defaultImages);
      }
    };

    if (song) {
      fetchData();
    }
  }, [song]);

  useEffect(() => {
    if (isClient && sliderRef.current) {
      initializeCards();
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isClient, displayImages]);

  const handleMouseMove = () => {
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
    isIdleRef.current = true;
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const visibleCards = cards.slice(0, 4);
    const lastCard = visibleCards[visibleCards.length - 1];
    const otherCards = visibleCards.slice(0, -1);

    const yOffset = (visibleCards.length * 12) + "%";

    gsap.to(lastCard, {
      y: yOffset,
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

    gsap.to(cards.slice(4), {
      visibility: "hidden",
      duration: 0
    });
  };

  const initializeCards = () => {
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const visibleCards = cards.slice(0, 4);
    
    gsap.to(visibleCards, {
      visibility: "visible",
      y: (i) => 0 + 20 * i + "%",
      z: (i) => 15 * i,
      duration: 1,
      ease: "power3.out",
      stagger: -0.1,
    });

    gsap.to(cards.slice(4), {
      visibility: "hidden",
      duration: 0
    });
  };

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const slider = sliderRef.current;
    const cards = Array.from(slider.querySelectorAll(".card"));
    const firstCard = cards[0];
    
    gsap.to(firstCard, {
      y: "-150%",
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        slider.appendChild(firstCard);
        
        gsap.set(firstCard, {
          y: "150%",
          opacity: 0,
        });
        
        gsap.to(firstCard, {
          y: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        });
        
        initializeCards();
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }
    });
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Music className="h-6 w-6 text-black" />
          <h1 className="header-title">melodize</h1>
        </div>
      </header>

      <div className="slider" ref={sliderRef} onClick={handleClick}>
        {displayImages.map((image, index) => (
          <div 
            key={image.id} 
            className="card relative"
            style={{
              visibility: index < 4 ? 'visible' : 'hidden'
            }}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
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