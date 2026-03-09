import { DebtFinding } from './debt-scanner';

export interface DebtScoreInput extends DebtFinding {
  fileChangeFrequency: number;
  ageDays: number;
  complexityScore: number;
}

export interface EvaluatedDebt extends DebtFinding {
  riskScore: number;
  priority: 'low' | 'medium' | 'high';
}

const TYPE_WEIGHT: Record<DebtFinding['type'], number> = {
  TODO: 1,
  FIXME: 3,
  HACK: 2,
  XXX: 2,
  BUG: 4,
};

export class DebtEvaluatorService {
  evaluate(input: DebtScoreInput): EvaluatedDebt {
    const typeScore = TYPE_WEIGHT[input.type] * 10;
    const frequencyScore = Math.min(input.fileChangeFrequency * 2, 30);
    const ageScore = Math.min(Math.floor(input.ageDays / 7), 20);
    const complexityScore = Math.min(input.complexityScore, 20);

    const riskScore = typeScore + frequencyScore + ageScore + complexityScore;
    const priority = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';

    return {
      type: input.type,
      description: input.description,
      filePath: input.filePath,
      lineNumber: input.lineNumber,
      riskScore,
      priority,
    };
  }
}

export const debtEvaluatorService = new DebtEvaluatorService();
