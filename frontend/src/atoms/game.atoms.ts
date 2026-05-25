import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { Quiz } from '../types/quiz.types';

const storage = createJSONStorage<any>(() => sessionStorage);

export interface Player {
  id: string;
  name: string;
  score: number;
  hasResponded?: boolean;
}

export const activeQuizAtom = atomWithStorage<Quiz | null>('activeQuiz', null, storage);
export const playersAtom = atomWithStorage<Player[]>('players', [], storage);

export const usedQuestionsAtom = atomWithStorage<string[]>('usedQuestions', [], storage);

export const resetGameAtom = atom(
  null,
  (_get, set) => {
    set(playersAtom, []);
    set(activeQuizAtom, null);
    set(usedQuestionsAtom, []);
  }
);
