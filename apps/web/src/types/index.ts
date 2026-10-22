export type Wallet = {
  id: number;
  name: string;
  type: "cash" | "bank" | "e_wallet" | "other";
  initial_balance: number;
  color: string;
  created_at?: string;
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
