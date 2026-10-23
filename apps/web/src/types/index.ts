export type Wallet = {
  id: number;
  name: string;
  type: "cash" | "bank" | "e_wallet" | "other";
  initial_balance: number;
  color: string;
  created_at?: string;
};

export type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  is_default: boolean;
};

export type Transaction = {
  id: number;
  type: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  occurred_at: string;
  wallet?: Wallet;
  category?: Category | null;
  transfer_wallet?: Wallet | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
