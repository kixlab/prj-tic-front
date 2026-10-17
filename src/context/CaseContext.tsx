import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TicCase } from '../types/cdss';
import { INITIAL_CASES } from '../data/mockCases';

interface CaseContextType {
  cases: TicCase[];
  getCase: (id: string) => TicCase | undefined;
  updateCase: (id: string, updates: Partial<TicCase>) => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<TicCase[]>(() => {
    const saved = localStorage.getItem('TIC_ASSIST_CASES_V1');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const saveToStorage = (newCases: TicCase[]) => {
    localStorage.setItem('TIC_ASSIST_CASES_V1', JSON.stringify(newCases));
    setCases(newCases);
  };

  const getCase = (id: string) => cases.find((c) => c.id === id);

  const updateCase = (id: string, updates: Partial<TicCase>) => {
    const newCases = cases.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveToStorage(newCases);
  };

  return (
    <CaseContext.Provider value={{ cases, getCase, updateCase }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};
