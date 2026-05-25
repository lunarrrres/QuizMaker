import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/api/quiz.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import type { Quiz, Category } from '@/types/quiz.types';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function QuizEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isNew = id === 'new';
  
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getById(id!),
    enabled: !isNew,
  });

  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setCategories(quiz.categories);
    } else if (isNew) {
      setCategories([{ title: '', questions: Array(5).fill(0).map((_, i) => ({ question: '', answer: '', points: (i + 1) * 100 })) }]);
    }
  }, [quiz, isNew]);

  const mutation = useMutation({
    mutationFn: (data: Omit<Quiz, '_id' | 'owner' | 'createdAt' | 'updatedAt'>) => 
      isNew ? quizApi.create(data) : quizApi.update(id!, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Quiz saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate('/');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save quiz', variant: 'destructive' });
    },
  });

  if (!isNew && isLoading) return <p>Loading...</p>;

  const handleAddCategory = () => {
    setCategories([...categories, { title: '', questions: Array(5).fill(0).map((_, i) => ({ question: '', answer: '', points: (i + 1) * 100 })) }]);
  };

  const updateQuestion = (catIdx: number, qIdx: number, field: 'question' | 'answer' | 'points', value: string | number) => {
    setCategories(categories.map((cat, i) => i === catIdx ? {
      ...cat,
      questions: cat.questions.map((q, j) => j === qIdx ? { ...q, [field]: value } : q)
    } : cat));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isNew ? 'Створення нового квізу' : 'Редагування квізу'}</h1>
        <Button variant="outline" onClick={() => navigate('/')}>Dashboard</Button>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Назва квізу" className="text-xl font-bold" />
      
      {categories.map((cat, catIdx) => (
        <Card key={catIdx}>
          <CardHeader>
            <Input value={cat.title} onChange={(e) => setCategories(categories.map((c, i) => i === catIdx ? { ...c, title: e.target.value } : c))} placeholder="Назва категорії" />
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-2">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-2 p-2 border rounded">
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    value={q.points === 0 ? '' : q.points} 
                    onChange={(e) => updateQuestion(catIdx, qIdx, 'points', e.target.value === '' ? 0 : parseInt(e.target.value))} 
                    placeholder="Бали"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="flex flex-col">
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => updateQuestion(catIdx, qIdx, 'points', q.points + 100)}><ChevronUp size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => updateQuestion(catIdx, qIdx, 'points', Math.max(0, q.points - 100))}><ChevronDown size={16} /></Button>
                  </div>
                </div>
                <Input value={q.question} onChange={(e) => updateQuestion(catIdx, qIdx, 'question', e.target.value)} placeholder="Питання" />
                <Input value={q.answer} onChange={(e) => updateQuestion(catIdx, qIdx, 'answer', e.target.value)} placeholder="Відповідь" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      
      <div className="flex gap-4">
        <Button onClick={handleAddCategory}>Додати категорію</Button>
        <Button onClick={() => mutation.mutate({ title, categories })}>Зберегти квіз</Button>
      </div>
    </div>
  );
}
