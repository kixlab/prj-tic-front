import { TicCase, DashboardMetrics, ScheduleEvent } from '../types/cdss';

export const INITIAL_METRICS: DashboardMetrics = {
  totalReviewProgress: 30, // 계산 로직으로 대체될 예정이지만 초기값
  completedCasesCount: 1,
  remainingVideoCount: 2,
  totalVideoCount: 3,
  thisWeekPatients: 1,
};

export const INITIAL_SCHEDULES: ScheduleEvent[] = [
  {
    id: 'S-1',
    patientId: 'P-1002',
    patientName: '이*민',
    caseId: 'C-77821',
    date: '2026-10-21',
    time: '10:00',
    visitType: '재진',
    notes: '코 끝 실룩거림 증상 심화 여부 확인 필요'
  },
  {
    id: 'S-2',
    patientId: 'P-1015',
    patientName: '김*현',
    date: '2026-10-21',
    time: '14:30',
    visitType: '초진',
    notes: '눈 깜빡임 및 어깨 들썩임으로 내원'
  },
  {
    id: 'S-3',
    patientId: 'P-1005',
    patientName: '박*우',
    caseId: 'C-77822',
    date: '2026-10-22',
    time: '09:00',
    visitType: '정기 검진',
    notes: '약물 복용 후 경과 관찰'
  }
];

