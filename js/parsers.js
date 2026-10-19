// Question-bank PDF parsers. Text is extracted in the browser from the user's own PDFs.
// Each parser returns [{qno, stem, options:{A,B,C}, answer|null, explanation}]

const LIG = [[/\s{2,}(nanc)/g, ' fi$1'], [/\s{2,}(rst\b)/g, ' fi$1'], [/\s{2,}(rms?\b)/g, ' fi$1'],
  [/\s{2,}(xed)/g, ' fi$1'], [/\s{2,}(scal)/g, ' fi$1'], [/\s{2,}(gure)/g, ' fi$1'], [/\s{2,}(eld)/g, ' fi$1'],
  [/\s{2,}(ows?\b)/g, ' fl$1'], [/\s{2,}(exib)/g, ' fl$1'], [/\s{2,}(uctu)/g, ' fl$1']];

export function clean(s) {
  if (!s) return '';
  let t = s;
  for (const [re, rep] of LIG) t = t.replace(re, rep);
  t = t.replace(/(\w) -\n(\w)/g, '$1$2')         // hyphenated line breaks "in -\nvolve"
       .replace(/[ \t]*\n[ \t]*/g, ' ')
       .replace(/\s{2,}/g, ' ')
       .replace(/\s+([.,;:?)])/g, '$1')
       .trim();
  return t;
}

function splitOptions(body, style) {
  // style 'dot' => "A. ", 'paren' => "A) "
  const re = style === 'paren' ? /(?:^|\n)\s*([ABC])\)\s*/g : /(?:^|\n)\s*([ABC])\.\s+/g;
  const idx = []; let m;
  while ((m = re.exec(body))) idx.push({ k: m[1], s: m.index, e: re.lastIndex });
  // keep the first A,B,C sequence in order
  const seq = [];
  for (const i of idx) { const want = 'ABC'[seq.length]; if (i.k === want) seq.push(i); if (seq.length === 3) break; }
  if (seq.length < 3) return null;
  return { pre: body.slice(0, seq[0].s), seq };
}

// ---------- UWorld (file with ✔ marks) ----------
export function parseUWorld(text) {
  const blocks = ('\n' + text).split(/\n\s*Question (\d+) of \d+\s*\n/);
  const out = [];
  for (let i = 1; i < blocks.length; i += 2) {
    const qno = +blocks[i]; const b = blocks[i + 1].replace(/<<PAGE \d+>>/g, '');
    const [qpart, ...exp] = b.split(/\n\s*Explanation:\s*\n/);
    const sp = splitOptions(qpart, 'dot'); if (!sp) continue;
    const opts = {}; let answer = null;
    sp.seq.forEach((o, j) => {
      const end = j < 2 ? sp.seq[j + 1].s : qpart.length;
      let t = qpart.slice(o.e, end);
      if (t.includes('✔')) { answer = o.k; t = t.replace('✔', ''); }
      opts[o.k] = clean(t);
    });
    out.push({ qno, stem: clean(sp.pre), options: opts, answer, explanation: clean(exp.join(' ')) });
  }
  return out;
}

// ---------- Schweser QBank (answers file) ----------
export function parseSchweser(text) {
  const blocks = text.replace(/<<PAGE \d+>>/g, '\n').split(/Question #(\d+) of \d+\s*/);
  const out = [];
  for (let i = 1; i < blocks.length; i += 2) {
    const qno = +blocks[i];
    let b = blocks[i + 1].replace(/Question ID:\s*\d+/, '');
    const [qpart, ...exp] = b.split(/\n\s*Explanation\s*\n/);
    const sp = splitOptions('\n' + qpart, 'paren'); if (!sp) continue;
    const opts = {};
    const q = '\n' + qpart;
    sp.seq.forEach((o, j) => { const end = j < 2 ? sp.seq[j + 1].s : q.length; opts[o.k] = clean(q.slice(o.e, end)); });
    let ex = exp.join(' '); const los = (ex.match(/LOS\s+(\d+\.[a-z])/) || [])[1] || null;
    ex = ex.replace(/\(Module[^)]*\)/, '');
    out.push({ qno, stem: clean(sp.pre), options: opts, answer: null, explanation: clean(ex), los });
  }
  return out;
}

