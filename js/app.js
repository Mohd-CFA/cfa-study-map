import * as S from './store.js';
import { PARSERS } from './parsers.js';

const MID = 'FSA-LM01';
let D, P;                                   // module data, user progress
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const view = () => $('#view');

const REC = {
  'S':   { cls: 'rec-S',  label: '🟢 Schweser',          tip: 'التوصية: ذاكر الـ LOS ده من Schweser بس.\nاضغط لفتح Schweser على أول صفحة الـ LOS.' },
  'C':   { cls: 'rec-C',  label: '🔵 Curriculum',        tip: 'التوصية: ذاكر الـ LOS ده من الـ Curriculum بدل Schweser.\nاضغط لفتح الـ Curriculum على أول صفحة الـ LOS.' },
  'S+X': { cls: 'rec-SX', label: '🟡 Schweser + Extras', tip: 'التوصية: اقرا Schweser، وبعدها إضافات الـ Curriculum اللي تحت الـ LOS بس.\nاضغط لفتح Schweser، والإضافات هتظهر جنب الملف.' },
};
const SRC = [
  { key: 'Curriculum', col: 'q_curriculum', short: 'CUR', tip: 'أسئلة الـ Curriculum (Practice Problems)' },
  { key: 'Schweser QBank', col: 'q_schweser_qbank', short: 'SQB', tip: 'أسئلة Schweser QBank' },
  { key: 'Schweser Quiz', col: 'q_schweser_quiz', short: 'SQZ', tip: 'Module Quiz جوه كتاب Schweser' },
  { key: 'UWorld', col: 'q_uworld', short: 'UW', tip: 'أسئلة UWorld' },
  { key: 'AnalystPrep', col: 'q_analystprep', short: 'AP', tip: 'أسئلة AnalystPrep' },
];
const PRI_TIP = {
  Must: 'Must: معلومة ممكن تيجي في الامتحان، مكتوبة كاملة.', Useful: 'Useful: بتساعدك تفهم، مكتوبة كاملة ومش لازم تحفظها.',
  Example: 'Example: مثال من الكتاب، ملخص قصير.', Skip: 'Skip: تفصيلة مش محتاجها للامتحان، العنوان بس.'
};
const DIR_TIP = { CUR: 'الـ Curriculum بيضيفها: اقراها لو بتذاكر من Schweser.', SCH: 'Schweser بيضيفها: اقراها لو بتذاكر من الـ Curriculum.' };

// ---------------- boot ----------------
(async function init() {
  D = (await S.get('kv', 'data:' + MID)) || await (await fetch('data/' + MID + '.json')).json();
  P = await S.loadProgress(MID);
  $('#mod-title').textContent = `${D.module.subject} · LM${D.module.lm_no} — ${D.module.title}`;
  window.addEventListener('hashchange', route); route();
})();
const save = () => S.saveProgress(MID, P);
const losBy = id => D.los.find(l => l.los_id === id || l.los_code === id);
const extrasOf = (id, dir) => D.extras.filter(x => x.los_id === id && (!dir || x.direction === dir));
const conflictsOf = id => D.conflicts.filter(c => c.los_id === id);

// ---------------- tooltip: hover explains ----------------
const tip = $('#tip');
document.addEventListener('mouseover', e => {
  const el = e.target.closest('[data-tip]'); if (!el) return tip.classList.remove('show');
  tip.textContent = typeof el.dataset.tip === 'string' && el.dataset.tip.startsWith('fn:') ? TIPFN[el.dataset.tip.slice(3)](el) : el.dataset.tip;
  tip.classList.add('show');
});
document.addEventListener('mousemove', e => {
  if (!tip.classList.contains('show')) return;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.min(e.clientX + 14, innerWidth - w - 8) + 'px';
  tip.style.top = (e.clientY + 18 + h > innerHeight ? e.clientY - h - 12 : e.clientY + 18) + 'px';
});
const TIPFN = {
  hist(el) {
    const h = S.history(P, el.dataset.ref);
    if (!h.n) return 'السؤال ده ما اتحلش قبل كده.';
    return `اتحل ${h.n} مرة\nصح: ${h.correct} · غلط: ${h.wrong}\nأول محاولة: ${h.first.ok ? 'صح' : 'غلط'} · آخر محاولة: ${h.last.ok ? 'صح' : 'غلط'}\nآخر مرة: ${new Date(h.last.t).toLocaleDateString()}`;
  }
};

