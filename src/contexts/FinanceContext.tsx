import { createContext, useContext, ReactNode } from "react";
import { useFinanceData, FinanceData } from "@/hooks/useFinanceData";

const FinanceContext = createContext<FinanceData | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const financeData = useFinanceData();
  
  return (
    <FinanceContext.Provider value={financeData}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
