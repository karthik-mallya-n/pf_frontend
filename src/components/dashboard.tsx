"use client";
import React, { useEffect, useState, useCallback } from "react";
import FinancialCharts from "./FinancialCharts";

interface Transaction {
  t_id: number;
  type: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "income",
    amount: "",
    category: "",
    note: "",
    date: "",
  });

  const getAuthHeader = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions`, {
        method: "GET",
        headers: getAuthHeader(),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/add`, {
        method: "POST",
        headers: getAuthHeader(),
        credentials: "include",
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add transaction");
      }
      
      await res.json(); // Consume the response
      setShowForm(false);
      setForm({ type: "income", amount: "", category: "", note: "", date: "" });
      fetchTransactions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Financial Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500">Total Income</div>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500">Total Expense</div>
            <div className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500">Balance</div>
            <div className="text-2xl font-bold text-blue-600">${balance.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Transactions</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add Transaction"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleAddTransaction} className="bg-white p-6 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Note</label>
              <input
                type="text"
                name="note"
                value={form.note}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Add
              </button>
            </div>
          </form>
        )}
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto mb-10">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Type</th>
                    <th className="py-2 px-4 border-b">Category</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.t_id}>
                        <td className="py-2 px-4 border-b">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4 border-b capitalize">{t.type}</td>
                        <td className="py-2 px-4 border-b">{t.category}</td>
                        <td className={`py-2 px-4 border-b font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>{t.amount.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b">{t.note || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {transactions.length > 0 && (
              <FinancialCharts transactions={transactions} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