// ---------------- click: activates ----------------
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]'); if (go) { location.hash = go.dataset.go; return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  ACT[el.dataset.act]?.(el.dataset, el, e);
});
const ACT = {
  open: d => location.hash = `#read/${d.src}/${d.page}/${d.los || ''}`,
  toggleExtras: d => { const b = $('#xb-' + d.los); b.hidden = !b.hidden; },
  conflicts: d => location.hash = '#conflicts/' + d.los,
  practice: d => location.hash = `#practice/${d.los || ''}/${encodeURIComponent(d.src || '')}`,
  pref: d => { const o = ['', 'S', 'C', 'S+X']; const L = (P.los[d.los] ||= {}); L.pref = o[(o.indexOf(L.pref || '') + 1) % o.length]; save(); route(); },
  done: d => { const L = (P.los[d.los] ||= {}); L.done = !L.done; save(); route(); },
  pri: d => { FILTER.pri = FILTER.pri === d.pri ? '' : d.pri; route(); },
  dir: d => { FILTER.dir = FILTER.dir === d.dir ? '' : d.dir; route(); },
  flag: (d, el) => { P.flags[d.ref] ? delete P.flags[d.ref] : (P.flags[d.ref] = Date.now()); save();
    el.className = 'icon ' + (P.flags[d.ref] ? 'flag-on' : 'flag-off'); },
  print: () => window.print(),
  clear: () => { FILTER.pri = FILTER.dir = ''; route(); },
};
const FILTER = { pri: '', dir: '' };

// ---------------- router ----------------
function route() {
  let [r, ...a] = (location.hash || '#map').slice(1).split('/');
  document.querySelectorAll('.top nav a').forEach(x => x.classList.toggle('on', x.getAttribute('href') === '#' + r));
  tip.classList.remove('show'); view().onchange = null;
  a = a.map(decodeURIComponent);
  ({ map: vMap, read: vRead, extras: vExtras, conflicts: vConflicts, practice: vPractice, files: vFiles, print: vPrint }[r] || vMap)(...a);
}

