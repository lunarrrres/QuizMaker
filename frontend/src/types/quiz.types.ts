export interface Question {
  question: string;
  answer: string;
  points: number;
}

export interface Category {
  title: string;
  questions: Question[];
}

export interface Quiz {
  _id: string;
  title: string;
  owner: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}
