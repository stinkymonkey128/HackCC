"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Music } from "lucide-react";
import { images } from './images';
import gsap from "gsap";

export default function Result() {
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
  }, [isClient, sliderRef]);

  const handleMouseMove = () => {
    // If mouse moves, reset cards to original position if they were in idle state
    if (isIdleRef.current) {
      initializeCards();
      isIdleRef.current = false;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for idle animation
    timeoutRef.current = setTimeout(() => {
      if (!isAnimating) {
        applyIdleAnimation();
      }
    }, 4000);
  };

  const applyIdleAnimation = () => {
    isIdleRef.current = true;
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    const lastCard = cards[cards.length - 1];
    const otherCards = cards.slice(0, -1);

    // Animate last card slightly up
    gsap.to(lastCard, {
      y: "45%",  // Move up by 5%
      duration: 1.2,
      ease: "power2.out"
    });

    // Animate other cards down and behind the last card
    gsap.to(otherCards, {
      y: (i) => 20 + (i * 2) + "%",  // Move down and stack them
      z: (i) => -15 * (otherCards.length - i),  // Push them back in 3D space
      duration: 2.5,
      ease: "power2.out",
      stagger: 0.05
    });
  };

  const initializeCards = () => {
    const cards = Array.from(sliderRef.current.querySelectorAll(".card"));
    gsap.to(cards, {
      y: (i) => 0 + 20 * i + "%",
      z: (i) => 15 * i,
      duration: 1,
      ease: "power3.out",
      stagger: -0.1,
    });
  };

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const slider = sliderRef.current;
    const cards = Array.from(slider.querySelectorAll(".card"));
    const lastCard = cards.pop();
    
    gsap.to(lastCard, {
      y: "+=150%",
      duration: 0.75,
      ease: "power3.inOut",
      onStart: () => {
        setTimeout(() => {
          slider.prepend(lastCard);
          initializeCards();
          setTimeout(() => {
            setIsAnimating(false);
          }, 1000);
        }, 300);
      },
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
        {images.map((image) => (
          <div key={image.id} className="card">
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