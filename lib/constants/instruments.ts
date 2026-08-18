import { DictKey } from "@/lib/i18n/dictionary";

export type InstrumentId = "tabungan" | "deposito" | "reksadana" | "emas" | "saham" | "etf";

export interface Instrument {
  id: InstrumentId;
  labelKey: DictKey;
  descKey: DictKey;
  riskKey: DictKey;
  color: string;
  annualReturn: number;
  annualFeePct?: number;
  monthlyFeeFlat?: number;
  taxOnGainPct?: number;
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: "tabungan",
    labelKey: "instrument_tabungan_label",
    descKey: "instrument_tabungan_desc",
    riskKey: "risk_very_low",
    color: "#6B7280",
    annualReturn: 0.01,
    monthlyFeeFlat: 15000,
  },
  {
    id: "deposito",
    labelKey: "instrument_deposito_label",
    descKey: "instrument_deposito_desc",
    riskKey: "risk_low",
    color: "#3B82F6",
    annualReturn: 0.04,
    taxOnGainPct: 0.2,
  },
  {
    id: "reksadana",
    labelKey: "instrument_reksadana_label",
    descKey: "instrument_reksadana_desc",
    riskKey: "risk_low_medium",
    color: "#1D9E75",
    annualReturn: 0.06,
  },
  {
    id: "emas",
    labelKey: "instrument_emas_label",
    descKey: "instrument_emas_desc",
    riskKey: "risk_medium",
    color: "#F59E0B",
    annualReturn: 0.09,
  },
  {
    id: "saham",
    labelKey: "instrument_saham_label",
    descKey: "instrument_saham_desc",
    riskKey: "risk_high",
    color: "#EF4444",
    annualReturn: 0.1,
    annualFeePct: 0.003,
  },
  {
    id: "etf",
    labelKey: "instrument_etf_label",
    descKey: "instrument_etf_desc",
    riskKey: "risk_medium_high",
    color: "#8B5CF6",
    annualReturn: 0.09,
    annualFeePct: 0.005,
  },
];