import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '@/api/quiz.api';
import { activeQuizAtom, resetGameAtom, playersAtom } from '@/atoms/game.atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function GameSetupPage() {
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizApi.getAll,
  });

  const setActiveQuiz = useSetAtom(activeQuizAtom);
  const setPlayers = useSetAtom(playersAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const navigate = useNavigate();

  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);

  const handleStart = () => {
    if (!selectedQuiz) return;
    setActiveQuiz(selectedQuiz);
    resetGame();
    const players = playerNames.filter(n => n.trim() !== '').map((name, i) => ({ id: `${i}`, name, score: 0 }));
    setPlayers(players);
    console.log('Setup: Players set, navigating now...');
    setSelectedQuiz(null);
    navigate('/game', { state: { players, quiz: selectedQuiz } });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Оберіть квіз для гри</h1>
        <Button variant="outline" onClick={() => navigate('/')}>Dashboard</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes?.map((quiz) => (
          <Card key={quiz._id}>
            <CardHeader><CardTitle>{quiz.title}</CardTitle></CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setSelectedQuiz(quiz)}>Почати гру</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Введіть імена гравців</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {playerNames.map((name, i) => (
              <Input key={i} value={name} onChange={(e) => setPlayerNames(playerNames.map((n, j) => j === i ? e.target.value : n))} placeholder={`Гравець ${i + 1}`} />
            ))}
            <Button onClick={() => setPlayerNames([...playerNames, ''])}>Додати гравця</Button>
          </div>
          <DialogFooter>
            <Button onClick={handleStart}>Запустити гру</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
