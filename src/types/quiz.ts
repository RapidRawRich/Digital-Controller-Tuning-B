export interface QuizQuestion {
  id: number;
  ilmNumber: number;
  title: string;
  figureLabel?: string;
  figureType?: 'fig40' | 'fig41' | 'fig42' | 'fig43' | 'fig44';
  type: 'multiple-choice' | 'multi-input';
  prompt: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  subQuestions?: Array<{
    id: string;
    label: string;
    expected: string | number;
    tolerance?: number;
    unit?: string;
    placeholder?: string;
    options?: string[]; // for dropdowns within subquestions
  }>;
  explanation: string;
  ilmReference: string;
}
