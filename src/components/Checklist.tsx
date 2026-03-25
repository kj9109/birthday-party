"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, ClipboardList, Trash2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function Checklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await fetch("/api/checklist");
      if (res.ok) setItems(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newItem.trim() }),
      });
      if (res.ok) {
        setNewItem("");
        fetchChecklist();
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const toggleItem = async (id: string) => {
    try {
      const res = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchChecklist();
    } catch { /* ignore */ }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch("/api/checklist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchChecklist();
    } catch { /* ignore */ }
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <section id="checklist" className="py-24 px-6 bg-white">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">Party</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            Checklist
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          className="elegant-card p-8 relative corner-decoration"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-gold-400" />
              <span className="font-sans text-sm font-semibold text-neutral-700">
                {completedCount} of {items.length} complete
              </span>
            </div>
            <span className="font-sans text-sm text-gold-500 font-semibold">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-neutral-100 rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                  className="gold-checkbox"
                />
                <span
                  className={`flex-1 font-sans text-sm transition-all ${
                    item.completed
                      ? "line-through text-neutral-400"
                      : "text-neutral-700"
                  }`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Add item */}
          <form onSubmit={addItem} className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add a new item..."
              className="gold-input flex-1"
            />
            <button
              type="submit"
              disabled={loading || !newItem.trim()}
              className="gold-button px-4 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
