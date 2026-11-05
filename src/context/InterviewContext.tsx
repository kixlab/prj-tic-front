import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  InterviewWorkflowMode,
  InterviewAIPrediction,
  ClinicianFirstSession,
  AiFirstSession,
  AiScenarioType,
  InterviewSession
} from '../types/interview';
import { INITIAL_CASES } from '../data/mockCases';

// 환자 ID별 AI Mock 시나리오 매핑 (요청하신 3가지 케이스 포함)
export const getAiMockPredictionForCase = (caseId: string): InterviewAIPrediction => {
  // C-77821 또는 1번 환자: 임상의와 AI 판단이 일치하는 케이스 (정상)
  if (caseId === 'C-77821' || caseId.endsWith('1')) {
    return {
      scenarioType: 'normal',
      classification: '틱',
      secondaryClassification: '행동틱',
      confidencePercent: 92,
      confidenceLevel: '높음',
      faceDetectionPercent: 98,
      ticPoints: [
        { id: 'p1', timeStr: '01:15', seconds: 75, label: '눈 깜박임 및 안면 경련', evidence: ['빠른 반복성', '안면 근육 수축'] },
        { id: 'p2', timeStr: '03:40', seconds: 220, label: '어깨 으쓱임', evidence: ['상지 복합 운동 틱'] }
      ],
      summaryEvidence: ['안면 및 상지 부위에서 전형적인 운동 틱 패턴이 반복 관찰됨', 'AI 모델 신뢰도 높음 (92%)']
    };
  }

  // C-77822 또는 2번 환자: AI가 명백하게 잘못된 판단을 높은 신뢰도로 제시하는 케이스 (오탐)
  if (caseId === 'C-77822' || caseId.endsWith('2')) {
    return {
      scenarioType: 'false_positive',
      classification: '틱',
      secondaryClassification: '음성틱',
      confidencePercent: 96,
      confidenceLevel: '높음',
      faceDetectionPercent: 99,
      ticPoints: [
        { id: 'fp1', timeStr: '00:52', seconds: 52, label: '반복적 음절 발화 (가상)', evidence: ['음성 세그먼트 반복 탐지', '실제 영상에는 소음만 존재'] },
        { id: 'fp2', timeStr: '01:35', seconds: 95, label: '헛기침 증상 (가상)', evidence: ['음성 파형 패턴 분석 결과', '주변 환경 소음을 틱으로 오인'] }
      ],
      summaryEvidence: ['[AI 오탐 시뮬레이션] 실제 영상에는 존재하지 않는 음성 틱 및 반복 발화를 고신뢰도(96%)로 탐지함. 모델 오류를 가정한 시나리오입니다.'],
      warningMessage: '⚠️ [시뮬레이션] 실제 영상과 일치하지 않는 가상의 음성 틱 탐지 결과입니다. 모델 오류를 확인하세요.'
    };
  }

  // 그 외 환자 (예: C-77823 등): AI 신뢰도가 40%로 낮게 설정된 케이스 (저신뢰도 경고)
  return {
    scenarioType: 'low_confidence',
    classification: '부정확 / 판단 보류',
    secondaryClassification: '행동틱',
    confidencePercent: 40,
    confidenceLevel: '낮음',
    faceDetectionPercent: 62,
    ticPoints: [
      { id: 'lc1', timeStr: '02:15', seconds: 135, label: '미세한 안면 움직임 (모호함)', evidence: ['저조도 및 움직임 블러로 판독 어려움', '특징점 추출 불안정'] }
    ],
    summaryEvidence: ['[저신뢰도 경고] 영상 화질 저하 및 모호한 비언어적 제스처로 인해 AI 분석 신뢰도가 40%로 매우 낮습니다.'],
    warningMessage: '🚨 [경고] AI 분석 신뢰도가 40%로 낮습니다. 영상 직접 검토 및 임상의의 독자적 판단이 필수적입니다.'
  };
};

interface InterviewContextType {
  getClinicianSession: (caseId: string) => ClinicianFirstSession;
  saveClinicianSession: (session: ClinicianFirstSession) => void;
  getAiFirstSession: (caseId: string) => AiFirstSession;
  saveAiFirstSession: (session: AiFirstSession) => void;
  getAiPrediction: (caseId: string) => InterviewAIPrediction;
  resetSession: (caseId: string, mode: InterviewWorkflowMode) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

const STORAGE_KEY = 'TIC_ASSIST_INTERVIEW_SESSIONS_V1';

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Record<string, InterviewSession>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load interview sessions from localStorage', e);
      return {};
    }
  });

  const persistSessions = (newSessions: Record<string, InterviewSession>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (e) {
      console.error('Failed to save interview sessions to localStorage', e);
    }
  };

  const getSessionKey = (caseId: string, mode: InterviewWorkflowMode) => `${caseId}_${mode}`;

  const getClinicianSession = (caseId: string): ClinicianFirstSession => {
    const key = getSessionKey(caseId, 'clinician-first');
    const existing = sessions[key] as ClinicianFirstSession;
    if (existing) return existing;

    const defaultSession: ClinicianFirstSession = {
      caseId,
      mode: 'clinician-first',
      status: 'in_progress',
      currentStep: 1,
      initialAssessment: {
        primaryClassification: '틱',
        secondaryClassification: '행동 틱',
        confidence: '중간',
        evidence: '',
        notes: '',
      },
      aiPredictionOriginal: getAiMockPredictionForCase(caseId),
      clinicianReview: {
        notes: '',
      },
      updatedAt: new Date().toISOString(),
    };
    return defaultSession;
  };

  const saveClinicianSession = (session: ClinicianFirstSession) => {
    const key = getSessionKey(session.caseId, 'clinician-first');
    const updated = {
      ...sessions,
      [key]: { ...session, updatedAt: new Date().toISOString() }
    };
    persistSessions(updated);
  };

  const getAiFirstSession = (caseId: string): AiFirstSession => {
    const key = getSessionKey(caseId, 'ai-first');
    const existing = sessions[key] as AiFirstSession;
    if (existing) return existing;

    const defaultSession: AiFirstSession = {
      caseId,
      mode: 'ai-first',
      status: 'in_progress',
      currentStep: 1,
      aiPredictionOriginal: getAiMockPredictionForCase(caseId),
      overallAgreement: undefined,
      clinicianAssessment: {
        primaryClassification: '틱',
        secondaryClassification: '행동 틱',
        confidence: '중간',
        evidence: '',
        notes: '',
      },
      disagreeReason: undefined,
      updatedAt: new Date().toISOString(),
    };
    return defaultSession;
  };

  const saveAiFirstSession = (session: AiFirstSession) => {
    const key = getSessionKey(session.caseId, 'ai-first');
    const updated = {
      ...sessions,
      [key]: { ...session, updatedAt: new Date().toISOString() }
    };
    persistSessions(updated);
  };

  const getAiPrediction = (caseId: string): InterviewAIPrediction => {
    return getAiMockPredictionForCase(caseId);
  };

  const resetSession = (caseId: string, mode: InterviewWorkflowMode) => {
    const key = getSessionKey(caseId, mode);
    const updated = { ...sessions };
    delete updated[key];
    persistSessions(updated);
  };

  return (
    <InterviewContext.Provider value={{
      getClinicianSession,
      saveClinicianSession,
      getAiFirstSession,
      saveAiFirstSession,
      getAiPrediction,
      resetSession
    }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterviewContext must be used within an InterviewProvider');
  }
  return context;
};
