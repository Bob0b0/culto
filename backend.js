// Strato di collegamento: Firebase Realtime Database in produzione,
// localStorage in modalità DEMO (un solo browser, più schede).
import { CONFIG } from './config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const params = new URLSearchParams(location.search);
export const DEMO = params.has('demo') || !CONFIG.firebase?.apiKey || CONFIG.firebase.apiKey.startsWith('INSERISCI');

// ---------- validazione comune ----------
export function validaSermone(d) {
  const err = [];
  if (!d || typeof d !== 'object') return ['Il file non contiene un oggetto JSON.'];
  if (!/^[A-Za-z0-9_-]{1,60}$/.test(d.id || '')) err.push('Campo "id" mancante o non valido (usa lettere, numeri, - e _).');
  if (!Array.isArray(d.paragrafi) || d.paragrafi.length === 0) err.push('Manca l\'elenco "paragrafi".');
  else d.paragrafi.forEach((p, i) => {
    if (typeof p.it !== 'string' || typeof p.en !== 'string') err.push(`Paragrafo ${i + 1}: mancano i testi "it" o "en".`);
    if (p.tipo && !['p', 'h'].includes(p.tipo)) err.push(`Paragrafo ${i + 1}: "tipo" deve essere "p" o "h".`);
  });
  return err;
}

function pulisci(d) {
  return {
    id: d.id,
    data: d.data || d.id,
    titolo_it: d.titolo_it || '',
    title_en: d.title_en || '',
    paragrafi: d.paragrafi.map(p => ({ tipo: p.tipo === 'h' ? 'h' : 'p', it: p.it, en: p.en }))
  };
}

// ---------- DEMO ----------
function demoBackend() {
  const K = { live: 'culto_demo_live', sermon: id => 'culto_demo_sermon_' + id, index: 'culto_demo_index' };
  const subs = new Map();
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    (subs.get(k) || []).forEach(fn => fn(v));
  };
  addEventListener('storage', e => { if (subs.has(e.key)) subs.get(e.key).forEach(fn => fn(read(e.key))); });
  const watch = (k, cb) => {
    if (!subs.has(k)) subs.set(k, []);
    subs.get(k).push(cb);
    cb(read(k));
    return () => subs.set(k, subs.get(k).filter(f => f !== cb));
  };

  // Al primo avvio carica il sermone di prova incluso nel progetto.
  const pronto = (async () => {
    if (read(K.index)) return;
    try {
      const d = await (await fetch('sermoni/2026-10-25.json')).json();
      write(K.sermon(d.id), pulisci(d));
      write(K.index, { [d.id]: { titolo_it: d.titolo_it, data: d.data } });
    } catch {}
  })();

  return {
    onLive: cb => watch(K.live, cb),
    onSermon: (id, cb) => watch(K.sermon(id), cb),
    onIndex: cb => { pronto.then(() => {}); return watch(K.index, cb); },
    onConnection: cb => { cb(true); return () => {}; },
    setLive: async patch => write(K.live, { ...(read(K.live) || {}), ...patch, aggiornato: Date.now() }),
    saveSermon: async d => {
      const s = pulisci(d);
      write(K.sermon(s.id), s);
      write(K.index, { ...(read(K.index) || {}), [s.id]: { titolo_it: s.titolo_it, data: s.data } });
    },
    deleteSermon: async id => {
      try { localStorage.removeItem(K.sermon(id)); } catch {}
      const ix = read(K.index) || {}; delete ix[id]; write(K.index, ix);
    },
    onAuth: cb => { cb({ email: 'demo', nome: 'Modalità demo' }); return () => {}; },
    signIn: async () => {},
    signOut: async () => {},
    pronto
  };
}

// ---------- FIREBASE ----------
async function firebaseBackend() {
  const { initializeApp } = await import(`${SDK}/firebase-app.js`);
  const db_ = await import(`${SDK}/firebase-database.js`);
  const au = await import(`${SDK}/firebase-auth.js`);
  const app = initializeApp(CONFIG.firebase);
  const db = db_.getDatabase(app);
  const auth = au.getAuth(app);
  const r = p => db_.ref(db, p);
  const watch = (p, cb) => db_.onValue(r(p), s => cb(s.val()), () => cb(null));

  return {
    onLive: cb => watch('live', cb),
    onSermon: (id, cb) => watch('sermons/' + id, cb),
    onIndex: cb => watch('sermonIndex', cb),
    onConnection: cb => watch('.info/connected', v => cb(!!v)),
    setLive: patch => db_.update(r('live'), { ...patch, aggiornato: db_.serverTimestamp() }),
    saveSermon: async d => {
      const s = pulisci(d);
      await db_.update(r('/'), {
        ['sermons/' + s.id]: s,
        ['sermonIndex/' + s.id]: { titolo_it: s.titolo_it, data: s.data }
      });
    },
    deleteSermon: id => db_.update(r('/'), { ['sermons/' + id]: null, ['sermonIndex/' + id]: null }),
    onAuth: cb => au.onAuthStateChanged(auth, u => cb(u ? { email: u.email, nome: u.displayName } : null)),
    signIn: async () => {
      const prov = new au.GoogleAuthProvider();
      try { await au.signInWithPopup(auth, prov); }
      catch (e) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(e.code)) await au.signInWithRedirect(auth, prov);
        else throw e;
      }
    },
    signOut: () => au.signOut(auth),
    pronto: Promise.resolve()
  };
}

export const backend = DEMO ? demoBackend() : await firebaseBackend();
