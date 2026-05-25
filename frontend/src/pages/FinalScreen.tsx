import { useAtomValue, useSetAtom } from 'jotai';
import { playersAtom, resetGameAtom } from '@/atoms/game.atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function FinalScreen() {
  const players = useAtomValue(playersAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const navigate = useNavigate();

  const winner = players.length > 0 ? [...players].sort((a, b) => b.score - a.score)[0] : null;

  const handleFinish = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen space-y-8 bg-background">
      <Card className="w-full max-w-lg p-10 text-center space-y-8 shadow-2xl border-primary/50">
        <h1 className="text-5xl font-extrabold text-primary">Гра закінчена!</h1>
        
        {winner && (
          <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
            <p className="text-xl text-primary font-bold mb-2">🏆 Переможець:</p>
            <p className="text-4xl font-black text-primary">{winner.name}</p>
            <p className="text-2xl mt-2 text-foreground">{winner.score} балів</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-lg font-semibold text-muted-foreground">Результати:</p>
          {players.sort((a, b) => b.score - a.score).map((p, i) => (
            <div key={p.id} className={`flex justify-between p-3 rounded-lg ${i === 0 ? 'bg-primary/20' : 'bg-secondary/30'}`}>
              <span className="font-bold">{p.name}</span>
              <span className="font-mono">{p.score}</span>
            </div>
          ))}
        </div>
        
        <Button onClick={handleFinish} className="w-full h-12 text-lg">Повернутися на головну</Button>
      </Card>
    </div>
  );
}
