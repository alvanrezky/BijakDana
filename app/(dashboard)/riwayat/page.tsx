"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import RiwayatStatsRow from "@/features/riwayat/RiwayatStatsRow";
import RiwayatToolbar from "@/features/riwayat/RiwayatToolbar";
import RiwayatList from "@/features/riwayat/RiwayatList";
import TransactionModal from "@/components/modal/TransactionModal";
import { getTransactions, deleteTransaction } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { calcStats } from "@/lib/business/stats";
import { monthKey, monthLabel, formatDate, formatRupiah } from "@/lib/utils/format";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction, Budget } from "@/types/models";

function dayNameOf(date: string) {
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  return days[new Date(date).getDay()];
}

export default function RiwayatPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadAll() {
    const [tx, bud] = await Promise.all([getTransactions(), getBudget()]);
    setTransactions(tx);
    setBudget(bud);
  }

  useEffect(() => {
    (async () => {
      await loadAll();
      setMounted(true);
    })();
  }, []);

  if (!mounted) {
    return (
      <>
        <Topbar titleKey="nav_riwayat" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  const stats = calcStats(transactions, "bulan");

  const availableMonths = Array.from(new Set(transactions.map((t) => monthKey(t.date))))
    .sort()
    .reverse()
    .map((key) => ({ key, label: monthLabel(key) }));

  const filtered = transactions
    .filter((t) => {
      const q = search.toLowerCase().trim();
      const cat = findCategory(t.cat, t.type);
      const catLabelId = cat.label.toLowerCase();
      const catLabelEn = getCategoryLabel(cat, "en").toLowerCase();
      const dateFormatted = formatDate(t.date).toLowerCase();
      const dayName = dayNameOf(t.date);

      const matchesSearch =
        !q ||
        (t.desc || "").toLowerCase().includes(q) ||
        catLabelId.includes(q) ||
        catLabelEn.includes(q) ||
        dateFormatted.includes(q) ||
        dayName.includes(q);

      const matchesType = !typeFilter || t.type === typeFilter;
      const matchesMonth = !monthFilter || monthKey(t.date) === monthFilter;
      return matchesSearch && matchesType && matchesMonth;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setModalOpen(true);
  }

  async function handleDelete(tx: Transaction) {
  const message = t("riwayat_confirm_delete")
    .replace("{desc}", tx.desc || findCategory(tx.cat, tx.type).label)
    .replace("{amount}", formatRupiah(tx.amount));
  if (!confirm(message)) return;
  await deleteTransaction(tx.id);
  await loadAll();
}

  return (
    <>
      <Topbar titleKey="nav_riwayat" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{t("riwayat_page_title")}</div>

        <RiwayatStatsRow income={income} expense={expense} net={income - expense} count={filtered.length} />

        <RiwayatToolbar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          monthFilter={monthFilter}
          onMonthFilterChange={setMonthFilter}
          availableMonths={availableMonths}
        />

        <RiwayatList
          transactions={filtered}
          budget={budget}
          byCategory={stats.byCategory}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadAll}
        editTx={editTx}
      />
    </>
  );
}