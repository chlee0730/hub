import './style.css';
import { SITE, BRAND } from './config';

interface Voc {
  id: string; community: string; date: string; type: string; category: string;
  question: string; reason: string; answer: string; status: string;
  action: string; actionDetail: string; note: string;
}
interface Data { updated: string; items: Voc[] }

const ALL = '전체';
const STATUS_ORDER = ['완료', '진행중', '장기검토', '미정'] as const;
const STATUS_CLASS: Record<string, string> = { 완료: 'complete', 진행중: 'progress', 장기검토: 'long' };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const val = (s: string | undefined, fb = '미정') => (s ?? '').trim() || fb;
const clean = (s: string | undefined) => { const t = (s ?? '').trim(); return t === '-' ? '' : t; };
const dateText = (d: string) => { if (!d) return '-'; const [y, m, dd] = d.split('-'); return `${+y}. ${m}. ${dd}.`; };
const pct = (n: number, t: number) => (t ? (n / t) * 100 : 0);

const state = { search: '', status: ALL, community: ALL, type: ALL, category: ALL, limit: SITE.pageSize };
let D: Voc[] = [];
let counts: Record<string, number> = {};

function applyText() {
  $('utilityText').textContent = SITE.utility;
  $('eyebrow').textContent = SITE.eyebrow;
  $('pageTitle').textContent = SITE.title;
  $('pageDesc').textContent = SITE.description;
  $('footerText').textContent = SITE.footer;
  $('privacy').textContent = SITE.privacy;
  $<HTMLInputElement>('search').placeholder = SITE.searchPlaceholder;
}

const brandSrc = (k: keyof typeof BRAND) => `${import.meta.env.BASE_URL}${BRAND[k]}`;
let mascotOk = false;

function loadBrand() {
  document.querySelectorAll<HTMLImageElement>('img[data-brand]').forEach((img) => {
    const k = img.dataset.brand as keyof typeof BRAND;
    img.onload = () => { img.hidden = false; if (k === 'mascot') { mascotOk = true; if (D.length) render(); } };
    img.onerror = () => img.remove();
    img.src = brandSrc(k);
  });
}

function summary(updated: string) {
  const total = D.length, done = counts['완료'] ?? 0, act = counts['진행중'] ?? 0, long = counts['장기검토'] ?? 0;
  const withStatus = done + act + long;
  const n = (v: number) => `${v}<small>건</small>`;
  $('updated').textContent = $('footerUpdated').textContent = dateText(updated);
  $('totalMetric').innerHTML = n(total);
  $('completeMetric').innerHTML = n(done);
  $('activeMetric').innerHTML = n(act + long);
  $('rateBase').textContent = `상태 입력 ${withStatus}건 기준`;
  $('completeRate').textContent = `완료율 ${pct(done, withStatus).toFixed(1)}%`;
  $('progressTrack').innerHTML =
    `<i class="progress-complete" style="width:${pct(done, withStatus)}%"></i>` +
    `<i class="progress-active" style="width:${pct(act, withStatus)}%"></i>` +
    `<i class="progress-long" style="width:${pct(long, withStatus)}%"></i>`;
  $('progressNote').innerHTML = `<span class="c">완료 ${done}</span><span class="a">진행중 ${act}</span><span class="l">장기검토 ${long}</span>`;
}

function fillSelect(id: 'community' | 'type' | 'category') {
  const opts = [...new Set(D.map((x) => val(x[id])))].sort((a, b) => a.localeCompare(b, 'ko'));
  $(id).innerHTML = [ALL, ...opts].map((o) => `<option>${esc(o)}</option>`).join('');
}

function statusButtons() {
  const labels = [ALL, ...STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0)];
  $('statusList').innerHTML = labels
    .map((s) => `<button type="button" class="status-btn${state.status === s ? ' on' : ''}" data-status="${s}" aria-pressed="${state.status === s}"><span class="status-name">${s}</span><span class="status-count">${s === ALL ? D.length : counts[s]}</span></button>`)
    .join('');
}

const block = (title: string, text: string) => (text ? `<section class="block"><h4>${title}</h4><p>${esc(text)}</p></section>` : '');
const infoItem = (label: string, text: string) => (text ? `<div class="action-item"><span>${label}</span><strong>${esc(text)}</strong></div>` : '');

