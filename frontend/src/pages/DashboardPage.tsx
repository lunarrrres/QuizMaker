import { useNavigate, Link } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom } from "@/atoms/auth.atoms";
import { quizApi } from "@/api/quiz.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Play, Edit3, User } from "lucide-react";

export function DashboardPage() {
  const user = useAtomValue(userAtom);
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: quizApi.getAll,
  });

  const navigate = useNavigate();

  const getAvatarFallback = (name?: string) =>
    name ? name[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">
              QuizMaker
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Готові перевірити свої знання?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button size="lg" asChild className="gap-2 text-lg">
              <Link to="/quizzes/new/edit">
                <PlusCircle size={22} /> Створити новий квіз
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="rounded-full h-12 w-12 p-0 bg-secondary"
            >
              <Link to="/profile">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : user?.name ? (
                  <span className="text-lg font-bold">
                    {getAvatarFallback(user.name)}
                  </span>
                ) : (
                  <User />
                )}
              </Link>
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            Завантаження вашої бібліотеки...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes?.map((quiz) => (
              <Card
                key={quiz._id}
                className="group overflow-hidden border-border/50 bg-card/50 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-6">
                  <CardTitle className="text-2xl mb-4 truncate">
                    {quiz.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-6">
                    {quiz.categories.length} категорій
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1 gap-2"
                      asChild
                    >
                      <Link to={`/quizzes/${quiz._id}/edit`}>
                        <Edit3 size={18} /> Редагувати
                      </Link>
                    </Button>
                    <Button
                      className="flex-1 gap-2 shadow-lg"
                      onClick={() => navigate("/game/setup")}
                    >
                      <Play size={18} /> Грати
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {quizzes?.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-xl text-muted-foreground">
                  Квізів поки немає. Давайте створимо перший!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