// ---------------- Study Map ----------------
function bar(pct, color, label) {
  return `<span data-tip="${label}: تغطية حوالي ${pct}% من اللي ممكن ييجي في الامتحان على الـ LOS ده (تقدير المنتور)">
    <span class="bar"><i style="width:${pct}%;background:${color}"></i></span> <small>${label} ${pct}%</small></span>`;
}
function losCard(l) {
  const r = REC[l.recommendation]; const L = P.los[l.los_id] || {};
  const page = l.recommendation === 'C' ? l.curr_pdf_from : l.sch_page_from, src = l.recommendation === 'C' ? 'curriculum' : 'schweser';
  const nMust = extrasOf(l.los_id).filter(x => x.priority === 'Must').length;
  const qb = SRC.map(s => `<span class="badge b-q ${l[s.col] ? '' : 'zero'}" data-act="practice" data-los="${l.los_id}" data-src="${s.key}"
      data-tip="${s.tip} على الـ LOS ده: ${l[s.col] || 0}\nاضغط لحلهم.">${s.short} ${l[s.col] || 0}</span>`).join('');
  return `<div class="card los">
   <div><div class="code">${l.los_code}</div>
     <span class="badge ${L.done ? 'b-done' : 'b-todo'}" data-act="done" data-los="${l.los_id}"
       data-tip="${L.done ? 'خلصت مذاكرة الـ LOS ده. اضغط للإلغاء.' : 'لسه ما خلصتش الـ LOS ده. اضغط لما تخلصه.'}">${L.done ? '✓ Done' : '○ To do'}</span></div>
   <div><div><b>${esc(l.los_text)}</b></div>
     <div class="row" style="margin-top:6px">${bar(l.schweser_coverage_pct, 'var(--S)', 'Schweser')} ${bar(l.curriculum_coverage_pct, 'var(--C)', 'Curriculum')}</div>
     <div class="why">${esc(l.why_recommended)}</div><div class="whynot">ليه مش المصدر التاني: ${esc(l.why_not_other)}</div>
     <div class="row" style="margin-top:8px">
       <button class="btn ghost" data-act="open" data-src="schweser" data-page="${l.sch_page_from}" data-los="${l.los_id}"
         data-tip="يفتح Schweser على صفحة ${l.sch_page_from} (أول الـ LOS)، والإضافات بتاعة الـ Curriculum جنبه">Open Schweser p.${l.sch_page_from}</button>
       <button class="btn ghost" data-act="open" data-src="curriculum" data-page="${l.curr_pdf_from}" data-los="${l.los_id}"
         data-tip="يفتح الـ Curriculum على الصفحة المطبوعة ${l.curr_printed_from} (صفحة ${l.curr_pdf_from} في الملف)، وإضافات Schweser جنبه">Open Curriculum p.${l.curr_printed_from}</button>
     </div>
     <div id="xb-${l.los_id}" hidden>${extrasHTML(extrasOf(l.los_id))}</div></div>
   <div style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">
     <span class="badge ${r.cls}" data-act="open" data-src="${src}" data-page="${page}" data-los="${l.los_id}" data-tip="${r.tip}">${r.label}</span>
     <span class="badge b-pref" data-act="pref" data-los="${l.los_id}" data-tip="اختيارك إنت للـ LOS ده بعد ما تذاكره.\nاضغط عشان تغيّره: Schweser ← Curriculum ← Schweser + Extras ← من غير اختيار.">Mine: ${L.pref || '—'}</span>
     <span class="badge b-must" data-act="toggleExtras" data-los="${l.los_id}" data-tip="${nMust} إضافة Must من أصل ${extrasOf(l.los_id).length} على الـ LOS ده.\nاضغط لعرضها تحت الـ LOS أو إخفائها.">＋ ${nMust} Must</span>
     ${l.n_conflicts ? `<span class="badge b-conf" data-act="conflicts" data-los="${l.los_id}" data-tip="${l.n_conflicts} نقطة الكتابين مختلفين فيها.\nاضغط لعرضها ومعرفة تعتمد على أنهي واحد.">⚠ ${l.n_conflicts}</span>` : ''}
     <div class="row" style="justify-content:flex-end">${qb}</div></div>
  </div>`;
}
function vMap() {
  const done = D.los.filter(l => P.los[l.los_id]?.done).length, tq = D.los.reduce((a, l) => a + (l.q_total || 0), 0);
  view().innerHTML = `<div class="row" style="justify-content:space-between"><div><h1>Study Map</h1>
    <div class="mut">${done}/${D.los.length} LOS done · ${tq} questions on this module · v${D.module.version}</div></div>
    <div class="row noprint"><button class="btn ghost" data-go="#print" data-tip="يطلّع كل الإضافات والاختلافات في صفحة واحدة تطبعها أو تحفظها PDF">Export PDF</button></div></div>
    ${D.los.map(losCard).join('')}`;
}

