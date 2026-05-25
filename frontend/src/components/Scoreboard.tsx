import { useAtomValue } from 'jotai';
import { playersAtom } from '@/atoms/game.atoms';
import { Card, CardContent } from '@/components/ui/card';

export function Scoreboard() {
  const players = useAtomValue(playersAtom);

  return (
    <Card className="w-full max-w-lg mx-auto mb-6">
      <CardContent className="flex flex-wrap items-center justify-center gap-4 p-4">
        {players.map(p => (
          <span key={p.id} className="text-lg font-bold">{p.name}: {p.score}</span>
        ))}
      </CardContent>
    </Card>
  );
}
