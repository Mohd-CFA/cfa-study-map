// Local storage layer (IndexedDB). One place to swap in Supabase later.
const DB = 'cfa-study', VER = 1, STORES = ['files', 'questions', 'kv'];
let dbp;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, VER);
    r.onupgradeneeded = () => STORES.forEach(s => r.result.objectStoreNames.contains(s) || r.result.createObjectStore(s));
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode); const s = t.objectStore(store); const r = fn(s);
    t.oncomplete = () => res(r && 'result' in r ? r.result : undefined); t.onerror = () => rej(t.error);
  });
}
export const get = (store, k) => tx(store, 'readonly', s => s.get(k));
export const put = (store, k, v) => tx(store, 'readwrite', s => s.put(v, k));
export const del = (store, k) => tx(store, 'readwrite', s => s.delete(k));
export const keys = (store) => tx(store, 'readonly', s => s.getAllKeys());

// ---- progress (attempts, flags, LOS status) kept in one object per module ----
export async function loadProgress(mid) {
  return (await get('kv', 'progress:' + mid)) || { attempts: {}, flags: {}, los: {} };
}
export const saveProgress = (mid, p) => put('kv', 'progress:' + mid, p);

export function history(p, ref) {
  const a = p.attempts[ref] || [];
  const c = a.filter(x => x.ok).length;
  return { n: a.length, correct: c, wrong: a.length - c, first: a[0], last: a[a.length - 1] };
}
