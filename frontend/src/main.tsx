import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { QuizEditPage } from './pages/QuizEditPage';
import { GameSetupPage } from './pages/GameSetupPage';
import { GameBoard } from './pages/GameBoard';
import { QuestionScreen } from './pages/QuestionScreen';
import { FinalScreen } from './pages/FinalScreen';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/quizzes/:id/edit" element={<QuizEditPage />} />
            <Route path="/game/setup" element={<GameSetupPage />} />
            <Route path="/game" element={<GameBoard />} />
            <Route path="/game/question/:catIdx/:qIdx" element={<QuestionScreen />} />
            <Route path="/game/final" element={<FinalScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>,
)
