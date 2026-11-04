import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TicCase, ScheduleEvent, DashboardMetrics } from '../types/cdss';
import { INITIAL_CASES, INITIAL_SCHEDULES } from '../data/mockCases';

interface CaseContextType {
  cases: TicCase[];
  schedules: ScheduleEvent[];
  getCase: (id: string) => TicCase | undefined;
  updateCase: (id: string, updates: Partial<TicCase>) => void;
  addCase: (newCase: TicCase) => void;
  deleteCase: (id: string) => void;
  addSchedule: (event: ScheduleEvent) => void;
  updateSchedule: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteSchedule: (id: string) => void;
  getDashboardMetrics: () => DashboardMetrics;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<TicCase[]>(() => {
    const saved = localStorage.getItem('TIC_ASSIST_CASES_V2');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('TIC_ASSIST_SCHEDULES_V1');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const saveCases = (newCases: TicCase[]) => {
    localStorage.setItem('TIC_ASSIST_CASES_V2', JSON.stringify(newCases));
    setCases(newCases);
  };

  const saveSchedules = (newSchedules: ScheduleEvent[]) => {
    localStorage.setItem('TIC_ASSIST_SCHEDULES_V1', JSON.stringify(newSchedules));
    setSchedules(newSchedules);
  };

  const getCase = (id: string) => cases.find((c) => c.id === id);

  const updateCase = (id: string, updates: Partial<TicCase>) => {
    const newCases = cases.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toLocaleString('ko-KR') } : c));
    saveCases(newCases);
  };

  const addCase = (newCase: TicCase) => {
    const updatedCases = [newCase, ...cases];
    saveCases(updatedCases);
  };

  const deleteCase = (id: string) => {
    const updatedCases = cases.filter(c => c.id !== id);
    saveCases(updatedCases);
  };

  const addSchedule = (event: ScheduleEvent) => {
    const updated = [...schedules, event];
    saveSchedules(updated);
  };

  const updateSchedule = (id: string, updates: Partial<ScheduleEvent>) => {
    const updated = schedules.map(s => s.id === id ? { ...s, ...updates } : s);
    saveSchedules(updated);
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    saveSchedules(updated);
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const completedCases = cases.filter(c => c.status === 'completed');
    const totalVideos = cases.length;
    const remainingVideos = cases.filter(c => c.status !== 'completed').length;
    const progress = totalVideos > 0 ? Math.round((completedCases.length / totalVideos) * 100) : 0;

    return {
      totalReviewProgress: progress,
      completedCasesCount: completedCases.length,
      remainingVideoCount: remainingVideos,
      totalVideoCount: totalVideos,
      thisWeekPatients: cases.length, // 단순화
    };
  };

  return (
    <CaseContext.Provider value={{
      cases,
      schedules,
      getCase,
      updateCase,
      addCase,
      deleteCase,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      getDashboardMetrics
    }}>
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
