
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Question {
  question: string;
  answer: number;
}

interface QuickMathGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const QuickMathGame: React.FC<QuickMathGameProps> = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation === '*') {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
    } else {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      
      if (operation === '+') {
        answer = num1 + num2;
      } else {
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
      }
    }
    
    return {
      question: `${num1} ${operation} ${num2}`,
      answer
    };
  };

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setTimeout(() => onComplete(score), 1500);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  const handleSubmitAnswer = () => {
    const answer = parseInt(userAnswer);
    if (isNaN(answer)) return;

    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);

    if (answer === currentQuestion.answer) {
      setScore(score + 10);
    }

    setUserAnswer('');
    setCurrentQuestion(generateQuestion());

    if (newQuestionsAnswered >= 20) {
      setGameOver(true);
      setTimeout(() => onComplete(score + (timeLeft * 2)), 1500);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
      <div className="text-center">
        <h3 className="text-white text-2xl font-bold mb-4">➕ Quick Math</h3>
        
        <div className="flex justify-between text-white/80 mb-4">
          <span>Score: {score}</span>
          <span>Time: {timeLeft}s</span>
        </div>

        <div className="mb-4 p-4 bg-white/10 rounded-lg">
          <p className="text-white/70 text-sm mb-2">Question {questionsAnswered + 1}/20</p>
          <p className="text-white text-3xl font-bold">{currentQuestion.question} = ?</p>
        </div>

        {!gameOver && (
          <div className="space-y-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              className="w-full p-3 rounded-lg text-center text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              autoFocus
            />
            <Button onClick={handleSubmitAnswer} className="w-full bg-green-500 hover:bg-green-600">
              Submit Answer
            </Button>
          </div>
        )}

        {gameOver && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
            <p className="text-blue-300 font-semibold">🎯 Game Complete!</p>
            <p className="text-white/80">Final Score: {score}</p>
          </div>
        )}

        <Button onClick={onClose} variant="outline" className="mt-4 text-white border-white/50">
          Close Game
        </Button>
      </div>
    </div>
  );
};