// ---------- CFA Curriculum practice problems ----------
export function parseCurriculum(text) {
  const t = text.replace(/<<PAGE \d+>>/g, '\n').replace(/©\s*CFA Institute[^\n]*/g, '')
    .replace(/\n\s*(Learning Module \d+[^\n]*|Practice Problems[^\n]*|Solutions\s+\d+)\s*\n/g, '\n');
  const [pp, sol = ''] = t.split(/\n\s*SOLUTIONS\s*\n/);
  const probs = pp.split(/\n\s*(\d{1,2})\.\s+/); const out = [];
  for (let i = 1; i < probs.length; i += 2) {
    const qno = +probs[i]; const body = '\n' + probs[i + 1];
    const sp = splitOptions(body, 'dot'); if (!sp) continue;
    const opts = {};
    sp.seq.forEach((o, j) => { const end = j < 2 ? sp.seq[j + 1].s : body.length; opts[o.k] = clean(body.slice(o.e, end)); });
    out.push({ qno, stem: clean(sp.pre), options: opts, answer: null, explanation: '' });
  }
  const sols = ('\n' + sol).split(/\n\s*(\d{1,2})\.\s+/);
  for (let i = 1; i < sols.length; i += 2) {
    const q = out.find(x => x.qno === +sols[i]); if (!q) continue;
    const m = sols[i + 1].match(/^\s*([ABC]) is correct\.\s*/);
    if (m) q.answer = m[1];
    q.explanation = clean(sols[i + 1]);
  }
  return out;
}

// ---------- AnalystPrep (answers file) ----------
export function parseAnalystPrep(text) {
  const t = text.replace(/<<PAGE \d+>>/g, '\n').replace(/©\s*2014-\d{4}\s*AnalystPrep\.?\s*\n\s*\d+\s*\n/g, '\n')
    .replace(/Learning Module 1: Introduction[^\n]*\n/, '\n');
  const blocks = t.split(/\n\s*Q\.(\d+)\s+/); const out = [];
  for (let i = 1; i < blocks.length; i += 2) {
    const qno = +blocks[i]; const b = blocks[i + 1];
    const am = b.match(/The correct answer is\s+([ABC])\s*\./);
    const stem = am ? b.slice(0, am.index) : b;
    const rest = am ? b.slice(am.index + am[0].length) : '';
    // option triplets (may be two triplets when two questions share a page)
    const trips = []; const re = /\n\s*A\.\s+([\s\S]*?)\n\s*B\.\s+([\s\S]*?)\n\s*C\.\s+([\s\S]*?)(?=\s*$|\n\s*A\.\s)/g; let m;
    while ((m = re.exec('\n' + rest))) trips.push({ A: clean(m[1]), B: clean(m[2]), C: clean(m[3]), at: m.index });
    let exp = rest;
    const ref = exp.search(/CFA\s+Level\s+(1|I),/); if (ref > 0) exp = exp.slice(0, ref);
    out.push({ qno, stem: clean(stem), options: trips.length ? trips[trips.length - 1] : null, _trips: trips,
      answer: am ? am[1] : null, explanation: clean(exp) });
  }
  // shared-page fix: if a question has no options and the next one has two triplets, give it the first
  for (let i = 0; i < out.length - 1; i++) {
    if ((!out[i]._trips.length) && out[i + 1]._trips.length >= 2) {
      out[i].options = out[i + 1]._trips[0]; out[i + 1].options = out[i + 1]._trips[out[i + 1]._trips.length - 1];
    }
  }
  out.forEach(q => { if (q.options) { delete q.options.at; } delete q._trips; });
  return out.filter(q => q.options);
}

export const PARSERS = { UWORLD: parseUWorld, SCHWESER: parseSchweser, CURRICULUM: parseCurriculum, ANALYSTPREP: parseAnalystPrep };
