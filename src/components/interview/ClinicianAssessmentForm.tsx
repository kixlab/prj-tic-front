import React from 'react';
import { PrimaryTicClassification, SecondaryTicClassification, ConfidenceLevel } from '../../types/cdss';
import { AssessmentData } from '../../types/interview';

// ClinicianFirstPhase1의 임상의 판단 폼(1차/2차 분류, 확신 정도, 근거/메모)을
// 그대로 재사용하기 위해 추출한 컴포넌트. Clinician-first 쪽 파일은 수정하지 않음.
interface ClinicianAssessmentFormProps {
  title: string;
  description: string;
  value: AssessmentData;
  onChange: (field: keyof AssessmentData, value: any) => void;
  readOnly?: boolean;
}

export const ClinicianAssessmentForm: React.FC<ClinicianAssessmentFormProps> = ({
  title,
  description,
  value,
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-[#5EBB8F] shadow-md flex flex-col justify-between relative overflow-hidden">
      <div>
        <h2 className="text-lg font-bold text-[#192835] mb-1">{title}</h2>
        <p className="text-xs text-[#898989] mb-6">{description}</p>

        <div className="space-y-6">
          {/* 1차 분류 */}
          <div>
            <label className="block text-xs font-bold text-[#192835] mb-2">
              1차 분류: 틱 증상 여부*
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['틱', '틱 아님', '부정확 / 판단 보류'] as PrimaryTicClassification[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange('primaryClassification', option)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    value.primaryClassification === option
                      ? 'bg-[#192835] border-[#192835] text-white shadow-sm'
                      : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'
                  } ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 2차 분류 */}
          {value.primaryClassification === '틱' && (
            <div className="p-4 bg-[#F0F8F4] rounded-xl border border-[#C1E9D6] transition-all">
              <label className="block text-xs font-bold text-[#2E664B] mb-2">
                2차 분류: 틱 세부 유형*
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['행동 틱', '음성 틱', '복합 틱'] as SecondaryTicClassification[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange('secondaryClassification', type)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors ${
                      value.secondaryClassification === type
                        ? 'bg-[#5EBB8F] border-[#5EBB8F] text-white'
                        : 'bg-white border-[#C1E9D6] text-[#2E664B] hover:bg-emerald-100'
                    } ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 임상적 확신 정도 */}
          <div>
            <label className="block text-xs font-bold text-[#192835] mb-2">임상적 확신 정도</label>
            <div className="flex space-x-6">
              {(['높음', '중간', '낮음'] as ConfidenceLevel[]).map((level) => (
                <label key={level} className={`flex items-center space-x-2 text-xs font-medium text-[#192835] ${readOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="confidence"
                    value={level}
                    disabled={readOnly}
                    checked={value.confidence === level}
                    onChange={(e) => onChange('confidence', e.target.value as ConfidenceLevel)}
                    className="accent-[#5EBB8F]"
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 주요 판단 근거 */}
          <div>
            <label className="block text-xs font-bold text-[#192835] mb-2">주요 판단 근거</label>
            <textarea
              className={`w-full p-3 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-32 ${readOnly ? 'bg-gray-50 text-gray-700 font-mono' : ''}`}
              placeholder="영상에서 관찰된 증거 및 근거를 입력하세요. (예: 안면 근육 반복 수축)"
              value={value.evidence}
              readOnly={readOnly}
              onChange={(e) => onChange('evidence', e.target.value)}
            />
          </div>

          {/* 추가 임상 메모 */}
          <div>
            <label className="block text-xs font-bold text-[#192835] mb-2">추가 임상 메모</label>
            <textarea
              className={`w-full p-3 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-20 ${readOnly ? 'bg-gray-50 text-gray-700' : ''}`}
              placeholder="환자 상태나 관찰 맥락에 대한 추가 메모를 적어주세요."
              value={value.notes}
              readOnly={readOnly}
              onChange={(e) => onChange('notes', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianAssessmentForm;