function card(x: Voc) {
  const st = val(x.status);
  return `<article class="case">
  <div class="case-top">
    <div class="meta"><span class="status ${STATUS_CLASS[st] ?? 'pending'}">${esc(st)}</span><span class="type">${esc(x.type)}</span><span class="meta-sep"></span><span>${esc(x.community)}</span><span>${dateText(x.date)}</span></div>
    <span class="case-id">${esc(x.id)}</span>
  </div>
  <div class="question-row"><h3 class="question">${esc(x.question)}</h3><span class="category">${esc(val(x.category, '분류 예정'))}</span></div>
  <details>
    <summary><span>공단 답변 및 조치 내용</span><span class="chev" aria-hidden="true">⌄</span></summary>
    <div class="detail-area">
      <div class="answer-box">${block('건의 사유', clean(x.reason))}${block('현장 응답 내용', val(x.answer, '답변 준비 중'))}</div>
      <aside class="info-box">${infoItem('조치 상태', st)}${infoItem('조치 구분', val(x.action))}${infoItem('조치 내용', clean(x.actionDetail))}${infoItem('비고', clean(x.note))}</aside>
    </div>
  </details>
</article>`;
}

function filtered() {
  const q = state.search.trim().toLocaleLowerCase('ko');
  return D.filter((x) =>
    (state.status === ALL || val(x.status) === state.status) &&
    (state.community === ALL || val(x.community) === state.community) &&
    (state.type === ALL || val(x.type) === state.type) &&
    (state.category === ALL || val(x.category) === state.category) &&
    (!q || Object.values(x).join(' ').toLocaleLowerCase('ko').includes(q)));
}

function render() {
  const out = filtered(), visible = out.slice(0, state.limit), left = out.length - visible.length;
  $('resultCount').textContent = `${out.length}건`;
  $('results').innerHTML = visible.length
    ? visible.map(card).join('')
    : `<div class="empty">${mascotOk ? `<img class="mascot-empty" src="${brandSrc('mascot')}" alt="">` : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7.5"/><path d="m20 20-3.8-3.8"/></svg>'}<h3>검색 결과가 없습니다</h3><p>검색어를 줄이거나 필터를 초기화해 주세요.</p><button type="button" class="primary-btn" data-action="reset">전체 VOC 보기</button></div>`;
  $('moreWrap').style.display = left > 0 ? 'flex' : 'none';
  $('more').textContent = left > 0 ? `${Math.min(SITE.pageSize, left)}건 더 보기 · ${left}건 남음` : '';

  const parts = [state.status !== ALL && `상태: ${state.status}`, state.community, state.type, state.category].filter((p) => p && p !== ALL);
  const af = $('activeFilter');
  af.textContent = parts.length ? `적용 중 · ${parts.join(' / ')}` : '';
  af.classList.toggle('show', parts.length > 0);
  $<HTMLButtonElement>('reset').disabled = !(state.search || parts.length);
  statusButtons();
}

function reset() {
  Object.assign(state, { search: '', status: ALL, community: ALL, type: ALL, category: ALL, limit: SITE.pageSize });
  $<HTMLInputElement>('search').value = '';
  (['community', 'type', 'category'] as const).forEach((id) => ($<HTMLSelectElement>(id).value = ALL));
  render();
}

function setFilterOpen(open: boolean, restoreFocus = false) {
  $('filterPanel').classList.toggle('open', open);
  $('filterBackdrop').classList.toggle('open', open);
  document.body.classList.toggle('filter-open', open);
  $('mobileFilter').setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => $('closeFilter').focus(), 0);
  else if (restoreFocus) $('mobileFilter').focus();
}

function bind() {
  $<HTMLInputElement>('search').addEventListener('input', (e) => { state.search = (e.target as HTMLInputElement).value; state.limit = SITE.pageSize; render(); });
  (['community', 'type', 'category'] as const).forEach((id) =>
    $(id).addEventListener('change', (e) => { state[id] = (e.target as HTMLSelectElement).value; state.limit = SITE.pageSize; render(); }));
  $('statusList').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.status-btn');
    if (b) { state.status = b.dataset.status!; state.limit = SITE.pageSize; render(); }
  });
  $('results').addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-action="reset"]')) reset(); });
  $('reset').addEventListener('click', reset);
  $('more').addEventListener('click', () => { state.limit += SITE.pageSize; render(); });
  $('mobileFilter').addEventListener('click', () => setFilterOpen(true));
  $('closeFilter').addEventListener('click', () => setFilterOpen(false, true));
  $('filterBackdrop').addEventListener('click', () => setFilterOpen(false, true));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('filter-open')) setFilterOpen(false, true); });
  matchMedia('(min-width:681px)').addEventListener('change', (e) => { if (e.matches) setFilterOpen(false); });
  $('homeButton').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}

async function init() {
  applyText();
  bind();
  loadBrand();
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/voc.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    const data: Data = await res.json();
    D = data.items;
    counts = {};
    D.forEach((x) => { const s = val(x.status); counts[s] = (counts[s] ?? 0) + 1; });
    summary(data.updated);
    (['community', 'type', 'category'] as const).forEach(fillSelect);
    render();
  } catch (err) {
    $('results').innerHTML = `<div class="empty"><h3>데이터를 불러오지 못했습니다</h3><p>잠시 후 다시 시도해 주세요. (${esc(err)})</p></div>`;
  }
}

init();