// ---------------- Extras / Conflicts ----------------
function extrasHTML(list) {
  return list.map(x => `<div class="extra ${x.priority}"><h4>
    <span class="pri ${x.priority}" data-act="pri" data-pri="${x.priority}" data-tip="${PRI_TIP[x.priority]}\nاضغط لعرض الـ ${x.priority} بس.">${x.priority}</span>
    <span class="dir" data-act="dir" data-dir="${x.direction}" data-tip="${DIR_TIP[x.direction]}\nاضغط للفلترة.">${x.direction === 'CUR' ? 'Curriculum adds' : 'Schweser adds'}</span>
    ${esc(x.title)}</h4>
    ${x.priority === 'Skip' ? '' : `<div>${esc(x.full_text)}</div>`}
    <div class="row mut" style="font-size:12px;margin-top:4px">
      <span class="badge b-q" data-act="open" data-src="${x.direction === 'SCH' ? 'schweser' : 'curriculum'}" data-page="${x.pdf_page}" data-los="${x.los_id}"
        data-tip="يفتح النص الأصلي في ${x.page_source} صفحة ${x.printed_page}">${x.page_source} p.${x.printed_page} →</span>
      ${x.exam_link ? `<span>Tested: ${esc(x.exam_link)}</span>` : ''}</div></div>`).join('');
}
function vExtras() {
  const list = D.extras.filter(x => (!FILTER.pri || x.priority === FILTER.pri) && (!FILTER.dir || x.direction === FILTER.dir));
  view().innerHTML = `<h1>Extras</h1><div class="mut">Schweser + "Curriculum adds" = Curriculum + "Schweser adds" = تغطية كاملة للامتحان.
    ${FILTER.pri || FILTER.dir ? ` · فلتر: ${FILTER.pri} ${FILTER.dir} <a href="#extras" data-act="clear">إلغاء</a>` : ''}</div>
    ${D.los.map(l => { const xs = list.filter(x => x.los_id === l.los_id); return xs.length ? `<h2>${l.los_code} — ${esc(l.los_text)}</h2>${extrasHTML(xs)}` : ''; }).join('')}`;
}
function conflictsTable(list) {
  return `<table><tr><th>LOS</th><th>Topic</th><th>Schweser</th><th>Curriculum</th><th>Use for exam</th><th>Risk</th></tr>
   ${list.map(c => `<tr><td>${losBy(c.los_id).los_code}</td><td><b>${esc(c.topic)}</b>${c.qbank_evidence ? `<div class="mut" style="font-size:12px">${esc(c.qbank_evidence)}</div>` : ''}</td>
   <td>${esc(c.schweser_says)} <span class="badge b-q" data-act="open" data-src="schweser" data-page="${c.sch_page}" data-tip="يفتح Schweser صفحة ${c.sch_page}">p.${c.sch_page}</span></td>
   <td>${esc(c.curriculum_says)} <span class="badge b-q" data-act="open" data-src="curriculum" data-page="${c.curr_printed_page - 2}" data-tip="يفتح الـ Curriculum صفحة ${c.curr_printed_page}">p.${c.curr_printed_page}</span></td>
   <td><b>${esc(c.use_for_exam)}</b></td><td class="risk-${c.exam_risk}" data-tip="احتمال إن الاختلاف ده يغيّر إجابتك في الامتحان">${c.exam_risk}</td></tr>`).join('')}</table>`;
}
function vConflicts(los) {
  const list = D.conflicts.filter(c => !los || c.los_id === los);
  view().innerHTML = `<h1>Conflicts ${los ? '— ' + losBy(los).los_code : ''}</h1>
   ${los ? '<a href="#conflicts">عرض الكل</a>' : ''}${conflictsTable(list)}`;
}

