export type Settings = {
  fund_name: string;
  manager_share_pct: number;
};

export type Member = {
  id: string;
  name: string;
  email: string | null;
  is_manager: boolean;
  joined_date: string; // YYYY-MM-DD
  active: boolean;
  created_at: string;
};

export type InvestmentSource = "manual" | "reinvestment";

export type InvestmentEvent = {
  id: string;
  member_id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  source: InvestmentSource;
  monthly_result_id: string | null;
  note: string | null;
  created_at: string;
};

export type MonthlyResult = {
  id: string;
  date: string; // YYYY-MM-01
  total_benefice: number;
  summary: string | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
};

export type SessionRole = "viewer" | "admin";

export type Session = {
  memberId: string;
  email: string;
  name: string;
  role: SessionRole;
};
