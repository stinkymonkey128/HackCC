"use client";

import { useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Music } from "lucide-react";
import { useState, useEffect } from "react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// Reuse the same RandomBlurredBackground component
const RandomBlurredBackground = ({ children }) => {
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const images = [
      '/images/Get_up.jpg',
      '/images/Flower_boy.jpg',
      '/images/KissOfLife.jpg',
    ];

    const selectRandomImage = () => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImage(images[randomIndex]);
      setIsLoading(false);
    };

    selectRandomImage();
    const intervalId = setInterval(selectRandomImage, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className={`absolute inset-0 scale-110 transition-opacity duration-1000 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}>
        <div 
          className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 blur-md"
          style={{
            backgroundImage: currentImage ? `url(${currentImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default function Result() {
  const searchParams = useSearchParams();
  const song = searchParams.get('song');
  const [data, setData] = useState(null);

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

  return (
    <RandomBlurredBackground>
      <div className="min-h-screen">
        {/* Header */}
        <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Music className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">melodize</h1>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-[400px] h-[400px] mb-20">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              className="w-full h-full rounded-xl"
            >
              <SwiperSlide className="w-full h-full">
                <img 
                  src="/images/Blonde_-_Frank_Ocean.jpg"
                  alt="Frank Ocean Blonde"
                  className="w-full h-full object-cover rounded-xl"
                  style={{ objectFit: 'cover' }}
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </main>
      </div>
    </RandomBlurredBackground>
  );
}