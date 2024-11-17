"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Music, Search } from "lucide-react";

const RandomBlurredBackground = ({ children }) => {
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define your background images array
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

export default function Home() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/?song=' + encodeURIComponent(query));
      const responseData = await response.json();
      setData(responseData);
      router.push('/result?song=' + encodeURIComponent(query));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
                How are you feeling today?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Let us find the perfect melody for your mood
              </p>
            </div>
            
            <div className="w-full space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a song name..."
                  className="w-full pl-4 pr-12 py-3 bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {data && (
                <div className="mt-4 p-4 rounded-lg bg-white/90 backdrop-blur-sm">
                  <pre className="text-left text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </RandomBlurredBackground>
  );
}