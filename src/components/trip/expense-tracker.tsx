"use client";

import { useState, useEffect } from "react";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "food" | "transport" | "stay" | "activity" | "shopping" | "other";
  date: string;
}

const categoryConfig = {
  food: { emoji: "🍽️", color: "text-amber-400", bg: "bg-amber-500/10" },
  transport: { emoji: "🚗", color: "text-blue-400", bg: "bg-blue-500/10" },
  stay: { emoji: "🏨", color: "text-teal-400", bg: "bg-teal-500/10" },
  activity: { emoji: "🎯", color: "text-green-400", bg: "bg-green-500/10" },
  shopping: { emoji: "🛍️", color: "text-pink-400", bg: "bg-pink-500/10" },
  other: { emoji: "📌", color: "text-zinc-400", bg: "bg-zinc-500/10" },
};

interface ExpenseTrackerProps {
  budget: number;
  destinationId?: string;
}

export function ExpenseTracker({ budget, destinationId }: ExpenseTrackerProps) {
  const storageKey = `smartplan-expenses${destinationId ? `-${destinationId}` : ""}`;

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(expenses));
  }, [expenses, storageKey]);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "food" as Expense["category"],
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const spentPercentage = Math.min((totalSpent / budget) * 100, 100);

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleAdd = () => {
    if (!newExpense.title || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now().toString(),
      title: newExpense.title,
      amount: parseInt(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString().split("T")[0],
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ title: "", amount: "", category: "food" });
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          💰 Expense Tracker
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-600/20 transition-all"
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {/* Budget Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">
            Spent: <span className="font-semibold text-white">₹{totalSpent.toLocaleString("en-IN")}</span>
          </span>
          <span className={remaining >= 0 ? "text-green-400" : "text-red-400"}>
            {remaining >= 0 ? "Remaining" : "Over budget"}: ₹{Math.abs(remaining).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercentage > 90
                ? "bg-gradient-to-r from-red-500 to-red-400"
                : spentPercentage > 70
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-green-500 to-teal-400"
            }`}
            style={{ width: `${spentPercentage}%` }}
          />
        </div>
        <div className="text-right text-xs text-zinc-500 mt-1">
          {spentPercentage.toFixed(0)}% of ₹{budget.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {Object.entries(categoryTotals).map(([cat, total]) => {
            const config = categoryConfig[cat as keyof typeof categoryConfig];
            return (
              <div
                key={cat}
                className={`p-2.5 rounded-lg ${config.bg} text-center`}
              >
                <div className="text-lg">{config.emoji}</div>
                <div className={`text-xs font-semibold ${config.color}`}>
                  ₹{total.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-zinc-500 capitalize">{cat}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 mb-4 space-y-3">
          <input
            type="text"
            placeholder="What did you spend on?"
            value={newExpense.title}
            onChange={(e) =>
              setNewExpense({ ...newExpense, title: e.target.value })
            }
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
            <select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  category: e.target.value as Expense["category"],
                })
              }
              className="px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(categoryConfig).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.emoji} {key}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newExpense.title || !newExpense.amount}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            Add Expense
          </button>
        </div>
      )}

      {/* Expense List */}
      {expenses.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {expenses.map((expense) => {
            const config = categoryConfig[expense.category];
            return (
              <div
                key={expense.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors group"
              >
                <span className="text-lg">{config.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {expense.title}
                  </div>
                  <div className="text-xs text-zinc-500">{expense.date}</div>
                </div>
                <span className={`text-sm font-semibold ${config.color}`}>
                  ₹{expense.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => handleRemove(expense.id)}
                  className="w-6 h-6 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-600 text-sm">
          No expenses yet. Start tracking!
        </div>
      )}
    </div>
  );
}
