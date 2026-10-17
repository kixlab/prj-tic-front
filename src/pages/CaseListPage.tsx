import React from 'react';
import { Link } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import { Video } from 'lucide-react';

const CaseListView: React.FC = () => {
  const { cases } = useCaseContext();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#192835]">환자 / Case 목록</h1>
      <div className="grid grid-cols-1 gap-4">
        {cases.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E3E2DF] p-5 shadow-sm hover:border-[#5EBB8F] transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-[#192835]">{c.id}</span>
                  <span className="text-sm text-[#6A6A6A]">{c.patientName}</span>
                </div>
                <p className="text-sm font-medium text-[#192835] mt-2">{c.symptomSummary}</p>
              </div>
              <Link to={`/cases/${c.id}/phase1`} className="px-4 py-2 text-xs font-semibold bg-[#5EBB8F] hover:bg-[#4FA47C] text-white rounded-lg">진단 분석 보기</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseListView;
