import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeQuizAtom, usedQuestionsAtom, playersAtom } from '@/atoms/game.atoms';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function QuestionScreen() {
  const { catIdx, qIdx } = useParams<{ catIdx: string; qIdx: string }>();
  const quiz = useAtomValue(activeQuizAtom);
  const [players, setPlayers] = useAtom(playersAtom);
  const setUsedQuestions = useSetAtom(usedQuestionsAtom);
  const navigate = useNavigate();
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isTimerRunning]);

  const cat = quiz?.categories[parseInt(catIdx!)];
  const question = cat?.questions[parseInt(qIdx!)];

  const handlePlayerAnswer = (playerId: string, correct: boolean) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, score: p.score + (correct ? question!.points : -question!.points), hasResponded: true } : p));
    if (correct) {
      setShowAnswer(true);
      setIsTimerRunning(false);
    }
  };

  const finishQuestion = () => {
    setUsedQuestions((prev) => {
      if (prev.includes(`${catIdx}-${qIdx}`)) return prev;
      return [...prev, `${catIdx}-${qIdx}`];
    });
    // Скидаємо статус гравців перед виходом
    setPlayers(players.map(p => ({ ...p, hasResponded: false })));
    navigate('/game');
  };

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen space-y-8">
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => navigate('/game/final')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
        >
          Завершити гру
        </button>
      </div>
      <Card className="w-full max-w-2xl p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">{cat?.title} — {question?.points} балів</h2>
        <p className="text-2xl font-semibold">{isTimerRunning ? `${timeLeft}с` : 'Час зупинено'}</p>
        <p className="text-2xl">{question?.question}</p>

        {showAnswer ? (
          <div className="space-y-6">
            <p className="text-xl text-primary font-semibold">Відповідь: {question?.answer}</p>
            <Button onClick={finishQuestion}>Далі</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-4 p-2 border rounded-lg bg-secondary/30">
                <span className="font-bold">{p.name}</span>
                <div className="flex gap-2">
                  <Button 
                    disabled={p.hasResponded} 
                    onClick={() => handlePlayerAnswer(p.id, true)}
                  >Правильно</Button>
                  <Button 
                    disabled={p.hasResponded} 
                    variant="destructive" 
                    onClick={() => handlePlayerAnswer(p.id, false)}
                  >Помилка</Button>
                </div>
              </div>
            ))}
            <Button className="mt-4" onClick={() => setShowAnswer(true)}>Відкрити відповідь</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
