
export enum GoalType {
  SIMPLE = 'SIMPLE',
  NUMERIC = 'NUMERIC'
}

export enum Category {
  HEALTH = 'Saúde',
  FINANCE = 'Finanças',
  WORK = 'Trabalho',
  PERSONAL = 'Pessoal',
  LEARNING = 'Aprendizado'
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  category: Category;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface AIInsight {
  message: string;
  suggestion: string;
}
