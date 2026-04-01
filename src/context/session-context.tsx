"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Difficulty, Role, SessionResult, Sport } from "@/lib/types";

type SelectionState = {
  sport: Sport;
  role: Role;
  difficulty: Difficulty;
  scenarioId: string;
};

type SessionContextValue = {
  selection: SelectionState;
  result?: SessionResult;
  setSelection: (next: Partial<SelectionState>) => void;
  setResult: (result: SessionResult) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelectionState] = useState<SelectionState>({
    sport: "football/soccer",
    role: "midfielder",
    difficulty: "medium",
    scenarioId: "mf-press-01"
  });
  const [result, setResult] = useState<SessionResult>();

  const value = useMemo(
    () => ({
      selection,
      result,
      setSelection: (next: Partial<SelectionState>) => setSelectionState((prev) => ({ ...prev, ...next })),
      setResult
    }),
    [selection, result]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