export const INITIAL_CASES: TicCase[] = [
  {
    id: 'C-77821',
    patientId: 'P-1002',
    patientName: '이*민',
    visitDate: '2026.10.01',
    priorVisitDate: '2026.08.15',
    symptomSummary: '반복적인 얼굴 경련 증상',
    symptomDetail: '코 끝을 미세하게 움직임',
    status: 'in_review',
    currentPhase: 1,
    updatedAt: '2026.10.20 16:45',
    currentVideo: {
      title: '2026.10.01 환자 촬영 영상',
      duration: 300,
      ticPoints: [
        {
          id: 'tp-1',
          timeStr: '1:20',
          seconds: 80,
          label: 'TIC Point 1:20',
          evidence: [
            '반복적인 움직임',
            '짧은 지속시간',
            '얼굴에서 확인',
            '코 끝 실룩거림 관찰됨'
          ],
          detectionBox: {
            label: 'face 99%',
            x: 28,
            y: 22,
            width: 44,
            height: 48,
          }
        },
        {
          id: 'tp-2',
          timeStr: '4:00',
          seconds: 240,
          label: 'TIC Point 4:00',
          evidence: [
            '1:20에 비해 덜 반복적인 움직임',
            '머리를 흔드는 모습',
            '목 부위 근육 긴장 동반',
            '순간적인 눈 깜빡임 동반'
          ],
          detectionBox: {
            label: 'face 99%',
            x: 30,
            y: 24,
            width: 42,
            height: 46,
          }
        }
      ]
    },
    priorVideo: {
      id: 'PV-1',
      visitDate: '2026.08.15',
      title: '2026.08.15 이전 방문 영상',
      duration: 240,
      symptomChanges: [
        '빈도 증가 ↑',
        '지속 시간 증가 ↑',
        'New vocal tic'
      ],
      ticPoints: [
        {
          id: 'tp-prior-1',
          timeStr: '1:45',
          seconds: 105,
          label: 'TIC Point 1:45',
          evidence: [
            '반복적인 움직임',
            '얼굴에서 확인',
            '찡그리는 표정',
            '간헐적인 눈썹 경련'
          ],
          detectionBox: {
            label: 'face 99%',
            x: 26,
            y: 20,
            width: 46,
            height: 50,
          }
        }
      ]
    },
    initialAssessment: {
      primaryClassification: '틱',
      secondaryClassification: '행동 틱',
      classification: '행동 틱',
      confidence: '중간',
      evidence: '반복적인 움직임',
      notes: '눈 부분에서 깜빡이는 듯한 모습 발견',
      submittedAt: '2026-10-01 14:20'
    },
    aiPrediction: {
      classification: '행동 틱',
      confidencePercent: 83,
      faceDetectionPercent: 99,
      summaryEvidence: [
        '반복적인 움직임',
        '짧은 지속 시간',
        '얼굴에서 확인'
      ],
      ticPoints: [
        {
          id: 'tp-ai-1',
          timeStr: '1:20',
          seconds: 80,
          label: 'TIC Point 1:20',
          evidence: [
            '반복적인 움직임',
            '짧은 지속시간',
            '얼굴에서 확인',
            '안면 근육 수축 주기성 확인'
          ],
          detectionBox: {
            label: 'face 99%',
            x: 28,
            y: 22,
            width: 44,
            height: 48,
          }
        },
        {
          id: 'tp-ai-2',
          timeStr: '4:00',
          seconds: 240,
          label: 'TIC Point 4:00',
          evidence: [
            '1:20에 비해 덜 반복적인 움직임',
            '머리를 흔드는 모습',
            '고개 회전성 틱 징후',
            '안구 상방 편위'
          ],
          detectionBox: {
            label: 'face 99%',
            x: 30,
            y: 24,
            width: 42,
            height: 46,
          }
        }
      ]
    }
  },
  {
    id: 'C-77822',
    patientId: 'P-1005',
    patientName: '박*우',
    visitDate: '2026.09.28',
    priorVisitDate: '2026.07.10',
    symptomSummary: '간헐적인 헛기침 및 음성 증상',
    symptomDetail: '말하는 도중 헛기침을 반복함',
    status: 'completed',
    currentPhase: 3,
    updatedAt: '2026.09.28 11:45',
    currentVideo: {
      title: '2026.09.28 환자 촬영 영상',
      duration: 180,
      ticPoints: [
        {
          id: 'tp-22-1',
          timeStr: '0:45',
          seconds: 45,
          label: 'TIC Point 0:45',
          evidence: ['짧은 음성 방출', '성대 근육 수축'],
          detectionBox: { label: 'face 97%', x: 25, y: 20, width: 45, height: 45 }
        }
      ]
    },
    initialAssessment: {
      primaryClassification: '틱',
      secondaryClassification: '음성 틱',
      classification: '음성 틱',
      confidence: '높음',
      evidence: '반복적인 헛기침 소리 확인',
      notes: '긴장 상황에서 빈도 증가',
      submittedAt: '2026-09-28 11:30'
    },
    aiPrediction: {
      classification: '음성 틱',
      confidencePercent: 91,
      faceDetectionPercent: 98,
      summaryEvidence: ['음성 파형 패턴 일치', '불규칙 주기성'],
      ticPoints: []
    },
    reviewAction: {
      action: 'confirm',
      decidedAt: '2026-09-28 11:40'
    },
    finalDecision: {
      primaryClassification: '틱',
      secondaryClassification: '음성 틱',
      classification: '음성 틱',
      confidence: '높음',
      evidence: '반복적인 헛기침 소리 및 음향 스펙트로그램 일치',
      notes: '초기 판단 유지 및 음성 틱으로 최종 진단 확정',
      savedAt: '2026-09-28 11:45'
    }
  },
  {
    id: 'C-77823',
    patientId: 'P-1011',
    patientName: '최*서',
    visitDate: '2026.09.15',
    symptomSummary: '어깨 들썩임 및 고개 젖힘',
    symptomDetail: '우측 어깨를 주기적으로 치켜올림',
    status: 'pending',
    currentPhase: 1,
    updatedAt: '2026.09.15 10:00',
    currentVideo: {
      title: '2026.09.15 환자 촬영 영상',
      duration: 106,
      videoUrl: 'https://youtu.be/m48z9IM8bos',
      youtubeId: 'm48z9IM8bos',
      ticPoints: [
        {
          id: 'tp-23-1',
          timeStr: '0:02',
          seconds: 2,
          label: 'TIC Point 0:02',
          evidence: ['어깨 거상 움직임', '동시적 머리 신전'],
          detectionBox: { label: 'face 95%', x: 30, y: 22, width: 40, height: 44 }
        }
      ]
    },
    aiPrediction: {
      classification: '복합 틱',
      confidencePercent: 78,
      faceDetectionPercent: 96,
      summaryEvidence: ['어깨 및 경추 연동 움직임'],
      ticPoints: [
        {
          id: 'tp-23-1-ai',
          timeStr: '0:02',
          seconds: 2,
          label: 'TIC Point 0:02',
          evidence: ['어깨 거상 움직임', '동시적 머리 신전'],
          detectionBox: { label: 'face 95%', x: 30, y: 22, width: 40, height: 44 }
        }
      ]
    }
  }
];
