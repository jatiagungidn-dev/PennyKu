import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/authContext";
import type { Wallet } from "../types";

export default function WalletsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState<Wallet["type"]>("cash");
  const [initialBalance, setInitialBalance] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    try {
      const response = await api.get<{ data: Wallet[] }>("/wallets");
      setWallets(response.data.data);
    } catch {
      setError("Gagal memuat wallet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallets();
  }, [loadWallets]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post<{ data: Wallet }>("/wallets", {
        name,
        type,
        initial_balance: Number(initialBalance),
      });

      setWallets((current) => [...current, response.data.data]);
      setName("");
      setInitialBalance("0");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menambahkan wallet.");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">PennyKu</h1>
            <p className="text-sm text-slate-400">
              Hai, {user?.name ?? "bestie"} 👋
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Tambah Wallet</h2>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 sm:grid-cols-4"
          >
            <input
              placeholder="Nama wallet"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:col-span-2"
            />

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as Wallet["type"])
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="other">Lainnya</option>
            </select>

            <input
              type="number"
              min="0"
              value={initialBalance}
              onChange={(event) => setInitialBalance(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 sm:col-span-4"
            >
              Simpan Wallet
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wallet Kamu</h2>

          {loading ? (
            <p className="text-slate-400">Memuat wallet...</p>
          ) : wallets.length === 0 ? (
            <p className="rounded-xl bg-slate-900 p-6 text-slate-400">
              Belum ada wallet. Tambahkan Cash, Bank, atau e-wallet dulu ✨
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {wallets.map((wallet) => (
                <li key={wallet.id} className="rounded-xl bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{wallet.name}</p>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase">
                      {wallet.type}
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    Rp{Number(wallet.initial_balance).toLocaleString("id-ID")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