// ---------------- Reader ----------------
const urls = {};
async function fileURL(slot) {
  if (urls[slot]) return urls[slot];
  const b = await S.get('files', MID + ':' + slot); if (!b) return null;
  return (urls[slot] = URL.createObjectURL(b));
}
async function vRead(src, page, los) {
  const url = await fileURL(src);
  const l = los && losBy(los);
  const other = src === 'schweser' ? 'CUR' : 'SCH';
  view().innerHTML = `<div class="row noprint" style="margin-bottom:8px"><button class="btn ghost" data-go="#map">← Study Map</button>
    <b>${src === 'schweser' ? 'Schweser' : 'Curriculum'} · page ${page}</b>${l ? ` · LOS ${l.los_code}` : ''}</div>
   <div class="reader">${url ? `<iframe src="${url}#page=${page}"></iframe>` :
     `<div class="card warn">ملف ${src} مش مرفوع لسه. <a href="#files">ارفعه من صفحة Files</a>.</div>`}
   <div class="side">${l ? `<div class="card"><b>${l.los_code}</b> — ${esc(l.los_text)}</div>
     <h2 data-tip="${DIR_TIP[other]}">${other === 'CUR' ? 'Curriculum adds' : 'Schweser adds'} (${extrasOf(l.los_id, other).length})</h2>${extrasHTML(extrasOf(l.los_id, other))}
     ${conflictsOf(l.los_id).length ? `<h2>⚠ Conflicts</h2>${conflictsOf(l.los_id).map(c => `<div class="extra Must"><b>${esc(c.topic)}</b><div>Exam: ${esc(c.use_for_exam)}</div></div>`).join('')}` : ''}`
     : '<div class="mut">افتح الملف من خريطة الـ LOS عشان الإضافات تظهر هنا.</div>'}</div></div>`;
}

// ---------------- Print ----------------
function vPrint() {
  view().innerHTML = `<div class="row noprint"><button class="btn" data-act="print">Print / Save as PDF</button><button class="btn ghost" data-go="#map">Back</button></div>
   <h1>${D.module.module_id} — ${esc(D.module.title)}</h1><div class="mut">Extras and conflicts · v${D.module.version}</div>
   ${D.los.map(l => `<h2>${l.los_code} · ${REC[l.recommendation].label}</h2><div class="mut">${esc(l.los_text)}</div><p>${esc(l.why_recommended)}</p>
     ${extrasHTML(extrasOf(l.los_id))}${conflictsOf(l.los_id).length ? conflictsTable(conflictsOf(l.los_id)) : ''}`).join('')}`;
}

