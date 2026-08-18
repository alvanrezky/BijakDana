"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import TabelStatsRow from "@/features/tabel/TabelStatsRow";
import TabelToolbar from "@/features/tabel/TabelToolbar";
import TabelTable from "@/features/tabel/TabelTable";
import TransactionModal from "@/components/modal/TransactionModal";
import { getTransactions, deleteTransaction } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { calcStats } from "@/lib/business/stats";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants/categories";
import { Transaction, Budget } from "@/types/models";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { monthKey, monthLabel, formatDate, formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";


export default function TabelPage() {
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
        <Topbar titleKey="nav_tabel" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  const stats = calcStats(transactions, "bulan");

  const usedCategoryIds = Array.from(new Set(transactions.map((t) => t.cat)));
  const availableCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].filter((c) =>
    usedCategoryIds.includes(c.id)
  );

  const availableMonths = Array.from(new Set(transactions.map((t) => monthKey(t.date))))
    .sort()
    .reverse()
    .map((key) => ({ key, label: monthLabel(key) }));

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const cat = findCategory(t.cat, t.type);
    const catLabelId = cat.label.toLowerCase();
    const catLabelEn = getCategoryLabel(cat, "en").toLowerCase();
    const matchesSearch =
      !q ||
      (t.desc || "").toLowerCase().includes(q) ||
      catLabelId.includes(q) ||
      catLabelEn.includes(q) ||
      formatDate(t.date).toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || t.cat === categoryFilter;
    const matchesMonth = !monthFilter || monthKey(t.date) === monthFilter;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setModalOpen(true);
  }

  async function handleDelete(tx: Transaction) {
  const message = t("tabel_confirm_delete")
    .replace("{desc}", tx.desc || findCategory(tx.cat, tx.type).label)
    .replace("{amount}", formatRupiah(tx.amount));
  if (!confirm(message)) return;
  await deleteTransaction(tx.id);
  await loadAll();
}

  function handleAddNew() {
    setEditTx(null);
    setModalOpen(true);
  }

  return (
    <>
      <Topbar titleKey="nav_tabel" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif", overflowX: "hidden", maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{t("tabel_page_title")}</span>
          <button
            onClick={handleAddNew}
            style={{
              background: "var(--green)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t("tabel_add_tx")}
          </button>
        </div>

        <TabelStatsRow stats={stats} filteredCount={filtered.length} />

        <TabelToolbar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          availableCategories={availableCategories}
          monthFilter={monthFilter}
          onMonthFilterChange={setMonthFilter}
          availableMonths={availableMonths}
        />

        <TabelTable
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