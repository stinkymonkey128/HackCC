import Card from "./Card";

export default function Grid({ gridIndex, totalCards, cardsPerGrid }) {
  return (
    <div
      id={`grid-${gridIndex}`}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "10px",
        width: "100vw",
        height: "100vh",
        padding: "15px",
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: cardsPerGrid }).map((_, cardIndex) => {
        const cardNumber = gridIndex * cardsPerGrid + cardIndex + 1;

        return cardNumber <= totalCards ? (
          <Card
            key={cardNumber}
            albumCover={`https://via.placeholder.com/300x200?text=Album+${cardNumber}`}
            songName={`Song ${cardNumber}`}
            songUrl={`https://example.com/song${cardNumber}.mp3`}
          />
        ) : null;
      })}
    </div>
  );
}