// ---------------- Questions ----------------
let SESSION = null;
async function loadedQuestions() {
  const out = [];
  for (const q of D.questions) { const t = await S.get('questions', q.question_ref); if (t) out.push({ ...q, ...t }); }
  return out;
}
const statusOf = q => { const h = S.history(P, q.question_ref); return { h, wrong: h.wrong > 0, flag: !!P.flags[q.question_ref], un: h.n === 0 }; };
async function vPractice(los = '', src = '') {
  if (los === 'run') return renderQ();
  const all = await loadedQuestions();
  view().innerHTML = `<h1>Questions</h1>
   <div class="mut">${all.length} of ${D.questions.length} questions imported${all.length < D.questions.length ? ' · <a href="#files">استورد الباقي من Files</a>' : ''}</div>
   <div class="card filters">
    <div class="row"><b>LOS</b> ${D.los.map(l => `<label><input type="checkbox" name="los" value="${l.los_id}" ${!los || los === l.los_id ? 'checked' : ''}> ${l.los_code}</label>`).join('')}</div>
    <div class="row"><b>Source</b> ${SRC.map(s => `<label data-tip="${s.tip}"><input type="checkbox" name="src" value="${s.key}" ${!src || src === s.key ? 'checked' : ''}> ${s.key}</label>`).join('')}</div>
    <div class="row"><b>Status</b>
      <label data-tip="كل الأسئلة"><input type="radio" name="st" value="all" checked> All</label>
      <label data-tip="أسئلة ما اتحلتش قبل كده"><input type="radio" name="st" value="un"> Unanswered</label>
      <label data-tip="أي سؤال اتحل غلط ولو مرة، حتى لو حليته صح بعد كده"><input type="radio" name="st" value="wrong"> Wrong</label>
      <label data-tip="الأسئلة اللي عليها 🚩. بتفضل هنا لحد ما تشيل العلامة بنفسك، حتى لو حليتها صح"><input type="radio" name="st" value="flag"> Flagged</label></div>
    <div class="row"><label data-tip="الأسئلة اللي تبع موديولات جاية أو تفاصيل برا المنهج"><input type="checkbox" id="scope"> Include out-of-scope</label>
      <label>Count <select id="cnt"><option>10</option><option selected>20</option><option>40</option><option value="999">All</option></select></label>
      <label><input type="checkbox" id="shuf" checked> Shuffle</label>
      <button class="btn" id="go">Start</button> <span id="nq" class="mut"></span></div></div>
   <div class="row"><span class="mut">Wrong: ${all.filter(q => statusOf(q).wrong).length} · Flagged: ${all.filter(q => statusOf(q).flag).length} · Unanswered: ${all.filter(q => statusOf(q).un).length}</span></div>`;
  const pick = () => {
    const ls = [...document.querySelectorAll('[name=los]:checked')].map(x => x.value), ss = [...document.querySelectorAll('[name=src]:checked')].map(x => x.value);
    const st = $('[name=st]:checked').value, sc = $('#scope').checked;
    return all.filter(q => ls.includes(q.los_id) && ss.some(s => s === 'Curriculum' ? q.source.startsWith('Curriculum') : q.source === s)
      && (sc || q.scope === 'In LM1') && (st === 'all' || (st === 'un' && statusOf(q).un) || (st === 'wrong' && statusOf(q).wrong) || (st === 'flag' && statusOf(q).flag)));
  };
  const upd = () => $('#nq').textContent = pick().length + ' match';
  view().onchange = upd; upd();
  $('#go').onclick = () => {
    let qs = pick(); if ($('#shuf').checked) qs = qs.sort(() => Math.random() - .5);
    qs = qs.slice(0, +$('#cnt').value); if (!qs.length) return;
    SESSION = { qs, i: 0, ans: {} }; location.hash = '#practice/run';
  };
}
function renderQ() {
  if (!SESSION) return (location.hash = '#practice');
  const { qs, i } = SESSION, q = qs[i], a = SESSION.ans[q.question_ref], l = losBy(q.los_id);
  const done = Object.keys(SESSION.ans).length, right = Object.values(SESSION.ans).filter(x => x.ok).length;
  view().innerHTML = `<div class="row" style="justify-content:space-between"><div class="mut">Question ${i + 1} of ${qs.length} · ${done} answered · ${right} correct</div>
     <button class="btn ghost" data-go="#practice">End session</button></div>
   <div class="card"><div class="row" style="justify-content:space-between">
     <div class="row"><span class="badge b-q" data-tip="المصدر ورقم السؤال فيه">${q.source} #${q.q_no}</span>
       <span class="badge ${REC[l.recommendation].cls}" data-act="open" data-src="${l.recommendation === 'C' ? 'curriculum' : 'schweser'}" data-page="${l.recommendation === 'C' ? l.curr_pdf_from : l.sch_page_from}" data-los="${l.los_id}" data-tip="الـ LOS بتاع السؤال. اضغط لفتح المصدر الموصى بيه على صفحته.">LOS ${l.los_code}</span>
       ${q.scope !== 'In LM1' ? `<span class="badge b-conf" data-tip="السؤال ده: ${esc(q.scope)}">${esc(q.scope)}</span>` : ''}</div>
     <div><span class="icon" data-tip="fn:hist" data-ref="${q.question_ref}">ⓘ</span>
       <span class="icon ${P.flags[q.question_ref] ? 'flag-on' : 'flag-off'}" data-act="flag" data-ref="${q.question_ref}" data-tip="🚩 علّم السؤال. هيفضل في قايمة Flagged لحد ما تشيل العلامة بنفسك، حتى لو حليته صح.\nاضغط للتعليم أو الإلغاء.">🚩</span></div></div>
   <p class="q">${esc(q.stem)}</p>
   ${['A', 'B', 'C'].map(k => `<label class="opt ${a ? (k === q.answer ? 'ok' : k === a.choice ? 'no' : '') : ''}" data-k="${k}"><b>${k}.</b> ${esc(q.options[k])}</label>`).join('')}
   ${a ? `<div class="card" style="margin-top:10px"><b class="${a.ok ? 'ok' : 'no'}">${a.ok ? '✓ Correct' : '✗ Incorrect'}</b> · Answer: <b>${q.answer}</b>
       ${q.mentor_note ? `<div class="warn" style="margin:8px 0">Mentor: ${esc(q.mentor_note)}</div>` : ''}
       ${q.quality_flag ? `<div class="warn" style="margin:8px 0" data-tip="ملاحظة على جودة السؤال من المنتور">Quality: ${esc(q.quality_flag)}</div>` : ''}
       <div>${esc(q.explanation)}</div>
       ${!a.ok ? `<div class="row" style="margin-top:8px"><span class="mut">راجع:</span>
          <button class="btn ghost" data-act="open" data-src="schweser" data-page="${l.sch_page_from}" data-los="${l.los_id}">Schweser ${l.los_code}</button>
          <button class="btn ghost" data-act="open" data-src="curriculum" data-page="${l.curr_pdf_from}" data-los="${l.los_id}">Curriculum ${l.los_code}</button>
          ${l.n_conflicts ? `<button class="btn ghost" data-act="conflicts" data-los="${l.los_id}">⚠ Conflicts</button>` : ''}</div>` : ''}</div>` : ''}
   <div class="row" style="margin-top:10px"><button class="btn ghost" id="prev" ${i ? '' : 'disabled'}>← Prev</button>
     ${a ? '' : '<button class="btn" id="sub" disabled>Submit</button>'}
     <button class="btn ghost" id="next" ${i < qs.length - 1 ? '' : 'disabled'}>Next →</button></div></div>`;
  let choice = null;
  if (!a) view().querySelectorAll('.opt').forEach(o => o.onclick = () => {
    view().querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); o.classList.add('sel'); choice = o.dataset.k; $('#sub').disabled = false; });
  $('#sub') && ($('#sub').onclick = () => {
    const ok = choice === q.answer; SESSION.ans[q.question_ref] = { choice, ok };
    (P.attempts[q.question_ref] ||= []).push({ t: Date.now(), choice, ok }); save(); renderQ(); });
  $('#prev').onclick = () => { SESSION.i--; renderQ(); };
  $('#next').onclick = () => { SESSION.i++; renderQ(); };
}

