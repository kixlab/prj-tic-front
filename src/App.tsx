import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/common/Footer';
import DashboardView from './pages/DashboardPage';
import CaseListView from './pages/CaseListPage';
import Phase1InitialPage from './pages/Phase1InitialPage';
import Phase2ReviewPage from './pages/Phase2ReviewPage';
import Phase3FinalPage from './pages/Phase3FinalPage';
import VideoComparePage from './pages/VideoComparePage';

// Placeholder for Settings
const SettingsPage = () => (
  <div className="bg-white rounded-xl border border-[#E3E2DF] p-6 shadow-sm">
    <h2 className="text-xl font-bold text-[#192835]">설정</h2>
    <p className="text-sm text-[#6A6A6A] mt-1">시스템 환경설정 및 계정 관리</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/cases" element={<CaseListView />} />
              <Route path="/cases/:caseId/phase1" element={<Phase1InitialPage />} />
              <Route path="/cases/:caseId/phase2" element={<Phase2ReviewPage />} />
              <Route path="/cases/:caseId/phase3" element={<Phase3FinalPage />} />
              <Route path="/cases/:caseId/compare" element={<VideoComparePage />} />

              {/* Redirect to correct phase based on case state would be better,
                  but for now simple direct navigation or default to phase1 */}
              <Route path="/cases/:caseId" element={<Navigate to="phase1" replace />} />

              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
