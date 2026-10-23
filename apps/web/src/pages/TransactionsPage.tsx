import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDate, formatIDR } from "../lib/format";
import type {
  Category,
  PaginatedResponse,
  Transaction,
  Wallet,
} from "../types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<Transaction["type"]>("expense");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const loadData = useCallback(async () => {
    try {
      const [transactionResponse, walletResponse, categoryResponse] =
        await Promise.all([
          api.get<PaginatedResponse<Transaction>>("/transactions"),
          api.get<{ data: Wallet[] }>("/wallets"),
          api.get<{ data: Category[] }>("/categories"),
        ]);

      setTransactions(transactionResponse.data.data);
      setWallets(walletResponse.data.data);
      setCategories(categoryResponse.data.data);
    } catch {
      setError("Gagal memuat data transaksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await api.post<{ data: Transaction }>("/transactions", {
        type,
        amount: Number(amount),
        wallet_id: Number(walletId),
        category_id: categoryId ? Number(categoryId) : null,
        note: note || null,
        occurred_at: occurredAt,
      });

      setTransactions((current) => [response.data.data, ...current]);

      setAmount("");
      setNote("");
      setCategoryId("");
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors;
      const firstError = validationErrors
        ? Object.values(validationErrors)[0][0]
        : null;

      setError(firstError ?? "Gagal menyimpan transaksi.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">Transaksi</h1>

        {error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Pemasukan</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              {formatIDR(totalIncome)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Pengeluaran</p>
            <p className="mt-1 text-xl font-bold text-red-400">
              {formatIDR(totalExpense)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Selisih</p>
            <p className="mt-1 text-xl font-bold">
              {formatIDR(totalIncome - totalExpense)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Tambah Transaksi</h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Jenis</label>
                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as Transaction["type"])
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Nominal</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Wallet</label>
                <select
                  required
                  value={walletId}
                  onChange={(event) => setWalletId(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="">Pilih wallet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="">Tanpa kategori</option>
                  {categories
                    .filter((category) => category.type === type)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Tanggal</label>
                <input
                  type="date"
                  required
                  value={occurredAt}
                  onChange={(event) => setOccurredAt(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Catatan</label>
                <input
                  placeholder="Misal: makan siang"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Riwayat</h2>

          {loading ? (
            <p className="text-slate-400">Memuat transaksi...</p>
          ) : transactions.length === 0 ? (
            <p className="rounded-xl bg-slate-900 p-6 text-slate-400">
              Belum ada transaksi. Catat yang pertama, biar saldo-mu nggak jadi
              misteri 😭
            </p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl bg-slate-900 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {transaction.category?.name ?? "Tanpa kategori"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {transaction.wallet?.name} •{" "}
                      {formatDate(transaction.occurred_at)}
                    </p>
                    {transaction.note && (
                      <p className="text-sm text-slate-500">
                        {transaction.note}
                      </p>
                    )}
                  </div>

                  <p
                    className={
                      transaction.type === "income"
                        ? "font-bold text-emerald-400"
                        : "font-bold text-red-400"
                    }
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatIDR(Number(transaction.amount))}
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