// ---------------- Files & import ----------------
const IMPORT_SRC = { CURRICULUM: 'Curriculum', SCHWESER: 'Schweser QBank', UWORLD: 'UWorld', ANALYSTPREP: 'AnalystPrep' };
async function vFiles() {
  const has = async k => !!(await S.get('files', MID + ':' + k));
  const counts = {}; for (const q of D.questions) if (await S.get('questions', q.question_ref)) counts[q.source] = (counts[q.source] || 0) + 1;
  const total = s => D.questions.filter(q => q.source === s).length;
  view().innerHTML = `<h1>Files</h1><div class="mut">كل الملفات بتتحفظ على جهازك بس (IndexedDB)، ومفيش حاجة بتترفع لأي سيرفر.</div>
   <div class="card"><h2>Study files</h2>
    ${['schweser', 'curriculum'].map(k => `<div class="row" style="margin:6px 0"><b style="width:120px">${k === 'schweser' ? 'Schweser' : 'Curriculum'}</b>
      <input type="file" accept="application/pdf" data-slot="${k}"> <span id="st-${k}"></span></div>`).join('')}</div>
   <div class="card"><h2>Question banks</h2><div class="mut">ارفع ملف الأسئلة اللي فيه الإجابات. الموقع بيقرا الأسئلة من الملف ويربطها بالـ LOS.</div>
    ${Object.entries(IMPORT_SRC).map(([k, s]) => `<div class="row" style="margin:6px 0"><b style="width:120px">${s}</b>
      <input type="file" accept="application/pdf" data-imp="${k}"> <span class="mut">${counts[s] || 0}/${total(s)} imported</span> <span id="im-${k}"></span></div>`).join('')}
    <div class="mut" style="font-size:12px">Schweser: ملف 4.1 (Answers) · UWorld: ملف 5 (فيه علامة ✔) · AnalystPrep: ملف 6.1 · Curriculum: ملف Practices</div></div>
   <div class="card"><h2>Study Map (Excel)</h2><div class="mut">لو عدّلت ملف الإكسل، ارفعه هنا والموقع يتحدث.</div>
    <input type="file" accept=".xlsx" id="xl"> <span id="xl-st"></span>
    <button class="btn ghost" id="xl-reset" data-tip="يرجّع الخريطة للنسخة اللي جاية مع الموقع">Use bundled version</button></div>`;
  for (const k of ['schweser', 'curriculum']) $('#st-' + k).innerHTML = (await has(k)) ? '<span class="ok">✓ saved</span>' : '<span class="mut">not uploaded</span>';
  view().querySelectorAll('[data-slot]').forEach(inp => inp.onchange = async () => {
    await S.put('files', MID + ':' + inp.dataset.slot, inp.files[0]); delete urls[inp.dataset.slot]; vFiles(); });
  view().querySelectorAll('[data-imp]').forEach(inp => inp.onchange = () => importQB(inp.dataset.imp, inp.files[0]));
  $('#xl').onchange = () => importXlsx($('#xl').files[0]);
  $('#xl-reset').onclick = async () => { await S.del('kv', 'data:' + MID); location.reload(); };
}
let pdfjs;
async function pdfText(file) {
  pdfjs ||= await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; let out = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent(); let last = null;
    for (const it of tc.items) { if (last !== null) out += Math.abs(it.transform[5] - last) > 2 ? '\n' : ' '; out += it.str; last = it.transform[5]; }
    out += `\n<<PAGE ${p}>>\n`;
  }
  return out;
}
async function importQB(kind, file) {
  const st = $('#im-' + kind); st.textContent = 'reading…';
  try {
    const parsed = PARSERS[kind](await pdfText(file)); const src = IMPORT_SRC[kind];
    const idx = D.questions.filter(q => q.source === src);
    let n = 0; const miss = [], diff = [];
    for (const p of parsed) {
      const q = idx.find(x => x.q_no === p.qno); if (!q) { miss.push(p.qno); continue; }
      if (p.answer && p.answer !== q.answer) diff.push(p.qno);
      await S.put('questions', q.question_ref, { stem: p.stem, options: p.options, explanation: p.explanation }); n++;
    }
    st.innerHTML = `<span class="ok">✓ ${n}/${idx.length} imported</span>${miss.length ? ` · not in index: ${miss.join(', ')}` : ''}${diff.length ? ` · <span class="no">answer differs from index: ${diff.join(', ')}</span>` : ''}`;
  } catch (e) { st.innerHTML = `<span class="no">Error: ${esc(e.message)}</span>`; }
}
async function importXlsx(file) {
  const X = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
  const wb = X.read(await file.arrayBuffer()); const rows = n => X.utils.sheet_to_json(wb.Sheets[n], { defval: null });
  const d = { module: rows('Module')[0], los: rows('LOS'), extras: rows('Extras'), conflicts: rows('Conflicts'), questions: rows('Questions'), sources: rows('Sources') };
  if (d.module.module_id !== MID) return ($('#xl-st').innerHTML = `<span class="no">ملف ${esc(d.module.module_id)} مش ${MID}</span>`);
  await S.put('kv', 'data:' + MID, d); location.reload();
}
