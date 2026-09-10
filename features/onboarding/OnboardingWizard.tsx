"use client";
import { useState } from "react";
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/lib/constants/categories";
import { saveProfile } from "@/lib/services/profile.service";
import { saveBudget } from "@/lib/services/budget.service";
import { formatRupiah, parseRupiah } from "@/lib/utils/format";
import { Profile, Budget } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createNotification } from "@/lib/notifications/notifications.service";

const budgetableCategories = EXPENSE_CATEGORIES.filter((c) => c.id !== "lain");

// Saldo token AI gratis yang diberikan ke user baru saat pertama kali onboarding.
// Ubah angka ini kalau kebijakan token gratis Anda berbeda.
const DEFAULT_FREE_TOKEN_BALANCE = 5000;

export default function OnboardingWizard({ onFinish }: { onFinish: () => void }) {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [incomeText, setIncomeText] = useState("");
  const [incomeType, setIncomeType] = useState("Gaji tetap");
  const [dependents, setDependents] = useState("Hanya saya sendiri");

  const [budgetValues, setBudgetValues] = useState<Record<string, string>>({});

  const [savingText, setSavingText] = useState("");
  const [emergencyStatus, setEmergencyStatus] = useState<"no" | "partial" | "yes">("no");
  const [emergencyAmountText, setEmergencyAmountText] = useState("");

  function handleRupiahChange(setter: (v: string) => void, raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setter(digits ? formatRupiah(parseInt(digits)) : "");
  }

  function goNext() {
    if (step === 0) {
      if (!name.trim()) return alert(t("onb_name_alert"));
      if (!email.trim() || !email.includes("@")) return alert(t("onb_email_alert"));
    }
    if (step === 1) {
      if (!parseRupiah(incomeText)) return alert(t("onb_income_alert"));
    }
    setStep((s) => s + 1);
  }

  function goPrev() {
    setStep((s) => s - 1);
  }

  async function handleFinish() {
    const income = parseRupiah(incomeText) || 0;
    const savingTarget = parseRupiah(savingText) || 0;
    const emergencyFundCurrent =
      emergencyStatus === "partial"
        ? parseRupiah(emergencyAmountText) || 0
        : emergencyStatus === "yes"
        ? income * 6 * 0.6
        : 0;

    const profile: Profile = {
      name: name.trim(),
      email: email.trim(),
      income,
      incomeType,
      dependents,
      savingTarget,
      savingsInitial: 0,
      emergencyFundCurrent,
      emergencyFundTarget: income * 6,
      onboarded: true,
      aiTokenBalance: DEFAULT_FREE_TOKEN_BALANCE,
      lastHealthScoreCheckedMonth: "",
      lastHealthScoreValue: 0,
      healthScoreNotifPref: "monthly",
    };

    const budget: Budget = {};
    budgetableCategories.forEach((c) => {
      budget[c.id] = parseRupiah(budgetValues[c.id] || "0");
    });
    budget["lain"] = 0;

    setSaving(true);
    await saveProfile(profile);
    await saveBudget(budget);
    await createNotification(
      "welcome",
      lang === "id" ? "Akun kamu berhasil dibuat! 🎉" : "Your account was created! 🎉",
      lang === "id"
        ? "Selamat datang di BijakDana. Yuk mulai catat transaksi pertamamu."
        : "Welcome to BijakDana. Start tracking your first transaction."
    );
    setSaving(false);
    onFinish();
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src="/logo-bijakdana.png" alt="BijakDana" style={{ width: 56, height: 56, margin: "0 auto" }} />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 20,
                background: i <= step ? "#1d9e75" : "#e5e7eb",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <div style={headStyle}>{t("onb_step0_title")}</div>
            <div style={subStyle}>{t("onb_step0_sub")}</div>
            <Field label={t("onb_name_label")}>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("onb_name_placeholder")} />
            </Field>
            <Field label={t("onb_email_label")}>
              <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("onb_email_placeholder")} />
            </Field>
            <button style={btnPrimary} onClick={goNext}>{t("onb_next")}</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={headStyle}>{t("onb_step1_title")}</div>
            <div style={subStyle}>{t("onb_step1_sub")}</div>
            <Field label={t("onb_income_label")}>
              <input
                style={inputStyle}
                value={incomeText}
                onChange={(e) => handleRupiahChange(setIncomeText, e.target.value)}
                placeholder="Rp 5.000.000"
              />
            </Field>
            <Field label={t("onb_income_source_label")}>
              <select style={inputStyle} value={incomeType} onChange={(e) => setIncomeType(e.target.value)}>
                <option value="Gaji tetap">{t("incomemodal_source_fixed")}</option>
                <option value="Freelance">{t("incomemodal_source_freelance")}</option>
                <option value="Bisnis sendiri">{t("incomemodal_source_business")}</option>
                <option value="Campuran">{t("incomemodal_source_mixed")}</option>
              </select>
            </Field>
            <Field label={t("onb_dependents_label")}>
              <select style={inputStyle} value={dependents} onChange={(e) => setDependents(e.target.value)}>
                <option value="Hanya saya sendiri">{t("onb_dependents_self")}</option>
                <option value="Pasangan">{t("onb_dependents_partner")}</option>
                <option value="Anak 1">{t("onb_dependents_child1")}</option>
                <option value="Anak 2+">{t("onb_dependents_child2")}</option>
                <option value="Orang tua">{t("onb_dependents_parents")}</option>
              </select>
            </Field>
            <button style={btnPrimary} onClick={goNext}>{t("onb_next")}</button>
            <button style={btnOutline} onClick={goPrev}>{t("onb_back")}</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={headStyle}>{t("onb_step2_title")}</div>
            <div style={subStyle}>{t("onb_step2_sub")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 320, overflowY: "auto" }}>
              {budgetableCategories.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9fafb", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#111827" }}>{getCategoryLabel(c, lang)}</span>
                  <input
                    style={{ ...inputStyle, width: 110, textAlign: "right", padding: "7px 10px" }}
                    value={budgetValues[c.id] || ""}
                    onChange={(e) =>
                      setBudgetValues((prev) => ({
                        ...prev,
                        [c.id]: e.target.value.replace(/[^0-9]/g, "")
                          ? formatRupiah(parseInt(e.target.value.replace(/[^0-9]/g, "")))
                          : "",
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <button style={btnPrimary} onClick={goNext}>{t("onb_next")}</button>
            <button style={btnOutline} onClick={goPrev}>{t("onb_back")}</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={headStyle}>{t("onb_step3_title")}</div>
            <div style={subStyle}>{t("onb_step3_sub")}</div>
            <Field label={t("onb_saving_target_label")}>
              <input
                style={inputStyle}
                value={savingText}
                onChange={(e) => handleRupiahChange(setSavingText, e.target.value)}
                placeholder="Rp 500.000"
              />
            </Field>
            <Field label={t("onb_ef_status_label")}>
              <select
                style={inputStyle}
                value={emergencyStatus}
                onChange={(e) => setEmergencyStatus(e.target.value as "no" | "partial" | "yes")}
              >
                <option value="no">{t("onb_ef_status_no")}</option>
                <option value="partial">{t("onb_ef_status_partial")}</option>
                <option value="yes">{t("onb_ef_status_yes")}</option>
              </select>
            </Field>
            {emergencyStatus === "partial" && (
              <Field label={t("onb_ef_amount_label")}>
                <input
                  style={inputStyle}
                  value={emergencyAmountText}
                  onChange={(e) => handleRupiahChange(setEmergencyAmountText, e.target.value)}
                  placeholder="Rp 0"
                />
              </Field>
            )}
            <button style={btnPrimary} onClick={handleFinish} disabled={saving}>
              {saving ? t("btn_saving") : t("onb_finish_btn")}
            </button>
            <button style={btnOutline} onClick={goPrev} disabled={saving}>{t("onb_back")}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block", color: "#111827" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#f3f4f6",
  zIndex: 500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Inter', sans-serif",
};

const boxStyle: React.CSSProperties = {
  background: "white",
  color: "#111827",
  borderRadius: 16,
  padding: 32,
  width: "100%",
  maxWidth: 520,
  margin: 24,
  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
};

const headStyle: React.CSSProperties = { fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#111827" };
const subStyle: React.CSSProperties = { fontSize: 14, color: "#6b7280", marginBottom: 24 };

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  background: "#1d9e75",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: 13,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 8,
  fontFamily: "inherit",
};

const btnOutline: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  color: "#6b7280",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  padding: 11,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 8,
  fontFamily: "inherit",
};