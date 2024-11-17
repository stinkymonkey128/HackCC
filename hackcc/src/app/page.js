"use client";

import { useEffect, useState } from "react";
import Grid from "../components/ui/Grid";

export default function Home() {
  const totalCards = 18; // Total number of cards
  const cardsPerGrid = 8; // Cards per grid (2 rows x 4 columns)
  const gridsNeeded = Math.ceil(totalCards / cardsPerGrid);

  const [currentGrid, setCurrentGrid] = useState(0);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Disable scrolling and handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        if (animationCompleted) {
          if (event.key === "ArrowLeft" && currentGrid > 0) {
            setCurrentGrid((prev) => prev - 1);
          } else if (event.key === "ArrowRight" && currentGrid < gridsNeeded - 1) {
            setCurrentGrid((prev) => prev + 1);
          }
        }
      }
    };

    const disableScroll = (event) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", disableScroll, { passive: false });
    window.addEventListener("touchmove", disableScroll, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", disableScroll);
      window.removeEventListener("touchmove", disableScroll);
    };
  }, [animationCompleted, currentGrid, gridsNeeded]);

  // Flip cards one by one
  useEffect(() => {
    const startAnimation = async () => {
      for (let i = 0; i < gridsNeeded; i++) {
        await flipGridCards(i);
        if (i < gridsNeeded - 1) await slideToNextGrid(i + 1);
      }
      setAnimationCompleted(true);
    };

    startAnimation();
  }, [gridsNeeded]);

  const flipGridCards = (gridIndex) => {
    const grid = document.getElementById(`grid-${gridIndex}`);
    const cards = grid.querySelectorAll(".card");
    return new Promise((resolve) => {
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("flipped");
          if (index === cards.length - 1) resolve();
        }, index * 200); // Delay between card flips
      });
    });
  };

  const slideToNextGrid = (nextGridIndex) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentGrid(nextGridIndex);
        resolve();
      }, 1000);
    });
  };

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "Arial, sans-serif", backgroundColor: "#f0f0f0", height: "100vh", overflow: "hidden" }}>
      {animationCompleted && (
        <div style={{ position: "absolute", top: "50%", width: "100%", display: "flex", justifyContent: "space-between", zIndex: 10, transform: "translateY(-50%)" }}>
          <button
            style={{
              fontSize: "24px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: currentGrid === 0 ? "not-allowed" : "pointer",
              opacity: currentGrid === 0 ? 0.2 : 0.5,
            }}
            disabled={currentGrid === 0}
            onClick={() => setCurrentGrid((prev) => prev - 1)}
          >
            &lt;
          </button>
          <button
            style={{
              fontSize: "24px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: currentGrid === gridsNeeded - 1 ? "not-allowed" : "pointer",
              opacity: currentGrid === gridsNeeded - 1 ? 0.2 : 0.5,
            }}
            disabled={currentGrid === gridsNeeded - 1}
            onClick={() => setCurrentGrid((prev) => prev + 1)}
          >
            &gt;
          </button>
        </div>
      )}

      <div
        id="grid-container"
        style={{
          display: "flex",
          width: `calc(100vw * ${gridsNeeded})`,
          height: "100vh",
          transition: "transform 1s ease-in-out",
          transform: `translateX(-${currentGrid * 100}vw)`,
        }}
      >
        {Array.from({ length: gridsNeeded }).map((_, gridIndex) => (
          <Grid key={gridIndex} gridIndex={gridIndex} totalCards={totalCards} cardsPerGrid={cardsPerGrid} />
        ))}
      </div>
    </div>
  );
}
