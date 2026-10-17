import React, { useState } from 'react';
import { useCaseContext } from '../context/CaseContext';
import { Activity, Users, Settings, LogOut, HelpCircle, ChevronRight, Clock, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardView: React.FC = () => {
  const { cases } = useCaseContext();
  const [metrics] = useState({
    totalReviewProgress: 80,
    completedCasesCount: 3,
    remainingVideoCount: 8,
    totalVideoCount: 10,
    thisWeekPatients: 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#192835]">대시보드</h1>
        <p className="text-sm text-[#6A6A6A] mt-1">임상의용 영상 검토 현황 및 환자 Case 요약</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-[#E3E2DF] shadow-sm">
          <div className="text-xs font-semibold text-[#898989] mb-2">전체 환자 영상 검토 진행율</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-[#5EBB8F]">{metrics.totalReviewProgress}%</span>
            <span className="text-sm font-medium text-[#6A6A6A]">({metrics.completedCasesCount}건 완료)</span>
          </div>
          <div className="w-full bg-[#EAEAEA] h-2.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#5EBB8F] h-full rounded-full transition-all" style={{ width: `${metrics.totalReviewProgress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E3E2DF] shadow-sm">
          <div className="text-xs font-semibold text-[#898989] mb-2">검토 대기 영상</div>
          <div className="text-4xl font-extrabold text-[#192835]">
            {metrics.remainingVideoCount}<span className="text-lg font-normal text-[#898989]"> / {metrics.totalVideoCount}</span>
          </div>
          <p className="text-xs text-[#6A6A6A] mt-4 flex items-center">
            <Clock size={13} className="mr-1 text-[#5EBB8F]" /> 남은 영상 수 : {metrics.remainingVideoCount}/{metrics.totalVideoCount}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E3E2DF] shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#898989] mb-2">이번 주 신규 검토 환자</div>
            <div className="text-4xl font-extrabold text-[#192835]">{metrics.thisWeekPatients}<span className="text-lg font-normal text-[#898989]"> 명</span></div>
          </div>
          <Link to="/cases" className="mt-4 inline-flex items-center justify-between text-xs font-semibold text-[#2E664B] bg-[#E0EFE8] hover:bg-[#C1E9D6] px-3.5 py-2 rounded-lg transition-colors">
            <span>환자 목록 보기</span><ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E2DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E3E2DF] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#192835]">최근 Case 검토 현황</h2>
          <Link to="/cases" className="text-xs font-semibold text-[#5EBB8F] hover:underline flex items-center">전체 보기 <ChevronRight size={14} /></Link>
        </div>
        <div className="divide-y divide-[#E3E2DF]">
          {cases.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-[#E0EFE8] flex items-center justify-center text-[#2E664B] font-bold text-sm">{c.id.replace('C-', '')}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-[#192835]">{c.id}</span>
                    <span className="text-xs text-[#898989]">({c.patientName})</span>
                  </div>
                  <div className="text-xs text-[#6A6A6A] mt-1">{c.symptomSummary}</div>
                </div>
              </div>
              <Link to={`/cases/${c.id}/phase1`} className="px-3 py-1.5 text-xs font-semibold bg-[#5EBB8F] text-white hover:bg-[#4FA47C] rounded-lg">진단 분석 보기</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
