// 입력용 엑셀 양식 생성: data/voc.xlsx (이미 있으면 덮어쓰지 않음, --force 로 강제)
import ExcelJS from 'exceljs';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { COLUMNS, STATUSES, TYPES, DATA_SHEET, SETTINGS_SHEET } from './columns.mjs';

const OUT = 'data/voc.xlsx';
if (existsSync(OUT) && !process.argv.includes('--force')) {
  console.log(`[template] ${OUT} 가 이미 있습니다. 덮어쓰려면: npm run template -- --force`);
  process.exit(0);
}

// 샘플 데이터 — 실제 데이터로 교체하세요.
const SAMPLE = [
  ['S-0001', '2025년 1차', '', '2025-03-10', '질의', '센터 지원(운영비)', '○ 운영비 집행 시 회의비 항목의 1회 한도가 별도로 정해져 있는지?', '-', '○ 회의비는 지침상 1인당 기준 단가 범위 내에서 집행 가능하며, 1회 총액 한도는 별도로 두지 않음.', '완료', '현장 즉시 안내', '-', ''],
  ['S-0002', '2025년 1차', '', '2025-03-10', '건의', '훈련과정 편성', '○ 훈련과정 변경 승인 절차 간소화 요청', '○ 경미한 시간표 조정도 정식 변경 승인이 필요해 현장 행정 부담이 큼', '○ 경미한 변경의 범위를 정의하여 사후 보고로 대체하는 방안 검토 중.', '진행중', '제도개선 검토', '○ 하반기 운영지침 개정 시 반영 여부 결정', ''],
  ['S-0003', '2025년 2차', '', '2025-06-16', '질의', '기업 지원(훈련비)', '○ 현장훈련비 지급 시점은 월 단위인지, 훈련 종료 후 일괄인지?', '-', '○ 진도율 기준 도달 시점에 신청 가능하며, 월 단위 지급은 아님.', '완료', '현장 즉시 안내', '-', ''],
  ['S-0004', '2025년 2차', '', '2025-06-16', '건의', '학습근로자 관리', '○ 중도탈락 사유 입력 항목 세분화 요청', '○ 현재 사유 코드가 포괄적이어서 원인 분석이 어려움', '○ 시스템 개편 일정과 연계하여 장기적으로 검토.', '장기검토', '시스템 개선 검토', '○ 차기 시스템 고도화 과제로 등록', ''],
  ['S-0005', '2025년 3차', '', '2025-09-22', '질의', '평가', '○ 외부평가 일정은 언제 공지되는지?', '-', '○ 평가 대상 확정 후 개별 공문으로 안내 예정.', '완료', '공문 안내', '○ 평가 일정 공문 발송 완료', ''],
  ['S-0006', '2025년 3차', '', '2025-09-22', '질의', '선이수', '○ 선이수 인정 과목의 학점 기준이 있는지?', '-', '○ 과목별 학점 기준은 없으며 훈련기준 내 능력단위와의 연계성으로 판단함.', '완료', '현장 즉시 안내', '-', ''],
  ['S-0007', '2026년 1차', '', '2026-02-23', '건의', '센터 지원(사업비+훈련비)', '○ 사업비 이월 허용 요청', '○ 학사 일정상 연말 집행이 어려운 항목이 반복적으로 발생', '○ 예산 회계 기준상 이월은 어려우나, 집행 기한 조정 가능 여부를 관계부처와 협의 중.', '진행중', '관계부처 협의', '', ''],
  ['S-0008', '2026년 1차', '', '2026-02-23', '질의', '', '○ 신규 참여 기업의 승인 소요 기간은?', '-', '', '진행중', '', '', ''],
];

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet(DATA_SHEET, { views: [{ state: 'frozen', ySplit: 1 }] });
ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
SAMPLE.forEach((r) => ws.addRow(r));

const head = ws.getRow(1);
head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123B64' } };
head.alignment = { vertical: 'middle', horizontal: 'center' };
head.height = 22;
ws.autoFilter = { from: 'A1', to: { row: 1, column: COLUMNS.length } };

const colOf = (key) => COLUMNS.findIndex((c) => c.key === key) + 1;
for (let r = 2; r <= 1000; r++) {
  ws.getCell(r, colOf('status')).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${STATUSES.join(',')}"`] };
  ws.getCell(r, colOf('type')).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${TYPES.join(',')}"`] };
  for (const k of ['question', 'reason', 'answer', 'actionDetail']) {
    ws.getCell(r, colOf(k)).alignment = { wrapText: true, vertical: 'top' };
  }
}

const st = wb.addWorksheet(SETTINGS_SHEET);
st.columns = [{ header: '항목', width: 16 }, { header: '값', width: 20 }, { header: '설명', width: 50 }];
st.addRow(['최신화일', '2026-02-23', '화면 상단 "최신화" 날짜. 비우면 가장 최근 접수일 사용']);
st.getRow(1).font = { bold: true };

await mkdir('data', { recursive: true });
await wb.xlsx.writeFile(OUT);
console.log(`[template] ${OUT} 생성 (샘플 ${SAMPLE.length}건)`);
