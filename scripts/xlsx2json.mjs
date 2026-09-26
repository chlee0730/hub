// data/voc.xlsx → public/data/voc.json 변환 (빌드 전에 자동 실행)
import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { COLUMNS, STATUSES, TYPES, DATA_SHEET, SETTINGS_SHEET } from './columns.mjs';

const SRC = 'data/voc.xlsx';
const OUT = 'public/data/voc.json';

if (!existsSync(SRC)) {
  console.error(`[data] ${SRC} 파일이 없습니다. "npm run template"으로 양식을 만드세요.`);
  process.exit(1);
}

const cellText = (v) => {
  if (v == null) return '';
  if (v instanceof Date) return toDate(v);
  if (typeof v === 'object') {
    if ('richText' in v) return v.richText.map((r) => r.text).join('');
    if ('text' in v) return String(v.text);
    if ('result' in v) return cellText(v.result);
  }
  return String(v);
};

const toDate = (v) => {
  if (v instanceof Date) {
    // 엑셀 날짜는 UTC 자정 기준 → 날짜만 사용
    return v.toISOString().slice(0, 10);
  }
  const m = String(v).trim().match(/^(\d{4})[.\-/\s]+(\d{1,2})[.\-/\s]+(\d{1,2})/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : '';
};

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(SRC);

const ws = wb.getWorksheet(DATA_SHEET) ?? wb.worksheets[0];
const headerRow = ws.getRow(1);
const colIndex = {};
headerRow.eachCell((cell, col) => {
  const h = cellText(cell.value).trim();
  const def = COLUMNS.find((c) => c.header === h);
  if (def) colIndex[def.key] = col;
});

const missing = COLUMNS.filter((c) => !colIndex[c.key] && ['question', 'date'].includes(c.key));
if (missing.length) {
  console.error(`[data] 필수 헤더 없음: ${missing.map((c) => c.header).join(', ')}`);
  process.exit(1);
}

const items = [];
const warnings = [];
ws.eachRow((row, r) => {
  if (r === 1) return;
  const item = {};
  for (const c of COLUMNS) {
    const col = colIndex[c.key];
    const raw = col ? row.getCell(col).value : '';
    item[c.key] = c.key === 'date' ? toDate(raw instanceof Date ? raw : cellText(raw)) : cellText(raw).trim();
  }
  if (!item.question) return; // 빈 행 무시
  if (!item.date) warnings.push(`${r}행: 접수일 형식 확인 필요`);
  if (item.status && !STATUSES.includes(item.status)) warnings.push(`${r}행: 조치 상태 "${item.status}" (허용: ${STATUSES.join('/')})`);
  if (item.type && !TYPES.includes(item.type)) warnings.push(`${r}행: 유형 "${item.type}" (허용: ${TYPES.join('/')})`);
  if (!item.id) item.id = `R${String(r - 1).padStart(3, '0')}`;
  items.push(item);
});

// 설정 시트(선택): A열 항목, B열 값
const settings = {};
const ss = wb.getWorksheet(SETTINGS_SHEET);
if (ss) {
  ss.eachRow((row, r) => {
    if (r === 1) return;
    const k = cellText(row.getCell(1).value).trim();
    const v = row.getCell(2).value;
    if (k) settings[k] = v instanceof Date ? toDate(v) : cellText(v).trim();
  });
}

const latest = items.reduce((m, x) => (x.date > m ? x.date : m), '');
const out = {
  updated: toDate(settings['최신화일'] || '') || latest,
  items: items.sort((a, b) => b.date.localeCompare(a.date)),
};

await mkdir('public/data', { recursive: true });
await writeFile(OUT, JSON.stringify(out));
warnings.forEach((w) => console.warn(`[data] 경고 ${w}`));
console.log(`[data] ${items.length}건 → ${OUT} (최신화일 ${out.updated || '-'})`);
