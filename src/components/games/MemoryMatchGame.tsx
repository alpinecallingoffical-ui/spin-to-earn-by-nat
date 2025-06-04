
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onComplete, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const emojis = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐸', '🐯'];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameEmojis = emojis.slice(0, 6);
    const cardPairs = [...gameEmojis, ...gameEmojis];
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5).map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(shuffledCards);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      setTimeout(() => {
        const [first, second] = newFlippedCards;
        if (cards[first].emoji === cards[second].emoji) {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true } 
              : card
          ));
          
          const newMatches = matches + 1;
          setMatches(newMatches);
          
          if (newMatches === 6) {
            setGameOver(true);
            const score = Math.max(1000 - (moves * 50), 200);
            setTimeout(() => onComplete(score), 1000);
          }
        } else {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false } 
              : card
          ));
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-lg w-full">
      <div className="text-center">
        <h3 className="text-white text-2xl font-bold mb-4">🧠 Memory Match</h3>
        <div className="flex justify-between text-white/80 mb-4">
          <span>Moves: {moves}</span>
          <span>Matches: {matches}/6</span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-lg text-2xl font-bold transition-all ${
                card.isFlipped || card.isMatched
                  ? 'bg-white text-gray-800'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={gameOver}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '?'}
            </button>
          ))}
        </div>

        {gameOver && (
          <div className="mb-4 p-3 bg-green-500/20 rounded-lg">
            <p className="text-green-300 font-semibold">🎉 Congratulations!</p>
            <p className="text-white/80">Completed in {moves} moves</p>
          </div>
        )}

        <Button onClick={onClose} variant="outline" className="text-white border-white/50">
          Close Game
        </Button>
      </div>
    </div>
  );
};
