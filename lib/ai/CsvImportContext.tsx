"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface CsvImportContextValue {
  open: boolean;
  openImport: () => void;
  closeImport: () => void;
}

const CsvImportContext = createContext<CsvImportContextValue | null>(null);

export function CsvImportProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CsvImportContext.Provider value={{ open, openImport: () => setOpen(true), closeImport: () => setOpen(false) }}>
      {children}
    </CsvImportContext.Provider>
  );
}

export function useCsvImport() {
  const ctx = useContext(CsvImportContext);
  if (!ctx) throw new Error("useCsvImport must be used within CsvImportProvider");
  return ctx;
}