"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [orbPositions, setOrbPositions] = useState([]);

  useEffect(() => {
    const positions = Array.from({ length: 4 }).map(() => ({
      top: `${Math.random() * 80}vh`,
      left: `${Math.random() * 80}vw`,
    }));
    setOrbPositions(positions);
  }, []);

  return (
    <>
      <div className="grid min-h-screen relative">
        {/* Header with Static JPEG Logo */}
        <header className="fixed top-0 left-0 w-full p-4 flex items-center z-10">
          <img
            src="/melodize_logo2-1.png" /* Path to the logo */
            alt="Melodize Logo"
            className="logo"
          />
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center flex-1 mt-16 relative z-10">
          <Label
            htmlFor="songInput"
            className="mb-4 text-3xl text-center text-white"
          >
            How are you feeling today?
          </Label>

          <div className="w-full max-w-md">
            <Input
              id="songInput"
              placeholder="Type a song name..."
              className="w-full text-gray-800"
            />
          </div>
        </main>

        {/* Randomized Orbs */}
        {orbPositions.map((position, index) => (
          <div
            key={index}
            className={`orb orb${index + 1}`}
            style={{ top: position.top, left: position.left }}
          ></div>
        ))}
      </div>

      {/* Styles */}
      <style jsx global>{`
        /* Background Gradient */
        body {
          background: linear-gradient(180deg, #1e3a8a, #3b82f6);
          margin: 0;
          font-family: sans-serif;
          overflow: hidden;
        }

        /* Orb Animations */
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(60px, -60px) scale(1.2) rotate(45deg);
          }
          50% {
            transform: translate(-80px, 80px) scale(1.3) rotate(90deg);
          }
          75% {
            transform: translate(60px, 60px) scale(1.1) rotate(135deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(180deg);
          }
        }

        /* Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.8;
          animation: float 8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        .orb1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #ff5c77, #fca5a5);
          animation-delay: 0s;
        }

        .orb2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #34d399, #10b981);
          animation-delay: 1.5s;
        }

        .orb3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #a78bfa, #6366f1);
          animation-delay: 3s;
        }

        .orb4 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #fcd34d, #f59e0b);
          animation-delay: 2s;
        }
      `}</style>

      <style jsx>{`
        /* Logo Styling */
        .logo {
          height: 50px; /* Adjust the size of the logo */
          width: auto;
        }

        /* Main Styles */
        .main {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: white;
        }

        .main p {
          font-size: 1.2rem;
        }

        .input-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 2rem;
        }

        .input-container input {
          padding: 0.8rem 1rem;
          font-size: 1rem;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }

        .input-container input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </>
  );
}
