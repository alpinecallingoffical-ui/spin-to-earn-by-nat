
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface NumberGuessingGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const NumberGuessingGame: React.FC<NumberGuessingGameProps> = ({ onComplete, onClose }) => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [maxAttempts] = useState(7);

  useEffect(() => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
  }, []);

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      setFeedback('Please enter a number between 1 and 100');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      setFeedback('🎉 Congratulations! You guessed it!');
      setGameOver(true);
      const score = Math.max(1000 - (newAttempts * 100), 100);
      setTimeout(() => onComplete(score), 1500);
    } else if (newAttempts >= maxAttempts) {
      setFeedback(`😢 Game Over! The number was ${targetNumber}`);
      setGameOver(true);
      setTimeout(() => onComplete(50), 1500);
    } else if (guessNum < targetNumber) {
      setFeedback('📈 Too low! Try a higher number');
    } else {
      setFeedback('📉 Too high! Try a lower number');
    }

    setGuess('');
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
      <div className="text-center">
        <h3 className="text-white text-2xl font-bold mb-4">🔢 Number Guessing</h3>
        <p className="text-white/80 mb-4">Guess the number between 1-100!</p>
        
        <div className="mb-4">
          <p className="text-white/70 text-sm">Attempts: {attempts}/{maxAttempts}</p>
        </div>

        {!gameOver && (
          <div className="space-y-4">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess"
              className="w-full p-3 rounded-lg text-center text-lg"
              min="1"
              max="100"
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            />
            <Button onClick={handleGuess} className="w-full bg-blue-500 hover:bg-blue-600">
              Guess!
            </Button>
          </div>
        )}

        {feedback && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white font-semibold">{feedback}</p>
          </div>
        )}

        <Button onClick={onClose} variant="outline" className="mt-4 text-white border-white/50">
          Close Game
        </Button>
      </div>
    </div>
  );
};
