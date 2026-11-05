import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/common/Footer';
import DashboardView from './pages/DashboardPage';
import CaseListView from './pages/CaseListPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import Phase1InitialPage from './pages/Phase1InitialPage';
import Phase2ReviewPage from './pages/Phase2ReviewPage';
import Phase3FinalPage from './pages/Phase3FinalPage';
import VideoComparePage from './pages/VideoComparePage';
import { InterviewProvider } from './context/InterviewContext';
import InterviewModeSelectPage from './pages/interview/InterviewModeSelectPage';
import ClinicianFirstPhase1 from './pages/interview/ClinicianFirstPhase1';
import ClinicianFirstPhase2 from './pages/interview/ClinicianFirstPhase2';
import ClinicianFirstPhase3 from './pages/interview/ClinicianFirstPhase3';
import AiFirstStep1Page from './pages/interview/AiFirstStep1Page';
import AiFirstStep2Page from './pages/interview/AiFirstStep2Page';

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
      <InterviewProvider>
        <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
          <Header />
          <div className="flex-1 flex">
            <Sidebar />
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<DashboardView />} />
                <Route path="/cases" element={<CaseListView />} />
                <Route path="/cases/:caseId" element={<PatientDashboardPage />} />
                <Route path="/cases/:caseId/phase1" element={<Phase1InitialPage />} />
                <Route path="/cases/:caseId/phase2" element={<Phase2ReviewPage />} />
                <Route path="/cases/:caseId/phase3" element={<Phase3FinalPage />} />
                <Route path="/cases/:caseId/compare" element={<VideoComparePage />} />
                <Route path="/interview/cases" element={<CaseListView />} />
                <Route path="/interview/cases/:caseId/mode" element={<InterviewModeSelectPage />} />
                <Route path="/interview/cases/:caseId/clinician-first/step1" element={<ClinicianFirstPhase1 />} />
                <Route path="/interview/cases/:caseId/clinician-first/step2" element={<ClinicianFirstPhase2 />} />
                <Route path="/interview/cases/:caseId/clinician-first/step3" element={<ClinicianFirstPhase3 />} />
                <Route path="/interview/cases/:caseId/ai-first/step1" element={<AiFirstStep1Page />} />
                <Route path="/interview/cases/:caseId/ai-first/step2" element={<AiFirstStep2Page />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </InterviewProvider>
    </BrowserRouter>
  );
}
