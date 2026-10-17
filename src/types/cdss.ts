export type TicClassification = '행동 틱' | '음성 틱' | '복합 틱' | '해당 없음';
export type ConfidenceLevel = '높음' | '중간' | '낮음';
export type ReviewActionType = 'confirm' | 'edit' | 'reject'; // 확인, 수정, 거부

export interface TicPoint {
  id: string;
  timeStr: string;      // "1:20", "4:00"
  seconds: number;      // 80, 240
  label: string;        // "TIC Point 1:20"
  evidence: string[];   // ["반복적인 움직임", "짧은 지속시간", "얼굴에서 확인"]
  detectionBox?: {
    label: string;      // "face 99%"
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 1. 임상의 초기 판단 (AI 공개 전 순수 판단 - 영구 보존)
export interface InitialAssessment {
  classification: TicClassification;
  confidence: ConfidenceLevel;
  evidence: string;
  notes: string;
  submittedAt: string;
}

// 2. 가상 AI 분석 예측 데이터 (불변 참조 데이터)
export interface AIPrediction {
  classification: TicClassification;
  confidencePercent: number;    // 83%
  faceDetectionPercent: number; // 99%
  ticPoints: TicPoint[];
  summaryEvidence: string[];
}

// 3. 임상의의 검토 작업 (Audit Trail)
export interface ReviewAction {
  action: ReviewActionType;     // 'confirm' | 'edit' | 'reject'
  decidedAt?: string;
  note?: string;
}

// 4. 임상의 최종 판단 (최종 저장 기록)
export interface FinalDecision {
  classification: TicClassification;
  confidence: ConfidenceLevel;
  evidence: string;
  notes: string;
  savedAt?: string;
}

// 환자 방문 케이스 엔티티
export interface TicCase {
  id: string;                   // 예: "C-77821"
  patientId: string;            // 예: "P-1002"
  patientName: string;          // 예: "김*진"
  visitDate: string;            // 예: "2026.10.01"
  symptomSummary: string;       // 예: "반복적인 얼굴 경련 증상"
  symptomDetail: string;        // 예: "코 끝을 미세하게 움직임"
  status: 'pending' | 'in_review' | 'completed';
  currentPhase: 1 | 2 | 3;

  // 현재 비디오
  currentVideo: {
    title: string;
    duration: number;           // 300초 (5분)
    videoUrl?: string;
    ticPoints: TicPoint[];
  };

  // 이전 방문 비디오 및 변화 요약
  priorVideo?: {
    visitDate: string;          // "2026.08.15"
    title: string;
    duration: number;
    videoUrl?: string;
    ticPoints: TicPoint[];
    symptomChanges: string[];   // ["빈도 증가 ↑", "지속 시간 증가 ↑", "New vocal tic"]
  };

  // 4단계 독립 데이터 레이어
  initialAssessment?: InitialAssessment;
  aiPrediction: AIPrediction;
  reviewAction?: ReviewAction;
  finalDecision?: FinalDecision;
}

export interface DashboardMetrics {
  totalReviewProgress: number;  // 80%
  completedCasesCount: number;  // 3
  remainingVideoCount: number;  // 8
  totalVideoCount: number;      // 10
  thisWeekPatients: number;     // 1
}
