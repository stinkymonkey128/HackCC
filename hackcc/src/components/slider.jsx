"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Music } from "lucide-react";
import { images } from '@/app/result/images';
import gsap from "gsap";

export function Result() {
  const searchParams = useSearchParams();
  const song = searchParams.get('song');
  const [data, setData] = useState(null);
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
        const response = await fetch('http://127.0.0.1:5000/?song=' + encodeURIComponent(song));
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('Error:', error);
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
  }, [isClient]);

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
    const firstCard = cards[0]; // Get the first visible card
    
    // First, animate the card up and away
    gsap.to(firstCard, {
      y: "-150%", // Move up instead of down
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        // Move the first card to the end of the list
        slider.appendChild(firstCard);
        
        // Reset the card's position and opacity
        gsap.set(firstCard, {
          y: "150%", // Position below
          opacity: 0,
        });
        
        // Animate it back in
        gsap.to(firstCard, {
          y: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        });
        
        // Reposition all cards
        initializeCards();
        
        // Allow new animations after a short delay
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
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="card"
            style={{
              visibility: index < 4 ? 'visible' : 'hidden'
            }}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Result;