export type TxType = "income" | "expense";
export type Transaction = {
  id: string;
  type: TxType;
  cat: string;
  amount: number;
  desc: string;
  method: string;
  date: string;
  time: string;
  note: string;
  createdAt: string;
  goalId?: string | null;
};
export type Budget = Record<string, number>;
export type Profile = {
  name: string;
  email: string;
  income: number;
  incomeType: string;
  dependents: string;
  savingTarget: number;
  savingsInitial: number;
  emergencyFundCurrent: number;
  emergencyFundTarget: number;
  onboarded: boolean;
  aiTokenBalance: number;
  lastHealthScoreCheckedMonth: string;
  lastHealthScoreValue: number;
  healthScoreNotifPref: "monthly" | "on_drop" | "off";
};
export type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
};
export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  targetMonths: number;
  createdAt: string;
};