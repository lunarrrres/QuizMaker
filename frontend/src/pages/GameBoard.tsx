import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { activeQuizAtom, usedQuestionsAtom, playersAtom } from '@/atoms/game.atoms';
import { Card, CardContent } from '@/components/ui/card';
import { Scoreboard } from '@/components/Scoreboard';
import { useNavigate, useLocation } from 'react-router-dom';

export function GameBoard() {
  const [quiz, setQuiz] = useAtom(activeQuizAtom);
  const [usedQuestions] = useAtom(usedQuestionsAtom);
  const [players, setPlayers] = useAtom(playersAtom);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.players && players.length === 0) {
      setPlayers(location.state.players);
    }
    if (location.state?.quiz && !quiz) {
      setQuiz(location.state.quiz);
    }
  }, [location.state, players, setPlayers, quiz, setQuiz]);

  useEffect(() => {
    console.log('GameBoard: check state. Quiz:', quiz, 'Players:', players, 'State:', location.state);
    
    if (!quiz && !location.state?.quiz) {
      console.log('GameBoard: No quiz found, redirecting');
      navigate('/game/setup');
      return;
    }

    if (quiz) {
      const totalQuestions = quiz.categories.reduce((acc, cat) => acc + cat.questions.length, 0);
      if (usedQuestions.length === totalQuestions && totalQuestions > 0) {
        navigate('/game/final');
      }
    }
  }, [usedQuestions, quiz, navigate, players, location.state]);

  if (!quiz) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary drop-shadow-md">{quiz.title}</h1>
        <button 
          onClick={() => navigate('/game/final')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
        >
          Завершити гру
        </button>
      </header>
      <Scoreboard />
      
      <div className="grid gap-6 w-full max-w-6xl mx-auto" style={{ gridTemplateColumns: `repeat(${quiz.categories.length}, minmax(150px, 1fr))` }}>
        {quiz.categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-6">
            <div className="bg-secondary/50 border border-border p-4 rounded-xl shadow-inner font-bold text-lg text-center h-20 flex items-center justify-center">
              {cat.title}
            </div>
            {cat.questions.map((q, qIdx) => {
              const key = `${catIdx}-${qIdx}`;
              const isUsed = usedQuestions.includes(key);
              return (
                <div 
                  key={qIdx} 
                  className={`h-24 md:h-28 flip-card ${isUsed ? 'opacity-20 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (!isUsed) navigate(`/game/question/${catIdx}/${qIdx}`);
                  }}
                >
                  <div className="flip-card-inner relative w-full h-full">
                    <Card className="flip-card-front absolute inset-0 border-primary bg-card/80">
                      <CardContent className="p-0 font-black text-3xl text-primary flex items-center justify-center h-full">{q.points}</CardContent>
                    </Card>
                    <Card className="flip-card-back absolute inset-0 bg-primary text-primary-foreground">
                      <CardContent className="p-0 font-bold text-lg flex items-center justify-center h-full">?</CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
