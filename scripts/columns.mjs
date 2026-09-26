// 엑셀 헤더(한글) ↔ JSON 필드 매핑. 엑셀 컬럼 순서는 자유, 헤더 이름만 맞으면 됩니다.
export const COLUMNS = [
  { key: 'id',           header: '번호',            width: 12 },
  { key: 'community',    header: '커뮤니티',        width: 14 },
  { key: 'date',         header: '접수일',          width: 12 },
  { key: 'type',         header: '유형',            width: 8  },
  { key: 'category',     header: '관련분류',        width: 24 },
  { key: 'question',     header: '질의·건의 내용',  width: 60 },
  { key: 'reason',       header: '건의 사유',       width: 40 },
  { key: 'answer',       header: '현장 응답 내용',  width: 60 },
  { key: 'status',       header: '조치 상태',       width: 10 },
  { key: 'action',       header: '조치 구분',       width: 16 },
  { key: 'actionDetail', header: '조치 내용',       width: 40 },
  { key: 'note',         header: '비고',            width: 16 },
];

export const STATUSES = ['완료', '진행중', '장기검토'];
export const TYPES = ['질의', '건의'];

export const DATA_SHEET = 'VOC';
export const SETTINGS_SHEET = '설정';
