export type InterviewWorkflowMode = 'clinician-first' | 'ai-first';

export type PrimaryTicClassification = '틱' | '틱 아님' | '부정확 / 판단 보류';
export type SecondaryTicClassification = '행동 틱' | '음성 틱' | '복합 틱';
export type ConfidenceLevel = '높음' | '중간' | '낮음';

// 공통 판단 데이터 구조
export interface AssessmentData {
  primaryClassification: PrimaryTicClassification;
  secondaryClassification?: SecondaryTicClassification;
  confidence: ConfidenceLevel;
  evidence: string;
  notes: string;
  submittedAt?: string;
}

// AI Mock 시나리오 타입
export type AiScenarioType = 'normal' | 'false_positive' | 'low_confidence';

export interface InterviewTicPoint {
  id: string;
  timeStr: string;
  seconds: number;
  label: string;
  evidence: string[];
}

export interface InterviewAIPrediction {
  scenarioType: AiScenarioType;
  classification: string; // '틱' | '틱 아님'
  secondaryClassification?: string;
  confidencePercent: number;
  confidenceLevel: ConfidenceLevel;
  faceDetectionPercent: number;
  ticPoints: InterviewTicPoint[];
  summaryEvidence: string[];
  warningMessage?: string;
}

// Clinician-first 3단계 데이터
export interface ClinicianFirstSession {
  caseId: string;
  mode: 'clinician-first';
  status: 'in_progress' | 'completed';
  currentStep: 1 | 2 | 3;

  // 1단계: 임상의 초기 판단 (AI 비공개)
  initialAssessment: AssessmentData;

  // 2단계: AI 결과 비교 및 검토 (원본 보존)
  aiPredictionOriginal: InterviewAIPrediction;
  clinicianReview: {
    modifiedPrediction?: Partial<InterviewAIPrediction>; // 임상의가 수정한 AI 결과
    notes: string; // 임상의 검토 의견
  };

  // 3단계: 최종 판단
  finalDecision?: AssessmentData;

  updatedAt: string;
}

// 전체 AI 분석 결과에 대한 임상의의 종합 동의 여부
export type OverallAgreement = 'agree' | 'partial' | 'disagree';

// AI-first 2단계 데이터
export interface AiFirstSession {
  caseId: string;
  mode: 'ai-first';
  status: 'in_progress' | 'completed';
  currentStep: 1 | 2;

  // 1단계: AI 분석 결과 검토 및 임상의 구조화된 판단
  aiPredictionOriginal: InterviewAIPrediction; // AI 원본 분석 결과 (보존, 수정 금지)

  overallAgreement?: OverallAgreement; // 전체 AI 분석에 대한 동의 여부 (동의/부분 동의/불일치·오탐)
  clinicianAssessment: AssessmentData; // 동의 여부 선택에 따라 채워지는 임상의 판단 (Clinician-first 판단 폼 재사용)
  disagreeReason?: string; // 불일치/오탐 판단 시 거부 사유 (필수, 별도 보존)

  // 2단계: 최종 판단
  finalDecision?: AssessmentData;

  updatedAt: string;
}

export type InterviewSession = ClinicianFirstSession | AiFirstSession;
