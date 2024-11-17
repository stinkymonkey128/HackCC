import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const CardSwiper = () => {
  const [cards, setCards] = useState([
    { id: 1, content: "Card 1" },
    { id: 2, content: "Card 2" },
    { id: 3, content: "Card 3" },
    { id: 4, content: "Card 4" },
    { id: 5, content: "Card 5" },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === "LEFT" && activeIndex < cards.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (direction === "RIGHT" && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (direction === "UP") {
      // Handle "Like"
      console.log("Liked:", cards[activeIndex].content);
      discardCard();
    } else if (direction === "DOWN") {
      // Handle "Dislike"
      console.log("Disliked:", cards[activeIndex].content);
      discardCard();
    }
  };

  const discardCard = () => {
    setCards((prevCards) => prevCards.filter((_, index) => index !== activeIndex));
    setActiveIndex((prevIndex) => Math.min(prevIndex, cards.length - 2));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("LEFT"),
    onSwipedRight: () => handleSwipe("RIGHT"),
    onSwipedUp: () => handleSwipe("UP"),
    onSwipedDown: () => handleSwipe("DOWN"),
  });

  return (
    <div {...swipeHandlers} className="relative w-full h-[400px] flex items-center justify-center">
      <div className="relative w-[90%] h-full overflow-hidden">
        <div className="flex items-center justify-center gap-4">
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            const positionClass =
              index < activeIndex
                ? "-translate-x-24 scale-90 opacity-50"
                : index > activeIndex
                ? "translate-x-24 scale-90 opacity-50"
                : "scale-100 opacity-100";
            return (
              <div
                key={card.id}
                className={`absolute w-[300px] h-[400px] bg-white shadow-lg rounded-lg transition-transform duration-300 ${positionClass} ${
                  isActive ? "z-10" : "z-0"
                }`}
              >
                <div className="p-4 flex justify-center items-center h-full text-xl font-bold text-gray-700">
                  {card.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CardSwiper;
