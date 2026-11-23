/* QG Los Santos — logique et affichage. Les données de jeu sont dans data.js. */
(function(){
'use strict';

const {CATS, PROPS, ACTS, PASSIVE, ROADMAP, ROAD_GROUP, AVOID, RULES, PRESETS} = window.QG_DATA;
const PROP = Object.fromEntries(PROPS.map(p => [p.id, p]));
const ACT = Object.fromEntries(ACTS.map(a => [a.id, a]));
const ACTIONS_URL = 'https://github.com/tjaulin/qg-los-santos/actions/workflows/bonus.yml';
const NEWSWIRE_URL = 'https://www.rockstargames.com/fr/newswire';
const TARGET_KEYS = {kortz:'Kortz', cayo:'Cayo', casino:'Casino'};
const NC_FEEDERS = ['bunker','coke','meth','cash','weed','docs','cargo']; // business qui alimentent l'entrepôt de la boîte de nuit
const GROUP_ONLY = ['arcade','facility','apartment'];
const PASSIVE_BIZ = ['acidlab','bunker','nightclub','coke','meth','cash','weed','docs'];
const LAUNDER_BIZ = PASSIVE_BIZ.concat(['agency','arcade','salvage','autoshop','hangar','vehiclewh','cargo']); // ce que le Car Wash blanchit
const HOURS_OPTS = [[3,'3 h'],[5,'5 h'],[8,'8 h'],[10,'10 h'],[15,'15 h'],[20,'20 h'],[30,'30 h et plus']];

/* ======================================================================
   OUTILS
   ====================================================================== */
const NF = new Intl.NumberFormat('fr-FR');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fmt(n){ return NF.format(Math.round(n)) + ' $'; }
function short(n){
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1e6) return s + (a/1e6).toLocaleString('fr-FR',{maximumFractionDigits: a >= 1e7 ? 1 : 2}) + ' M$';
  if (a >= 1e3) return s + Math.round(a/1e3) + ' k$';
  return s + Math.round(a) + ' $';
}
function dmin(min){
  min = Math.max(0, Math.round(min));
  const h = Math.floor(min/60), m = min % 60;
  if (!h) return m + ' min';
  return h + ' h' + (m ? ' ' + String(m).padStart(2,'0') : '');
}
function until(ms){
  if (ms <= 0) return 'maintenant';
  const s = Math.floor(ms/1000), d = Math.floor(s/86400), h = Math.floor(s%86400/3600), m = Math.floor(s%3600/60);
  if (d) return d + ' j ' + h + ' h';
  if (h) return h + ' h ' + String(m).padStart(2,'0');
  return Math.max(1, m) + ' min';
}
function ago(t){
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'à l’instant';
  if (m < 60) return 'il y a ' + m + ' min';
  const h = Math.round(m / 60);
  if (h < 48) return 'il y a ' + h + ' h';
  return 'il y a ' + Math.round(h / 24) + ' j';
}
function clock(ms){
  if (ms <= 0) return 'Prêt';
  const s = Math.ceil(ms/1000), h = Math.floor(s/3600), m = Math.floor(s%3600/60), sec = s%60;
  return (h ? h + ':' + String(m).padStart(2,'0') : m) + ':' + String(sec).padStart(2,'0');
}
function hhmm(d){ return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); }
function dayMonth(t){ return new Date(t).toLocaleDateString('fr-FR',{day:'numeric',month:'long'}); }
function parseAmount(raw){
  let s = String(raw).trim().toLowerCase().replace(/[\s  $]/g,'');
  let sign = 1;
  if (/^[-−]/.test(s)) { sign = -1; s = s.slice(1); }
  let mult = 1;
  if (/m$/.test(s)) { mult = 1e6; s = s.slice(0,-1); }
  else if (/k$/.test(s)) { mult = 1e3; s = s.slice(0,-1); }
  const seps = (s.match(/[.,]/g) || []).length;
  if (seps > 1 || (mult === 1 && /^\d+[.,]\d{3}$/.test(s))) s = s.replace(/[.,]/g,'');
  else s = s.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return NaN;
  return sign * Math.round(parseFloat(s) * mult);
}
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* Reset hebdo : jeudi 10:00 heure de Londres (≈ 11:00 à Paris) */
function londonParts(d){
  const f = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,weekday:'short'});
  const p = {}; f.formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return p;
}
function weekInfo(now){
  const p = londonParts(now);
  const dows = {Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:7};
  const dow = dows[p.weekday] || 1;
  let hour = +p.hour; if (hour === 24) hour = 0;
  let back = (dow - 4 + 7) % 7;
  if (back === 0 && hour < 10) back = 7;
  const thu = new Date(Date.UTC(+p.year, +p.month-1, +p.day) - back*864e5);
  const key = thu.toISOString().slice(0,10);
  const offsetH = Math.round((Date.UTC(+p.year,+p.month-1,+p.day,hour,+p.minute) - Math.floor(now.getTime()/60000)*60000) / 36e5);
  const start = Date.UTC(thu.getUTCFullYear(), thu.getUTCMonth(), thu.getUTCDate(), 10) - offsetH*36e5;
  return {key, start, next: start + 7*864e5};
}
function dayInfo(now){
  const key = now.toISOString().slice(0,10);
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1);
  return {key, next};
}
function localDayKey(t){ const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

/* ======================================================================
   ÉTAT — enregistré dans ce navigateur
   ====================================================================== */
const LS_KEY = 'qg-ls-state-v1', UI_KEY = 'qg-ls-ui-v1', BONUS_KEY = 'qg-ls-bonus-v1';
function defaults(){
  return {v:2, settings:{platform:'ps5', gtaplus:false, mode:'solo', pace:'normal', deduct:true, addCash:true, hours:10},
    cash:0, owned:{}, daily:{key:'',done:{}}, weekly:{key:'',done:{},salvage:0}, monthly:{key:'',done:{}},
    timers:[], log:[], notes:'', updated:0};
}
function migrateOwned(ow){
  // v1 → v2 : améliorations séparées
  if (ow.bunkerupg){ ow.bunker_equip = true; ow.bunker_staff = true; }
  if (ow.nctech) ow.nc_techs = 4;
  if (ow.ncequip) ow.nc_equip = true;
  delete ow.bunkerupg; delete ow.nctech; delete ow.ncequip;
  Object.keys(ow).forEach(k => { if (!PROP[k]) delete ow[k]; });
  return ow;
}
function migrate(s){
  const d = defaults();
  if (!s || typeof s !== 'object') return d;
  const o = Object.assign(d, s);
  o.settings = Object.assign(defaults().settings, s.settings || {});
  o.owned = migrateOwned(Object.assign({}, s.owned || {}));
  o.daily = Object.assign({key:'',done:{}}, s.daily || {}); o.daily.done = Object.assign({}, o.daily.done || {});
  o.weekly = Object.assign({key:'',done:{},salvage:0}, s.weekly || {}); o.weekly.done = Object.assign({}, o.weekly.done || {});
  o.monthly = Object.assign({key:'',done:{}}, s.monthly || {}); o.monthly.done = Object.assign({}, o.monthly.done || {});
  o.timers = Array.isArray(s.timers) ? s.timers.filter(t => t && t.id && t.end) : [];
  o.log = Array.isArray(s.log) ? s.log.filter(e => e && e.id && isFinite(e.amount)) : [];
  o.cash = isFinite(+s.cash) ? +s.cash : 0;
  o.v = 2;
  return o;
}
function loadLS(key){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e){ return null; } }
function saveLS(key, v){ try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch(e){ return false; } }

let state = migrate(loadLS(LS_KEY));
const ui = Object.assign({budget:120, filter:'mine', introHidden:false, sound:false}, loadLS(UI_KEY) || {});
Object.assign(ui, {completing:null, exportMsg:'', importMsg:'', exportCode:'', importDraft:'', bonusMsg:'', bonusBusy:false, q:''});
function saveUI(){ saveLS(UI_KEY, {budget:ui.budget, filter:ui.filter, introHidden:ui.introHidden, sound:ui.sound}); }

function setSync(kind, text){
  const el = document.getElementById('sync'); if (!el) return;
  el.className = 'sync ' + kind;
  el.querySelector('span').textContent = text;
}
function persist(){
  state.updated = Date.now();
  const cutoff = Date.now() - 864e5;
  state.timers = state.timers.filter(t => t.end > cutoff);
  if (state.log.length > 600) state.log = state.log.slice(-600);
  if (saveLS(LS_KEY, state)) setSync('ok', 'Enregistré sur cet appareil');
  else setSync('err', 'Impossible d’enregistrer (navigation privée ?)');
}
function commit(){ persist(); render(); }
async function askPersistence(){
  try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch(e){}
}

/* ---------- Sauvegarde et transfert entre appareils ---------- */
function bytesToB64(b){ let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function b64ToBytes(s){ const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; }
async function encodeState(){
  const json = JSON.stringify(state);
  try {
    if (window.CompressionStream){
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
      return 'QG1:' + bytesToB64(new Uint8Array(await new Response(stream).arrayBuffer()));
    }
  } catch(e){}
  return 'QG0:' + bytesToB64(new TextEncoder().encode(json));
}
async function decodeCode(code){
  code = code.trim().replace(/\s+/g, '');
  if (code.startsWith('{')) return JSON.parse(code);
  const m = /^QG([01]):(.+)$/.exec(code); if (!m) throw new Error('format');
  const bytes = b64ToBytes(m[2]);
  if (m[1] === '1'){
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
function importState(obj){
  if (!obj || typeof obj !== 'object' || !obj.settings || !obj.owned) throw new Error('contenu');
  state = migrate(obj);
  notified.clear(); state.timers.filter(t => t.end <= Date.now()).forEach(t => notified.add(t.id));
  commit();
}

/* ---------- Bonus de la semaine (bonus.json, mis à jour chaque jeudi par GitHub Actions) ---------- */
let bonus = loadLS(BONUS_KEY);
function bonusCurrent(b){
  if (!b || !b.start || !b.end) return false;
  const now = Date.now();
  return now >= Date.parse(b.start) - 6*36e5 && now < Date.parse(b.end);
}
function bonusSection(id){ return bonus && Array.isArray(bonus.sections) ? (bonus.sections.find(s => s.id === id) || null) : null; }
function weekTargetFor(actId){
  const key = TARGET_KEYS[actId], t = bonusCurrent(bonus) && bonusSection('targets');
  if (!key || !t) return [];
  return t.items.filter(i => i.toLowerCase().includes(key.toLowerCase())).map(i => i.replace(new RegExp('\\s*' + key + '.*$', 'i'), '').replace(/["“”]/g, '').trim()).filter(Boolean);
}
function salvageTargets(){
  const s = bonusCurrent(bonus) && bonusSection('salvage');
  if (!s) return [];
  return s.items.map(i => { const car = i.split(' · ')[0].trim(); const rob = /(The [\w' -]+ Robbery)\s*$/.exec(i); return car + (rob ? ' (' + rob[1] + ')' : ''); });
}
async function syncBonus(manual){
  if (ui.bonusBusy) return;
  ui.bonusBusy = true;
  if (manual){ ui.bonusMsg = ''; render(); }
  let msg = '';
  try {
    const r = await fetch('bonus.json?t=' + Date.now(), {cache:'no-store'});
    if (!r.ok) throw new Error('http');
    const b = await r.json();
    if (!b || !Array.isArray(b.sections) || !b.start) throw new Error('format');
    const changed = !bonus || bonus.start !== b.start || JSON.stringify(bonus.sections) !== JSON.stringify(b.sections);
    bonus = Object.assign({}, b, {syncedAt: Date.now()});
    saveLS(BONUS_KEY, bonus);
    if (!bonusCurrent(b)) msg = 'stale';
    else if (manual) msg = changed ? 'Bonus de la semaine récupérés.' : 'Déjà à jour.';
  } catch(e){
    msg = manual ? 'Pas de connexion : les derniers bonus connus restent affichés.' : '';
  }
  ui.bonusBusy = false;
  ui.bonusMsg = msg;
  render();
}

/* ======================================================================
   LOGIQUE
   ====================================================================== */
const lvl = id => { const v = state.owned[id]; return v === true ? 1 : (+v || 0); };
const own = id => lvl(id) > 0;
const full = id => { const p = PROP[id]; return p && p.max ? lvl(id) >= p.max : own(id); };
const sum = arr => arr.reduce((a,b) => a + b, 0);
function ownedValue(p){ return p.max ? sum(p.unitPrices.slice(0, lvl(p.id))) : (own(p.id) ? p.price : 0); }
function missingCost(p){ return p.max ? sum(p.unitPrices.slice(lvl(p.id))) : (own(p.id) ? 0 : p.price); }
function priceTxt(p){
  if (p.max) return '≈ ' + short(Math.min(...p.unitPrices)) + '–' + short(Math.max(...p.unitPrices)) + ' chacun';
  return p.price ? (p.from ? 'dès ' : '') + (p.approx ? '≈ ' : '') + short(p.price) : 'Gratuit';
}
function ficheOf(id){ let p = PROP[id]; while (p && !p.fiche && p.parent) p = PROP[p.parent]; return p ? p.id : id; }
function catName(id){ const c = CATS.find(c => c.id === id); return c ? c.name : ''; }
function makeO(map){
  const lv = id => { const v = map[id]; return v === true ? 1 : (+v || 0); };
  return {map, lvl: lv, own: id => lv(id) > 0};
}
const curO = () => makeO(state.owned);
function available(a, O){ O = O || curO(); return a.req.every(O.own) && (a.solo || state.settings.mode === 'groupe'); }
function periods(){
  const now = new Date();
  const d = dayInfo(now), w = weekInfo(now), mk = d.key.slice(0,7);
  if (state.daily.key !== d.key) state.daily = {key:d.key, done:{}};
  if (state.weekly.key !== w.key) state.weekly = {key:w.key, done:{}, salvage:0};
  if (state.monthly.key !== mk) state.monthly = {key:mk, done:{}};
  return {d, w};
}
function setOwnedIn(map, id, val){
  const p = PROP[id]; if (!p) return;
  const has = k => { const v = map[k]; return v === true || +v > 0; };
  if (val){
    map[id] = p.max ? Math.min(p.max, val === true ? p.max : +val) : true;
    let q = p.parent ? PROP[p.parent] : null;
    while (q){ if (!has(q.id)) map[q.id] = q.max ? 1 : true; q = q.parent ? PROP[q.parent] : null; }
  } else {
    delete map[id];
    PROPS.filter(k => k.parent === id).forEach(k => setOwnedIn(map, k.id, false));
  }
}
function setOwned(id, val){ setOwnedIn(state.owned, id, val); }
/* Revenu passif estimé : 45 % sans amélioration, jusqu'à 100 % avec équipement + personnel.
   Entrepôt de la boîte de nuit : un technicien ne produit que s'il a un business à revendre. */
function passiveRate(p, O){
  O = O || curO();
  if (!O.own(p.req)) return 0;
  let f = 1;
  if (p.ups && p.ups.length) f *= 0.45 + 0.55 * p.ups.filter(O.own).length / p.ups.length;
  if (p.techs) f *= Math.min(1 + O.lvl('nc_techs'), NC_FEEDERS.filter(O.own).length) / 5;
  if (p.scale) f *= Math.min(1, LAUNDER_BIZ.filter(O.own).length / 6);
  if (p.req === 'cash' && O.own('carwash')) f *= 1.35;
  if (p.req === 'weed' && O.own('weedshop')) f *= 1.35;
  return p.low * f;
}
function passiveLow(O){ return sum(PASSIVE.map(p => passiveRate(p, O))); }
function empireValue(){ return sum(PROPS.map(ownedValue)); }

function dailyItems(){
  const items = [
    {id:'d_obj', label:'Objectifs quotidiens (les 3)', gainTxt:'≈ 30 k$'},
    {id:'d_wheel', label:'Roue de la fortune du Casino', gainTxt:'Lot gratuit, voiture du podium possible'},
    {id:'d_stash', label:'Planque (Stash House)', gainTxt:'≈ 20 k$'},
    {id:'d_gcache', label:'Cache de G (G’s Cache)', gainTxt:'≈ 15–25 k$'},
    {id:'d_wreck', label:'Épave du jour (Shipwreck)', gainTxt:'≈ 25 k$'}
  ];
  if (['acidlab','coke','meth','weed'].some(own)) items.push({id:'d_dealers', label:'Dealers de rue (3 positions)', gainTxt:'Écoule ton stock de drogue'});
  if (own('autoshop')) items.push({id:'d_exotic', label:'Exotic Exports (10 véhicules)', gainTxt:'≈ 20 k$ par véhicule'});
  const safes = [['nightclub','boîte de nuit'],['agency','agence'],['arcade','arcade'],['salvage','casse'],['carwash','car wash'],['clubhouse','bar du club-house']].filter(x => own(x[0])).map(x => x[1]);
  if (safes.length) items.push({id:'d_safes', label:'Vider les coffres', note:safes.join(', '), gainTxt:'Plafonnés : vide-les avant qu’ils débordent'});
  const sup = [['acidlab','labo d’acide'],['bunker','bunker'],['coke','cocaïne'],['meth','meth'],['cash','faux billets'],['weed','cannabis'],['docs','faux papiers']].filter(x => own(x[0])).map(x => x[1]);
  if (sup.length) items.push({id:'d_supplies', label:'Réapprovisionner', note:sup.join(', '), gainTxt:'Une production à l’arrêt ne rapporte rien'});
  if (['acidlab','bunker','nightclub','coke'].some(own)) items.push({id:'d_sell', label:'Vendre les stocks pleins (session privée)', gainTxt:'Selon tes stocks'});
  return items;
}
function weeklyItems(){
  const items = [];
  ACTS.filter(a => a.weekly && available(a)).forEach(a => {
    items.push({id:a.weekly, label:a.name, note:'1er run de la semaine', gain:a.first || null, gainTxt:a.first ? '' : 'Bonus de 1re réalisation', act:a.id});
  });
  if (own('salvage')) items.push({id:'w_salvage', counter:true});
  const ch = bonusCurrent(bonus) && bonusSection('challenge');
  items.push({id:'w_challenge', label:'Défi hebdomadaire', note: ch ? ch.items[0] : 'Voir le menu de pause, onglet Défis', gain:100000});
  items.push({id:'w_tt', label:'Contre-la-montre de la semaine', gainTxt:'Jusqu’à ≈ 100 k$'});
  items.push({id:'w_prize', label:'Défi Prize Ride du LS Car Meet', gainTxt:'Voiture offerte'});
  items.push({id:'w_sync', label:'Synchroniser les bonus du jeudi', gainTxt:'Repère les 2× à 4×'});
  return items;
}
function weeklyDone(it){
  if (it.counter) return (state.weekly.salvage || 0) >= 3;
  if (it.id === 'w_sync') return !!state.weekly.done.w_sync || (bonusCurrent(bonus) && bonus.syncedAt >= weekInfo(new Date()).start);
  return !!state.weekly.done[it.id];
}
function weeklyLeft(){
  return sum(weeklyItems().map(it => it.counter ? Math.max(0, 3 - (state.weekly.salvage || 0)) * 250000 : (!weeklyDone(it) && it.gain ? it.gain : 0)));
}
/* Plan de session : algorithme glouton sur le gain par minute (voir « Comment c'est calculé ») */
function planCore(budget, ctx){
  const O = ctx.O;
  const pace = {debutant:1.35, normal:1, rapide:0.8}[state.settings.pace] || 1;
  const now = Date.now();
  const nPassive = PASSIVE_BIZ.filter(O.own).length, hasPassive = nPassive > 0;
  const steps = [];
  let t = 0;
  const openDur = budget <= 30 ? 5 : 10;
  steps.push({kind:'aux', t, dur:openDur, title:'Mise en route',
    text: 'Session privée. ' + (['agency','nightclub','salvage','arcade'].some(O.own) ? 'Vide les coffres, ' : '') + (hasPassive ? 'relance les productions, ' : '') + 'regarde tes 3 objectifs du jour pour les faire en passant.'});
  t += openDur;
  const closeDur = hasPassive && budget > 30 && !ctx.noClose ? Math.min(15, 5 * nPassive) : 0;
  const end = budget - closeDur;
  const cands = ACTS.filter(a => available(a, O)).map(a => {
    const dur = Math.round(((a.fastReq && O.own(a.fastReq)) ? a.durFast : a.dur) * pace);
    const timer = ctx.timers.find(x => x.act === a.id && x.end > now);
    return {a, dur, ready: timer ? Math.ceil((timer.end - now)/60000) : 0,
      firstAvail: !!(a.weekly && a.first && !ctx.done[a.weekly]),
      capLeft: a.cap ? Math.max(0, a.cap - (ctx.salvage || 0)) : Infinity, runs:0};
  });
  let guard = 0;
  while (t < end && guard++ < 60){
    const remaining = end - t;
    const ok = c => c.capLeft > 0 && !(c.a.once && c.runs > 0);
    const avail = cands.filter(c => ok(c) && c.ready <= t && c.dur <= remaining);
    if (!avail.length){
      const soon = cands.filter(c => ok(c) && c.ready > t && c.ready + c.dur <= end).sort((x,y) => x.ready - y.ready)[0];
      if (soon){ steps.push({kind:'aux', t, dur:soon.ready - t, title:'Temps mort', text:'Objectifs du jour, cachettes ou ventes en attendant : ' + soon.a.name + '.'}); t = soon.ready; continue; }
      break;
    }
    avail.forEach(c => { c.val = (c.firstAvail ? c.a.first : c.a.pay) / c.dur; });
    avail.sort((x,y) => y.val - x.val);
    const c = avail[0];
    const first = c.firstAvail;
    steps.push({kind:'act', t, dur:c.dur, act:c.a, gain: first ? c.a.first : c.a.pay, first, n:1});
    t += c.dur; c.runs++; c.firstAvail = false;
    if (c.capLeft !== Infinity) c.capLeft--;
    c.ready = t + (c.a.cd || 0);
  }
  if (closeDur) steps.push({kind:'aux', t, dur:closeDur, title:'Ventes et réappro',
    text:'Vends ce qui est plein, rachète des fournitures et laisse tourner avant de te déconnecter.'});
  const merged = [];
  steps.forEach(s => {
    const last = merged[merged.length-1];
    if (last && s.kind === 'act' && last.kind === 'act' && last.act.id === s.act.id && !s.first && !last.first){
      last.n += 1; last.dur += s.dur; last.gain += s.gain;
    } else merged.push(Object.assign({}, s));
  });
  const total = sum(merged.map(s => s.gain || 0));
  const minutes = merged.length ? merged[merged.length-1].t + merged[merged.length-1].dur : 0;
  return {steps:merged, total, minutes};
}
function buildPlan(budget){
  return planCore(budget, {O:curO(), done:state.weekly.done, salvage:state.weekly.salvage || 0, timers:state.timers});
}
function ratePerHour(){ const p = buildPlan(120); return p.minutes ? p.total / (p.minutes/60) : 0; }

/* Semaine simulée : ton temps de jeu découpé en sessions de 2 h (même calcul que le plan),
   les 1ers runs une seule fois, plus le revenu passif pendant que tu es connecté,
   moins le temps passé à vendre (≈ 3 min par tranche de 100 k$, valorisé à ton gain moyen par minute). */
function weeklyIncome(O){
  const hours = +state.settings.hours || 10;
  let remaining = Math.round(hours * 60), active = 0, salvage = 0;
  const done = {};
  while (remaining >= 30){
    const len = Math.min(120, remaining); remaining -= len;
    const p = planCore(len, {O, done, salvage, timers:[], noClose:true});
    active += p.total;
    p.steps.forEach(st => {
      if (st.kind !== 'act') return;
      if (st.first && st.act.weekly) done[st.act.weekly] = true;
      if (st.act.id === 'salvage') salvage += st.n;
    });
  }
  const gross = passiveLow(O) * hours;
  const sellCost = gross / 100000 * 3 * (active / Math.max(1, hours * 60));
  const passive = gross - sellCost;
  return {active, passive, total: active + passive};
}

/* Achats possibles : les étapes de data.js (ROADMAP) + tous les autres business et améliorations. */
function bundlesList(){
  const groupe = state.settings.mode === 'groupe';
  const list = ROADMAP.map((b, i) => ({id:b.id, title:b.title, why:b.why, unlocks:b.unlocks, items:b.props, order:i}));
  if (groupe) list.push({id:ROAD_GROUP.id, title:ROAD_GROUP.title, why:ROAD_GROUP.why, unlocks:ROAD_GROUP.unlocks, items:ROAD_GROUP.props, order:50});
  const inList = new Set(list.flatMap(b => b.items));
  PROPS.forEach(p => {
    if (inList.has(p.id) || (!p.price && !p.max)) return;
    if (GROUP_ONLY.includes(p.id) && !groupe) return;
    if (p.kind === 'up'){
      if (/_(equip|staff)$/.test(p.id) || !own(p.parent)) return;
      list.push({id:'up-' + p.id, items:[p.id], why:p.what, main:p.parent, order:99});
      return;
    }
    const chain = []; let q = p.parent ? PROP[p.parent] : null;
    while (q){ chain.unshift(q.id); q = q.parent ? PROP[q.parent] : null; }
    const ups = PROPS.filter(k => k.parent === p.id && /_(equip|staff)$/.test(k.id)).map(k => k.id);
    const pre = chain.filter(id => !own(id)).map(id => PROP[id].name);
    const title = (own(p.id) ? 'Améliorations : ' + p.name : p.name + (ups.length ? ' + améliorations' : '')) + (pre.length ? ' (avec ' + pre.join(', ') + ')' : '');
    list.push({id:'auto-' + p.id, title, items:chain.concat([p.id], ups), why:(p.fiche && p.fiche.avis) || p.what, main:p.id, order:99});
  });
  return list;
}
let optCache = {key:'', val:null};
function purchaseOptions(){
  const key = JSON.stringify([state.owned, state.cash, state.settings.mode, state.settings.pace, state.settings.hours]);
  if (optCache.key === key) return optCache.val;
  const base = weeklyIncome(curO());
  const perWeek = Math.max(base.total, 1);
  const seen = new Set(), opts = [];
  bundlesList().forEach(b => {
    if (b.items.every(id => PROP[id].kind === 'up') && b.items.some(id => !own(PROP[id].parent))) return;
    const missing = [];
    const add = id => { if (missing.includes(id) || full(id)) return; const p = PROP[id]; if (p.parent && !own(p.parent)) add(p.parent); missing.push(id); };
    b.items.forEach(add);
    if (!missing.length) return;
    const k = missing.slice().sort().join('+');
    if (seen.has(k)) return;
    seen.add(k);
    const cost = sum(missing.map(id => missingCost(PROP[id])));
    const map = Object.assign({}, state.owned);
    missing.forEach(id => setOwnedIn(map, id, true));
    const gain = weeklyIncome(makeO(map)).total - base.total;
    const save = Math.max(0, cost - state.cash) / perWeek;
    const payback = cost ? (gain > 0 ? cost / gain : Infinity) : 0;
    opts.push(Object.assign({}, b, {
      title: b.title || missing.map(id => PROP[id].name).join(' + '),
      missing, cost, gain, save, payback, score: save + payback, main: b.main || missing[0]
    }));
  });
  opts.sort((x, y) => (x.cost ? 1 : 0) - (y.cost ? 1 : 0) || x.score - y.score || x.order - y.order);
  const val = {
    base,
    ranked: opts.filter(o => !o.cost || (o.gain > 0 && o.payback <= 104)),
    slow: opts.filter(o => o.cost && o.gain > 0 && o.payback > 104),
    comfort: opts.filter(o => o.cost && !(o.gain > 0))
  };
  optCache = {key, val};
  return val;
}
function findOption(id){ const o = purchaseOptions(); return o.ranked.concat(o.slow, o.comfort).find(x => x.id === id) || null; }
function weeksTxt(w){
  if (!isFinite(w)) return 'jamais';
  if (w <= 0) return 'tout de suite';
  if (w < 1) return 'moins d’une semaine';
  if (w < 10){ const r = Math.round(w * 10) / 10; return '≈ ' + r.toLocaleString('fr-FR') + ' semaine' + (r >= 2 ? 's' : ''); }
  return '≈ ' + Math.round(w) + ' semaines';
}

/* ======================================================================
   RENDU
   ====================================================================== */
const view = document.getElementById('view');
const TABS = ['tableau','routines','empire','achats','fiches','methodes','chronos','journal'];
let route = {view:'tableau'};

function checkRow(kind, it, done){
  const id = kind + '-' + it.id;
  const gain = it.gain ? '<span class="money">' + short(it.gain) + '</span>' : esc(it.gainTxt || '');
  return '<label class="check' + (done ? ' done' : '') + '" for="' + id + '">' +
    '<input type="checkbox" id="' + id + '" data-check="' + kind + '" data-id="' + it.id + '"' + (done ? ' checked' : '') + '>' +
    '<span class="body"><span class="label">' + esc(it.label) + '</span>' + (it.note ? '<span class="note">' + esc(it.note) + '</span>' : '') + '</span>' +
    '<span class="gain">' + gain + '</span></label>';
}
function salvageRow(){
  const n = state.weekly.salvage || 0, tg = salvageTargets();
  return '<div class="check' + (n >= 3 ? ' done' : '') + '"><span class="body"><span class="label">Braquages de la casse</span><span class="note">' +
    (tg.length ? 'Cibles : ' + esc(tg.join(' · ')) : '≈ 250 k$ chacun, 3 par semaine') + '</span></span>' +
    '<span class="counter"><button class="btn sm" data-act="salvage" data-d="-1" aria-label="Retirer un braquage">−</button><b>' + n + '/3</b><button class="btn sm" data-act="salvage" data-d="1" aria-label="Ajouter un braquage">+</button></span></div>';
}
function weeklyList(items){ return items.map(it => it.counter ? salvageRow() : checkRow('weekly', it, weeklyDone(it))).join(''); }
function monthlyRow(){
  if (!state.settings.gtaplus) return '';
  return checkRow('monthly', {id:'m_gtaplus', label:'GTA+ : récupérer les 500 k$ du mois', note:'Et les avantages GTA+ du mois', gain:500000}, !!state.monthly.done.m_gtaplus);
}
function resetLine(label, next){ return '<span class="reset">' + label + ' dans <span data-until="' + next + '">' + until(next - Date.now()) + '</span></span>'; }
function head(title, lede, side){
  return '<div class="view-head"><div><h1>' + title + '</h1>' + (lede ? '<p class="lede">' + lede + '</p>' : '') + '</div>' + (side || '') + '</div>';
}

/* ---------- Bonus ---------- */
function bonusCard(compact){
  const cur = bonusCurrent(bonus);
  let h = '<div class="card s4 event"><h2>Bonus de la semaine</h2>';
  if (bonus && bonus.sections){
    const label = 'Du ' + dayMonth(bonus.start) + ' au ' + dayMonth(bonus.end);
    if (!cur) h += '<p class="notice" style="margin:0 0 8px">Ces bonus ont expiré. Ceux de la nouvelle semaine ne sont pas encore récupérés.</p>';
    h += '<span class="eyebrow">' + esc(label) + '</span>';
    const b = bonusSection('bonus');
    if (b) h += '<ul>' + b.items.slice(0, compact ? 4 : 12).map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>';
    const ch = bonusSection('challenge'); if (ch) h += '<p class="small" style="margin:6px 0 0"><b>Défi hebdo :</b> ' + esc(ch.items[0]) + '</p>';
    const tg = bonusSection('targets'); if (tg) h += '<p class="small" style="margin:6px 0 0"><b>Cibles principales :</b> ' + esc(tg.items.join(' · ')) + '</p>';
    const others = bonus.sections.filter(s => !['bonus','challenge','targets'].includes(s.id));
    if (others.length) h += '<details class="more"><summary>Tout voir (promos, podium, casse, GTA+…)</summary>' + others.map(s =>
      '<h3>' + esc(s.title) + '</h3><ul>' + s.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>').join('') + '</details>';
    h += '<p class="small muted" style="margin:8px 0 0">En anglais, d’après <a href="' + esc(bonus.sourceUrl) + '" target="_blank" rel="noopener">' + esc(bonus.source) + '</a>' +
      (bonus.syncedAt ? ' · synchronisé ' + ago(bonus.syncedAt) : '') + '.</p>';
  } else {
    h += '<p class="muted" style="margin:0">Aucun bonus récupéré pour l’instant.</p>';
  }
  if (ui.bonusMsg === 'stale'){
    h += '<p class="small" style="margin:10px 0 0">La mise à jour automatique passe le jeudi vers 12 h 30 (heure de Paris). Si elle n’est pas encore passée, <a href="' + ACTIONS_URL + '" target="_blank" rel="noopener">lance-la sur GitHub</a> (bouton « Run workflow »), puis resynchronise dans une minute.</p>';
  } else if (ui.bonusMsg){
    h += '<p class="small" style="margin:10px 0 0">' + esc(ui.bonusMsg) + '</p>';
  }
  h += '<div class="row" style="margin-top:10px"><button class="btn sm primary" data-act="sync-bonus"' + (ui.bonusBusy ? ' disabled' : '') + '>' + (ui.bonusBusy ? 'Synchronisation…' : 'Sync') + '</button>' +
    '<a class="btn sm ghost" href="' + NEWSWIRE_URL + '" target="_blank" rel="noopener">Newswire</a></div></div>';
  return h;
}

/* ---------- Tableau de bord ---------- */
function renderDash(P){
  const owned = PROPS.filter(p => own(p.id)).length;
  const PO = purchaseOptions();
  const next = PO.ranked[0] || null;
  const rate = ratePerHour();
  const wItems = weeklyItems(), wDone = wItems.filter(weeklyDone).length;
  const dItems = dailyItems(), dDone = dItems.filter(it => state.daily.done[it.id]).length;
  const today = localDayKey(Date.now());
  const gToday = sum(state.log.filter(e => localDayKey(e.t) === today).map(e => e.amount));
  const gWeek = sum(state.log.filter(e => e.t >= P.w.start).map(e => e.amount));
  let h = head('Tableau de bord', 'Où tu en es, ce qu’il reste à faire cette semaine et ton prochain achat.');

  if (!ui.introHidden && (owned === 0 || state.cash === 0)){
    h += '<div class="card" style="margin-bottom:16px"><h2>Pour démarrer <button class="btn sm ghost" data-act="intro-hide">Masquer</button></h2>' +
      '<p class="muted small" style="margin:0">Trois minutes de réglage, et tout le reste se calcule tout seul.</p>' +
      '<div class="intro"><div><b>1</b>Dans <a href="#empire">Mon empire</a>, coche ce que tu possèdes, améliorations comprises, et ta plateforme.</div>' +
      '<div><b>2</b>Ici, entre ton solde actuel (banque + liquide).</div>' +
      '<div><b>3</b>Dans <a href="#routines">Routines</a>, choisis ton temps de jeu : tu obtiens un plan de session.</div></div>' +
      '<p class="small muted" style="margin:10px 0 0">Sur téléphone, ajoute le site à ton écran d’accueil (Safari : Partager, puis « Sur l’écran d’accueil » ; Chrome : menu ⋮, puis « Ajouter à l’écran d’accueil ») : il s’ouvre comme une appli et marche hors connexion.</p></div>';
  }

  h += '<div class="grid">';
  h += '<div class="card s5"><h2>Ton solde</h2><div class="big money">' + fmt(state.cash) + '</div>' +
    '<form class="form-row" data-form="cash" style="margin-top:12px"><div class="field"><label for="cash-in">Mettre à jour</label><input type="text" id="cash-in" autocomplete="off" placeholder="ex. 3,2M ou 450k"></div><button class="btn" type="submit">Enregistrer</button></form>' +
    '<div class="kv"><div><span class="eyebrow">Empire</span><b>' + short(empireValue()) + '</b><span class="small muted">' + owned + ' élément' + (owned > 1 ? 's' : '') + '</span></div>' +
    '<div><span class="eyebrow">Passif</span><b>' + (passiveLow() ? '≈ ' + short(passiveLow()) + '/h' : '—') + '</b><span class="small muted">estimation basse</span></div>' +
    '<div><span class="eyebrow">Rythme actif</span><b>≈ ' + short(rate) + '/h</b><span class="small muted">session de 2 h</span></div></div></div>';
  if (next){
    const pct = next.cost ? Math.min(100, Math.round(state.cash / next.cost * 100)) : 100;
    const miss = Math.max(0, next.cost - state.cash);
    const partial = next.items.length > next.missing.length;
    h += '<div class="card s7 hot"><h2>Prochain achat <small>n° 1 de ton classement</small></h2>' +
      '<div class="row between"><b style="font-size:20px">' + esc(next.title) + '</b><span class="money" style="font-size:18px">' + (next.cost ? short(next.cost) : 'Gratuit') + '</span></div>' +
      (partial ? '<p class="small muted" style="margin:4px 0 0">Il te reste : ' + next.missing.map(id => esc(PROP[id].name)).join(', ') + '.</p>' : '') +
      '<p class="small" style="margin:6px 0 8px;max-width:65ch">' + esc(next.why) + '</p>' +
      (next.cost ? '<p class="small" style="margin:0 0 8px">Rapporte <b class="money">≈ +' + short(next.gain) + '/semaine</b> · remboursé en <b>' + weeksTxt(next.payback) + '</b></p>' +
        '<div class="meter money" role="img" aria-label="' + pct + ' % du prix"><i style="width:' + pct + '%"></i></div>' +
        '<p class="small" style="margin:8px 0 0">' + (miss ? 'Il te manque <b class="money">' + fmt(miss) + '</b>, soit ≈ <b>' + dmin(miss / Math.max(rate, 1) * 60) + '</b> de jeu à ton rythme actuel.' : '<b class="money">Tu as de quoi l’acheter.</b> Fonce, sauf s’il est annoncé en promo jeudi.') + '</p>' : '') +
      '<div class="row" style="margin-top:12px"><a class="btn primary" href="#achats">Voir le classement</a><a class="btn ghost" href="#fiche-' + ficheOf(next.main) + '">Lire la fiche</a></div></div>';
  } else {
    h += '<div class="card s7 hot"><h2>Prochain achat</h2><p style="margin:0">Plus aucun achat rentable à ton rythme. Il ne reste qu’à optimiser ta semaine.</p></div>';
  }
  const wTop = wItems.filter(it => !weeklyDone(it)).slice(0,5);
  h += '<div class="card s6"><h2>Cette semaine <small>' + wDone + '/' + wItems.length + ' faits</small></h2>' +
    '<div class="meter"><i style="width:' + Math.round(wDone / Math.max(1,wItems.length) * 100) + '%"></i></div>' +
    '<p class="small" style="margin:8px 0 10px">Encore ≈ <b class="money">' + short(weeklyLeft()) + '</b> de bonus à prendre. ' + resetLine('Reset jeudi 11 h', P.w.next) + '</p>' +
    '<div class="checks">' + (wTop.length ? weeklyList(wTop) : '<p class="muted" style="margin:0">Tout est fait. Belle semaine.</p>') + monthlyRow() + '</div>' +
    '<div class="row" style="margin-top:10px"><a class="btn sm ghost" href="#routines">Toute la routine</a></div></div>';
  h += '<div class="card s6"><h2>Aujourd’hui <small>' + dDone + '/' + dItems.length + ' faits</small></h2>' +
    '<div class="meter"><i style="width:' + Math.round(dDone / Math.max(1,dItems.length) * 100) + '%"></i></div>' +
    '<p class="small" style="margin:8px 0 10px">' + resetLine('Nouvelle journée', P.d.next) + '</p>' +
    '<div class="checks">' + dItems.map(it => checkRow('daily', it, !!state.daily.done[it.id])).join('') + '</div></div>';
  h += bonusCard(true);
  const timers = state.timers.slice().sort((a,b) => a.end - b.end);
  h += '<div class="card s4"><h2>Chronos</h2>' + (timers.length ? '<div class="timers">' + timers.slice(0,4).map(timerCard).join('') + '</div>' :
    '<p class="muted small" style="margin:0 0 10px">Aucune recharge en cours.</p><a class="btn sm" href="#chronos">Lancer un chrono</a>') + '</div>';
  h += '<div class="card s4"><h2>Gains notés</h2><div class="kv" style="margin-top:0;grid-template-columns:1fr 1fr">' +
    '<div><span class="eyebrow">Aujourd’hui</span><b class="money">' + short(gToday) + '</b></div><div><span class="eyebrow">Semaine</span><b class="money">' + short(gWeek) + '</b></div></div>' +
    '<form class="form-row" data-form="quicklog" style="margin-top:12px"><div class="field"><label for="ql-amt">Ajout rapide</label><input type="text" id="ql-amt" autocomplete="off" placeholder="ex. 600k"></div><button class="btn" type="submit">Noter</button></form></div>';
  h += '</div>';
  return h;
}

/* ---------- Routines ---------- */
function renderRoutines(P){
  const plan = buildPlan(ui.budget);
  const start = new Date();
  let h = head('Routines', 'Un plan de session calculé d’après ce que tu possèdes, tes bonus hebdo restants et tes chronos en cours. Coche au fur et à mesure.');
  h += '<div class="card"><h2>Plan de session <small>' + (state.settings.mode === 'groupe' ? 'solo + groupe' : 'solo') + ' · rythme ' + ({debutant:'débutant', normal:'normal', rapide:'rapide'}[state.settings.pace]) + '</small></h2>' +
    '<div class="chips" role="group" aria-label="Temps de jeu">' + [[30,'30 min'],[60,'1 h'],[120,'2 h'],[180,'3 h et plus']].map(([m,l]) =>
      '<button class="chip" data-act="budget" data-min="' + m + '" aria-pressed="' + (ui.budget === m) + '">' + l + '</button>').join('') + '</div>' +
    '<div class="plan-sum"><span class="big">≈ ' + short(plan.total) + '</span><span class="muted">en ' + dmin(plan.minutes) + ' · ≈ ' + short(plan.minutes ? plan.total / plan.minutes * 60 : 0) + '/h, hors ventes de stock</span></div>' +
    '<ol class="timeline">' + plan.steps.map(s => stepRow(s, start)).join('') + '</ol>' +
    '<details class="more"><summary>Comment ce plan est calculé</summary>' +
    '<ol class="explain"><li><b>Mise en route</b> : 5 à 10 min pour les coffres, les productions et les objectifs du jour.</li>' +
    '<li><b>Ce que tu peux faire</b> : seulement les activités dont tu as la propriété (et le mode groupe si tu l’as choisi).</li>' +
    '<li><b>Le plus payant par minute d’abord</b> : à chaque créneau, le plan choisit l’activité qui rapporte le plus par minute. Un 1er run de la semaine compte avec son gain bonus, donc il passe presque toujours devant.</li>' +
    '<li><b>Les recharges</b> : une activité terminée n’est reproposée qu’après sa recharge (Cayo 144 min, Dr. Dre ≈ 48 min…). Tes chronos en cours sont pris en compte.</li>' +
    '<li><b>Les limites</b> : 3 braquages de casse par semaine, Kortz et KnoWay une fois par session.</li>' +
    '<li><b>Clôture</b> : 15 min pour vendre et réapprovisionner si tu as des business passifs.</li></ol>' +
    '<p class="small muted">Les durées sont celles d’un joueur qui connaît les missions, multipliées par ton rythme (débutant ×1,35, rapide ×0,8). Les gains sont des moyennes : note les vrais dans le journal avec « Terminé ».</p></details></div>';

  h += '<div class="grid" style="margin-top:16px">';
  h += '<div class="card s6"><h2>Chaque jour <small>' + resetLine('reset', P.d.next) + '</small></h2><div class="checks">' + dailyItems().map(it => checkRow('daily', it, !!state.daily.done[it.id])).join('') + '</div></div>';
  h += '<div class="card s6"><h2>Chaque semaine <small>' + resetLine('reset jeudi 11 h', P.w.next) + '</small></h2><div class="checks">' + weeklyList(weeklyItems()) + monthlyRow() + '</div></div>';
  h += '</div>';
  h += '<h2 class="section-title">La semaine type</h2><p class="section-sub">Les bonus de 1re réalisation se remettent à zéro le jeudi : organise ta semaine autour.</p>' +
    '<div class="week-rhythm">' +
    '<div><b>Jeudi</b><span class="small">Nouveaux bonus. Synchronise et lance les 1ers runs qui paient le plus.</span></div>' +
    '<div><b>Vendredi au dimanche</b><span class="small">Grosses sessions : boucle Cayo et Dr. Dre, ventes de stock.</span></div>' +
    '<div><b>Lundi, mardi</b><span class="small">Sessions courtes : objectifs du jour, contrats, coffres.</span></div>' +
    '<div><b>Mercredi soir</b><span class="small">Rattrape les 1ers runs oubliés avant le reset de jeudi 11 h.</span></div></div>';
  return h;
}
function stepRow(s, start){
  const at = new Date(start.getTime() + s.t*60000);
  const rel = '+' + Math.floor(s.t/60) + ':' + String(s.t%60).padStart(2,'0');
  if (s.kind === 'aux'){
    return '<li class="step-aux"><div class="when"><b>' + hhmm(at) + '</b><span>' + rel + '</span></div><div class="what"><h3>' + esc(s.title) + '</h3><div class="meta">' + dmin(s.dur) + '</div><p class="tip">' + esc(s.text) + '</p></div></li>';
  }
  const a = s.act, key = a.id + '@' + s.t;
  const label = a.name + (s.n > 1 ? ' ×' + s.n : '');
  const tg = weekTargetFor(a.id);
  let actions;
  if (ui.completing === key){
    actions = '<form class="confirm" data-form="complete" data-id="' + a.id + '" data-first="' + (s.first ? 1 : 0) + '">' +
      '<label class="small" for="cf-amt">Gain réel</label><input type="text" id="cf-amt" value="' + esc(NF.format(s.first ? a.first : a.pay)) + '" autocomplete="off">' +
      '<button class="btn sm primary" type="submit">Valider</button><button class="btn sm ghost" type="button" data-act="cancel-complete">Annuler</button></form>';
  } else {
    actions = '<div class="actions row"><button class="btn sm primary" data-act="complete" data-id="' + key + '">Terminé, noter le gain</button><a class="btn sm ghost" href="#activite-' + a.id + '">Fiche</a></div>';
  }
  return '<li><div class="when"><b>' + hhmm(at) + '</b><span>' + rel + '</span></div><div class="what">' +
    '<div class="row"><h3>' + esc(label) + '</h3>' + (s.first ? '<span class="pill next">1er run de la semaine</span>' : '') + '</div>' +
    '<div class="meta">≈ ' + dmin(s.dur) + ' · <span class="money">+' + short(s.gain) + '</span>' + (a.cd ? ' · recharge ' + esc(a.cdTxt) : '') + '</div>' +
    (a.tip ? '<p class="tip">' + esc(a.tip) + '</p>' : '') +
    (tg.length ? '<p class="tip"><b>Cibles de la semaine :</b> ' + esc(tg.join(', ')) + '</p>' : '') + actions + '</div></li>';
}

/* ---------- Mon empire ---------- */
function renderEmpire(){
  const S = state.settings;
  const owned = PROPS.filter(p => own(p.id)).length;
  let h = head('Mon empire', 'Coche ce que tu possèdes, améliorations comprises : chacune compte à part. Le plan d’achat, les routines et les méthodes s’adaptent.',
    '<div class="row"><span class="pill solid">' + owned + ' coché' + (owned > 1 ? 's' : '') + '</span><span class="pill ok">≈ ' + short(empireValue()) + '</span></div>');
  h += '<div class="card"><h2>Mon profil</h2><div class="settings">' +
    selectField('platform', 'Plateforme', [['ps5','PS5'],['xbox','Xbox Series X|S'],['pce','PC (Enhanced)'],['pcl','PC (Legacy)']], S.platform) +
    selectField('gtaplus', 'GTA+', [['0','Non'],['1','Oui, abonné']], S.gtaplus ? '1' : '0') +
    selectField('mode', 'Je joue', [['solo','Surtout en solo'],['groupe','Parfois en groupe']], S.mode) +
    selectField('pace', 'Mon rythme', [['debutant','Débutant'],['normal','Normal'],['rapide','Rapide (je connais les missions)']], S.pace) +
    selectField('hours', 'Je joue par semaine', HOURS_OPTS.map(([v,l]) => [String(v), l]), String(S.hours || 10)) +
    '</div>' + (S.platform === 'pcl' && S.gtaplus ? '<p class="notice">GTA+ n’existe pas sur PC Legacy : il faut la version Enhanced.</p>' : '') +
    (S.platform === 'pcl' ? '' : '<p class="small muted" style="margin:10px 0 0">Nouveau personnage sur cette plateforme ? Le Career Builder offre 4 M$ au départ (une seule fois).</p>') + '</div>';
  CATS.forEach(cat => {
    const tops = PROPS.filter(p => p.cat === cat.id && (!p.parent || PROP[p.parent].cat !== cat.id));
    h += '<h2 class="section-title">' + esc(cat.name) + '</h2><p class="section-sub">' + esc(cat.desc) + '</p><div class="card"><div class="checks">' + tops.map(p => propTree(p, 0)).join('') + '</div></div>';
  });
  h += '<h2 class="section-title" id="sauvegarde">Sauvegarde et transfert</h2><p class="section-sub">Tes données restent dans ce navigateur. Pour les passer du PC au téléphone (ou l’inverse), copie le code de transfert sur un appareil et colle-le sur l’autre.</p>' +
    '<div class="grid"><div class="card s6"><h2>Exporter</h2><div class="row"><button class="btn primary" data-act="export-copy">Copier le code de transfert</button><button class="btn" data-act="export-file">Télécharger un fichier</button></div>' +
    (ui.exportMsg ? '<p class="small" style="margin:10px 0 0">' + esc(ui.exportMsg) + '</p>' : '') +
    '<textarea id="export-out" readonly' + (ui.exportCode ? '' : ' hidden') + ' style="margin-top:10px;min-height:80px">' + esc(ui.exportCode || '') + '</textarea></div>' +
    '<div class="card s6"><h2>Importer</h2><div class="field"><label for="import-code">Coller un code de transfert</label><textarea id="import-code" placeholder="QG1:…" style="min-height:80px">' + esc(ui.importDraft || '') + '</textarea></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn primary" data-act="import-code">Importer le code</button><label class="btn" for="import-file">Choisir un fichier…</label><input type="file" id="import-file" accept=".json,application/json" hidden></div>' +
    (ui.importMsg ? '<p class="small" style="margin:10px 0 0">' + esc(ui.importMsg) + '</p>' : '') +
    '<p class="small muted" style="margin:10px 0 0">L’import remplace les données de cet appareil.</p></div></div>' +
    '<div class="row" style="margin-top:16px"><button class="btn ghost" data-act="reset-all">Tout effacer sur cet appareil</button></div>';
  return h;
}
function propTree(p, depth){
  return propRow(p, depth) + PROPS.filter(k => k.parent === p.id).map(k => propTree(k, depth + 1)).join('');
}
function propRow(p, depth, noLink){
  const ok = !p.parent || own(p.parent), id = 'own-' + p.id, o = own(p.id);
  const tag = p.kind === 'up' ? '<span class="tag">amélioration</span>' : '';
  const link = noLink ? '' : '<a class="flink" href="#fiche-' + ficheOf(p.id) + '" aria-label="Fiche : ' + esc(p.name) + '">Fiche</a>';
  if (p.max){
    const n = lvl(p.id);
    return '<div class="prop d' + Math.min(depth,2) + (n ? ' is-owned' : '') + (ok ? '' : ' locked') + '">' +
      '<select class="lvl" id="' + id + '" data-level="' + p.id + '"' + (ok ? '' : ' disabled') + ' aria-label="' + esc(p.name) + '">' +
      Array.from({length:p.max + 1}, (_, i) => '<option value="' + i + '"' + (i === n ? ' selected' : '') + '>' + i + '/' + p.max + '</option>').join('') + '</select>' +
      '<label class="body" for="' + id + '"><span class="label">' + esc(p.name) + ' ' + tag + '</span><span class="note">' + esc(p.what) + '</span></label>' +
      '<span class="price">' + priceTxt(p) + '</span>' + link + '</div>';
  }
  return '<div class="prop d' + Math.min(depth,2) + (o ? ' is-owned' : '') + (ok ? '' : ' locked') + '">' +
    '<input type="checkbox" id="' + id + '" data-own="' + p.id + '"' + (o ? ' checked' : '') + (ok ? '' : ' disabled') + '>' +
    '<label class="body" for="' + id + '"><span class="label">' + esc(p.name) + ' ' + tag + '</span><span class="note">' + esc(p.what) + '</span></label>' +
    '<span class="price">' + priceTxt(p) + '</span>' + link + '</div>';
}
function selectField(key, label, opts, val){
  return '<div class="field"><label for="set-' + key + '">' + label + '</label><select id="set-' + key + '" data-setting="' + key + '">' +
    opts.map(([v,l]) => '<option value="' + v + '"' + (String(val) === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></div>';
}

/* ---------- Plan d'achat ---------- */
function chip(p){
  const st = p.max ? lvl(p.id) + '/' + p.max + ' · ' : '';
  return '<a class="mreq' + (full(p.id) ? ' ok' : '') + '" href="#fiche-' + ficheOf(p.id) + '">' + (full(p.id) ? '✓ ' : '') + esc(p.name) + ' · ' + st + priceTxt(p) + '</a>';
}
function optionMetrics(o){
  if (!o.cost) return '<span class="small"><b class="money">Gratuit</b> · à faire tout de suite</span>';
  return '<span class="small">Rapporte <b class="money">≈ +' + short(o.gain) + '/sem.</b></span>' +
    '<span class="small">Achetable <b>' + (o.save > 0 ? 'dans ' + weeksTxt(o.save) : 'maintenant') + '</b></span>' +
    '<span class="small">Remboursé en <b>' + weeksTxt(o.payback) + '</b></span>';
}
function renderAchats(){
  const {base, ranked, slow, comfort} = purchaseOptions();
  const hours = state.settings.hours || 10;
  let h = head('Plan d’achat', 'Classé pour toi : en premier, ce qui sera rentabilisé le plus vite d’après ce que tu possèdes, ton solde et ton temps de jeu. Le classement se met à jour à chaque changement.',
    '<div style="min-width:min(220px,100%)">' + selectField('hours', 'Je joue par semaine', HOURS_OPTS.map(([v,l]) => [String(v), l]), String(hours)) + '</div>');
  h += '<div class="grid" style="margin-bottom:14px"><div class="card s7"><h2>Ton revenu estimé <small>' + hours + ' h de jeu par semaine</small></h2>' +
    '<div class="big money">≈ ' + short(base.total) + '<span class="muted" style="font-size:.45em"> /semaine</span></div>' +
    '<p class="small muted" style="margin:6px 0 0">Actif ≈ ' + short(base.active) + ' · passif ≈ ' + short(base.passive) + '. C’est la base qui sert à comparer chaque achat.</p></div>' +
    '<label class="toggle card s5" for="set-deduct"><input type="checkbox" id="set-deduct" data-setting-bool="deduct"' + (state.settings.deduct ? ' checked' : '') + '><span><b>Déduire le prix de mon solde</b><br><span class="small muted">Quand tu cliques sur « Je l’ai acheté ». Cocher dans Mon empire ne déduit rien.</span></span></label></div>';
  h += ranked.length ? '<ol class="road">' + ranked.map((o, i) => {
    const partial = o.items.length > o.missing.length;
    return '<li class="' + (i === 0 ? 'next' : 'later') + '"><span class="n">' + (i + 1) + '</span><div>' +
      '<div class="row between"><h3>' + esc(o.title) + '</h3>' + (i === 0 ? '<span class="pill next">Prochain</span>' : '') + '<span class="money">' + (o.cost ? short(o.cost) : 'Gratuit') + '</span></div>' +
      '<div class="foot">' + optionMetrics(o) + '</div>' +
      '<p class="small">' + esc(o.why) + '</p>' +
      '<div class="props">' + o.items.map(id => chip(PROP[id])).join('') + '</div>' +
      '<div class="foot">' + (o.unlocks ? '<span class="small"><span class="muted">Débloque :</span> ' + esc(o.unlocks) + '</span>' : '') +
      (partial ? '<span class="small muted">Il te reste : ' + o.missing.map(id => esc(PROP[id].name)).join(', ') + '</span>' : '') +
      '<button class="btn sm' + (i === 0 ? ' primary' : '') + '" data-act="buy" data-id="' + o.id + '">' + (o.cost ? 'Je l’ai acheté' : 'C’est fait') + '</button></div></div></li>';
  }).join('') + '</ol>' : '<div class="card"><p style="margin:0">Plus aucun achat rentable à ton rythme. Bravo.</p></div>';
  const compact = (list) => '<ul class="avoid">' + list.map(o => '<li><div class="row between"><b>' + esc(o.title) + '</b><span class="money">' + short(o.cost) + '</span></div>' +
    '<span class="small muted">' + (o.gain > 0 ? '≈ +' + short(o.gain) + '/sem. · remboursé en ' + weeksTxt(o.payback) + ' · ' : '') + esc(o.why) + '</span>' +
    '<div class="row" style="margin-top:6px"><a class="btn sm ghost" href="#fiche-' + ficheOf(o.main) + '">Fiche</a><button class="btn sm" data-act="buy" data-id="' + o.id + '">Je l’ai acheté</button></div></li>').join('') + '</ul>';
  if (slow.length) h += '<details class="card more" style="margin-top:16px"><summary><b>Pas rentable à ton rythme</b> (' + slow.length + ') : plus de 2 ans pour se rembourser</summary>' + compact(slow) + '</details>';
  if (comfort.length) h += '<details class="card more" style="margin-top:16px"><summary><b>Confort, sans gain direct</b> (' + comfort.length + ') : sécurité, véhicules…</summary>' +
    '<p class="small muted">Ils ne changent pas tes gains dans le calcul. Certains font quand même gagner du temps (Oppressor Mk II).</p>' + compact(comfort) + '</details>';
  h += '<details class="card more" style="margin-top:16px"><summary><b>Comment ce classement est calculé</b></summary>' +
    '<ol class="explain"><li><b>Ta semaine est simulée.</b> Ton temps de jeu (' + hours + ' h) est découpé en sessions de 2 h, avec le même calcul que le plan de session : 1ers runs de la semaine, recharges, limites (3 casses par semaine…). S’y ajoutent tes revenus passifs pendant que tu es connecté.</li>' +
    '<li><b>Chaque achat est testé.</b> L’appli refait la simulation comme si tu l’avais déjà. La différence, c’est ce qu’il te rapporte en plus par semaine.</li>' +
    '<li><b>Le score, c’est le temps avant qu’il soit rentabilisé :</b> les semaines pour réunir l’argent (en partant de ton solde, à ton revenu actuel), plus les semaines pour le rembourser avec ce qu’il rapporte. Le plus petit score passe en premier.</li>' +
    '<li><b>Les dépendances sont incluses :</b> un achat comprend ce qu’il faut avant (le club-house pour la meth). La boîte de nuit ne vaut que si tu as des business pour la remplir (bunker, MC, entrepôt PDG).</li>' +
    '<li><b>Mis à part :</b> le gratuit passe toujours en tête ; ce qui mettrait plus de 2 ans à se rembourser, et ce qui ne rapporte rien, est rangé en bas.</li></ol>' +
    '<p class="small muted">Les gains viennent des moyennes de l’appli (voir les fiches) : c’est un classement indicatif. Il change dès que tu coches quelque chose, que ton solde bouge ou que tu modifies ton temps de jeu. Le mode groupe ajoute les braquages à plusieurs.</p></details>';
  h += '<div class="grid" style="margin-top:16px"><div class="card s6"><h2>À éviter</h2><ul class="avoid">' + AVOID.map(([t,d]) => '<li><b>' + esc(t) + '</b><span class="small muted">' + esc(d) + '</span></li>').join('') + '</ul></div>' +
    '<div class="card s6"><h2>Règles d’or</h2><ol class="rules">' + RULES.map(r => '<li>' + esc(r) + '</li>').join('') + '</ol></div></div>';
  return h;
}

/* ---------- Fiches ---------- */
function renderFiches(){
  const q = ui.q.trim().toLowerCase();
  const match = (name, extra) => !q || (name + ' ' + (extra || '')).toLowerCase().includes(q);
  const acts = ACTS.filter(a => match(a.name));
  const props = PROPS.filter(p => p.fiche && p.cat !== 'vehicule' && match(p.name, p.alias));
  const vehs = PROPS.filter(p => p.fiche && p.cat === 'vehicule' && match(p.name));
  const card = (href, name, sub, pills) => '<a class="fcard" href="' + href + '"><b>' + esc(name) + '</b><span class="small muted">' + esc(sub) + '</span><span class="row">' + pills + '</span></a>';
  let h = head('Fiches', 'Chaque braquage, bâtiment et véhicule expliqué : ce que c’est, à quoi ça sert, comment l’obtenir et ce qu’il faut savoir.',
    '<div class="field" style="min-width:min(260px,100%)"><label for="f-q">Rechercher</label><input type="text" id="f-q" data-q value="' + esc(ui.q) + '" placeholder="ex. bunker, Cayo…" autocomplete="off"></div>');
  h += '<h2 class="section-title">Braquages et activités</h2><div class="fgrid">' + (acts.map(a => card('#activite-' + a.id, a.name, a.payTxt,
    (available(a) ? '<span class="pill ok">✓ Disponible</span>' : '<span class="pill">Pas encore</span>') + (a.solo ? '<span class="pill">Solo</span>' : '<span class="pill">Groupe</span>'))).join('') || '<p class="muted">Aucun résultat.</p>') + '</div>';
  h += '<h2 class="section-title">Bâtiments et business</h2><div class="fgrid">' + (props.map(p => card('#fiche-' + p.id, p.name, p.what,
    (own(p.id) ? '<span class="pill ok">✓ Possédé</span>' : '<span class="pill">' + priceTxt(p) + '</span>') + '<span class="pill">' + esc(catName(p.cat)) + '</span>')).join('') || '<p class="muted">Aucun résultat.</p>') + '</div>';
  h += '<h2 class="section-title">Véhicules</h2><div class="fgrid">' + (vehs.map(p => card('#fiche-' + p.id, p.name, p.what,
    own(p.id) ? '<span class="pill ok">✓ Possédé</span>' : '<span class="pill">' + priceTxt(p) + '</span>')).join('') || '<p class="muted">Aucun résultat.</p>') + '</div>';
  return h;
}
function section(title, body){ return body ? '<section class="fsec"><h2>' + title + '</h2>' + body + '</section>' : ''; }
function renderFiche(id){
  const p = PROP[id], f = p.fiche || {};
  const kids = PROPS.filter(k => k.parent === p.id);
  const ups = kids.filter(k => k.kind === 'up'), subs = kids.filter(k => k.kind !== 'up');
  const allIds = [p.id].concat(kids.map(k => k.id));
  const acts = ACTS.filter(a => a.req.some(r => allIds.includes(r)));
  const pass = PASSIVE.filter(x => x.req === p.id);
  const PO = purchaseOptions();
  const ri = PO.ranked.findIndex(o => o.missing.includes(p.id));
  const inSlow = PO.slow.find(o => o.missing.includes(p.id)), inComfort = PO.comfort.find(o => o.missing.includes(p.id));
  let h = '<a class="crumb" href="#fiches">← Toutes les fiches</a>';
  h += head(esc(p.name), '', '<div class="row"><span class="pill">' + esc(catName(p.cat)) + '</span><span class="pill solid">' + priceTxt(p) + '</span>' + (own(p.id) ? '<span class="pill ok">✓ Possédé</span>' : '') + '</div>');
  h += '<div class="grid"><div class="stack s8">';
  h += '<div class="card fiche">' + section('C’est quoi', f.quoi ? '<p>' + esc(f.quoi) + '</p>' : '') + section('À quoi ça sert', f.sert ? '<p>' + esc(f.sert) + '</p>' : '') +
    section('Comment l’obtenir', f.obtenir ? '<p>' + esc(f.obtenir) + '</p>' : '') +
    section('Conseils', f.conseils && f.conseils.length ? '<ul>' + f.conseils.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '') + '</div>';
  if (ups.length) h += '<div class="card"><h2>Améliorations <small>chacune se coche à part</small></h2><div class="checks">' + ups.map(k => propRow(k, 0, true)).join('') + '</div></div>';
  if (subs.length) h += '<div class="card"><h2>Ce qu’il débloque</h2><div class="checks">' + subs.map(k => propRow(k, 0)).join('') + '</div></div>';
  h += '</div><div class="stack s4">';
  h += '<div class="card"><h2>En bref</h2><div class="checks">' + propRow(p, 0, true) + '</div>' +
    (ri >= 0 ? '<p class="small" style="margin:10px 0 0"><span class="muted">Plan d’achat :</span> <a href="#achats">n° ' + (ri + 1) + ' de ton classement</a>' + (PO.ranked[ri].cost ? ' · ≈ +' + short(PO.ranked[ri].gain) + '/sem., remboursé en ' + weeksTxt(PO.ranked[ri].payback) : '') + '</p>'
      : inSlow ? '<p class="small" style="margin:10px 0 0"><span class="muted">Plan d’achat :</span> pas rentable à ton rythme (remboursé en ' + weeksTxt(inSlow.payback) + ').</p>'
      : inComfort ? '<p class="small" style="margin:10px 0 0"><span class="muted">Plan d’achat :</span> confort, sans gain direct dans le calcul.</p>' : '') +
    (f.avis ? '<p style="margin:10px 0 0"><b>Notre avis :</b> ' + esc(f.avis) + '</p>' : '') + '</div>';
  if (pass.length) h += '<div class="card"><h2>Revenu passif</h2>' + pass.map(x => {
    const mine = passiveRate(x);
    return '<p style="margin:0 0 8px"><b>' + esc(x.name) + '</b><br><span class="small">Stock plein : ' + esc(x.full) + (x.low ? ' · tout amélioré ≈ ' + short(x.low) + '/h' : '') + '</span>' +
      (own(p.id) && x.low ? '<br><span class="small">Avec tes améliorations : <b class="money">≈ ' + short(mine) + '/h</b></span>' : '') +
      (x.note ? '<br><span class="small muted">' + esc(x.note) + '</span>' : '') + '</p>';
  }).join('') + '</div>';
  if (acts.length) h += '<div class="card"><h2>Activités débloquées</h2><div class="stack" style="gap:10px">' + acts.map(a =>
    '<a class="fcard" href="#activite-' + a.id + '"><b>' + esc(a.name) + '</b><span class="small muted">' + esc(a.payTxt) + '</span></a>').join('') + '</div></div>';
  h += '</div></div>';
  return h;
}
function renderActivite(id){
  const a = ACT[id], f = a.fiche || {};
  const rate = a.pay / a.dur * 60, frate = a.first ? a.first / a.dur * 60 : 0;
  const tg = weekTargetFor(a.id);
  const sv = a.id === 'salvage' ? salvageTargets() : [];
  const tips = (f.conseils || []).slice();
  if (a.tip && !tips.includes(a.tip)) tips.push(a.tip);
  let h = '<a class="crumb" href="#fiches">← Toutes les fiches</a>';
  h += head(esc(a.name), '', '<div class="row">' + (available(a) ? '<span class="pill ok">✓ Disponible pour toi</span>' : '<span class="pill">Pas encore disponible</span>') +
    '<span class="pill">' + (a.solo ? 'Solo possible' : 'En groupe') + '</span></div>');
  h += '<div class="grid"><div class="stack s8"><div class="card fiche">' +
    section('C’est quoi', f.quoi ? '<p>' + esc(f.quoi) + '</p>' : '') +
    section('Comment ça se passe', f.etapes && f.etapes.length ? '<ol>' + f.etapes.map(e => '<li>' + esc(e) + '</li>').join('') + '</ol>' : '') +
    section('Cette semaine', tg.length ? '<p><b>Cibles principales :</b> ' + esc(tg.join(', ')) + '</p>' : (sv.length ? '<p><b>Véhicules à voler :</b> ' + esc(sv.join(' · ')) + '</p>' : '')) +
    section('Conseils', tips.length ? '<ul>' + tips.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '') +
    '</div></div><div class="stack s4">';
  h += '<div class="card"><h2>Ce que ça rapporte</h2><p style="margin:0">' + esc(a.payTxt) + '</p>' +
    '<div class="kv" style="grid-template-columns:1fr 1fr"><div><span class="eyebrow">Durée</span><b>≈ ' + dmin(a.dur) + '</b></div><div><span class="eyebrow">Recharge</span><b>' + esc(a.cdTxt) + '</b></div>' +
    '<div><span class="eyebrow">Gain/heure</span><b class="money">≈ ' + short(rate) + '</b></div>' + (frate ? '<div><span class="eyebrow">1er run hebdo</span><b class="money">≈ ' + short(frate) + '/h</b></div>' : '') + '</div>' +
    (a.weekly ? '<div class="checks" style="margin-top:12px">' + checkRow('weekly', {id:a.weekly, label:'1er run de la semaine fait', gain:a.first || null, gainTxt:a.first ? '' : 'Bonus'}, !!state.weekly.done[a.weekly]) + '</div>' : '') +
    (a.cd ? '<button class="btn sm" style="margin-top:12px" data-act="act-timer" data-id="' + a.id + '">Lancer la recharge (' + dmin(a.cd) + ')</button>' : '') + '</div>';
  h += '<div class="card"><h2>Ce qu’il faut</h2>' + (a.req.length ? '<div class="stack" style="gap:8px">' + a.req.map(r =>
    '<a class="mreq' + (own(r) ? ' ok' : '') + '" href="#fiche-' + ficheOf(r) + '">' + (own(r) ? '✓ ' : '') + esc(PROP[r].name) + ' · ' + priceTxt(PROP[r]) + '</a>').join('') + '</div>' : '<p style="margin:0">Aucune propriété : c’est gratuit.</p>') +
    (a.solo ? '' : '<p class="small muted" style="margin:10px 0 0">Il faut au moins un autre joueur.</p>') + '</div>';
  h += '</div></div>';
  return h;
}

/* ---------- Méthodes ---------- */
function renderMethodes(){
  const rows = ACTS.map(a => ({a, rate: a.pay / a.dur * 60, frate: a.first ? a.first / a.dur * 60 : 0, ok: available(a)}))
    .filter(r => ui.filter === 'all' || r.ok)
    .sort((x,y) => y.rate - x.rate);
  const max = Math.max(1, ...ACTS.map(a => a.pay / a.dur * 60));
  let h = head('Méthodes', 'Les gains par heure de jeu effective, recharges non comprises. Tu remplis les recharges avec d’autres activités.',
    '<div class="chips" role="group" aria-label="Filtre"><button class="chip" data-act="filter" data-v="mine" aria-pressed="' + (ui.filter === 'mine') + '">Disponible pour moi</button><button class="chip" data-act="filter" data-v="all" aria-pressed="' + (ui.filter === 'all') + '">Tout</button></div>');
  h += '<div class="card"><h2>Revenus actifs <small>trié par gain/heure en répétition</small></h2><div class="mlist">' +
    (rows.length ? rows.map(r => {
      const a = r.a;
      const req = a.req.length ? a.req.map(id => '<span class="mreq' + (own(id) ? ' ok' : '') + '">' + (own(id) ? '✓ ' : '') + esc(PROP[id].name) + '</span>').join('') : '<span class="mreq ok">Aucune propriété</span>';
      return '<div class="mrow' + (r.ok ? '' : ' off') + '"><div class="mname"><a href="#activite-' + a.id + '"><b>' + esc(a.name) + '</b></a><div class="chips">' + req + (a.solo ? '' : '<span class="mreq">Groupe</span>') + '</div></div>' +
        '<div class="mpay">' + esc(a.payTxt) + '<br><span class="muted">≈ ' + dmin(a.dur) + ' · recharge ' + esc(a.cdTxt) + '</span></div>' +
        '<div class="mrate"><b>≈ ' + short(r.rate) + '/h</b>' + (r.frate ? ' <span class="small muted">· 1er run ≈ ' + short(r.frate) + '/h</span>' : '') +
        '<div class="meter money"><i style="width:' + Math.round(r.rate / max * 100) + '%"></i></div></div></div>';
    }).join('') : '<p class="muted" style="margin:0">Rien de disponible avec ton empire actuel. Coche tes propriétés dans Mon empire, ou affiche tout.</p>') + '</div></div>';
  h += '<h2 class="section-title">Revenus passifs</h2><p class="section-sub">Un jour de jeu dure 48 minutes réelles. Ces business ne produisent que si tu es connecté. La dernière colonne tient compte de tes améliorations.</p>' +
    '<div class="card"><div class="scroll-x"><table class="ptable"><thead><tr><th>Business</th><th>Stock plein</th><th>Tout amélioré</th><th>Chez toi</th><th>Conseil</th></tr></thead><tbody>' +
    PASSIVE.map(p => '<tr class="' + (own(p.req) ? '' : 'off') + '"><td><a href="#fiche-' + ficheOf(p.req) + '"><b>' + esc(p.name) + '</b></a></td><td class="n">' + esc(p.full) + '</td><td class="n">' +
      (p.high ? (p.low === p.high ? short(p.low) : short(p.low) + '–' + short(p.high)) + '/h' : '—') + '</td><td class="n">' + (own(p.req) && p.low ? '<b class="money">≈ ' + short(passiveRate(p)) + '/h</b>' : '—') + '</td><td class="small">' + esc(p.note) + '</td></tr>').join('') +
    '</tbody></table></div><p class="small muted" style="margin:10px 0 0">Les sources divergent beaucoup sur le passif (frais de fournitures inclus ou non) : la fourchette basse est la plus réaliste. Sans améliorations, compte environ 45 % de la valeur « tout amélioré ».</p></div>';
  return h;
}

/* ---------- Chronos ---------- */
function timerCard(t){
  const left = t.end - Date.now(), total = Math.max(1, t.end - t.start);
  const pct = Math.min(100, Math.max(0, Math.round((1 - left/total) * 100)));
  return '<div class="timer' + (left <= 0 ? ' ready' : '') + '" data-timer="' + t.id + '"><div><div class="t-label">' + esc(t.label) + '</div><div class="small muted">Fin à ' + hhmm(new Date(t.end)) + '</div></div>' +
    '<div class="t-left" data-end="' + t.end + '">' + clock(left) + '</div>' +
    '<div class="meter"><i data-bar-start="' + t.start + '" data-bar-end="' + t.end + '" style="width:' + pct + '%"></i></div>' +
    '<div class="row"><button class="btn sm" data-act="timer-restart" data-id="' + t.id + '">Relancer</button><button class="btn sm ghost" data-act="timer-del" data-id="' + t.id + '">Supprimer</button></div></div>';
}
function renderChronos(){
  const timers = state.timers.slice().sort((a,b) => a.end - b.end);
  const presets = PRESETS.map((p,i) => Object.assign({i}, p)).filter(p => p.req.every(own));
  let h = head('Chronos', 'Lance une recharge quand tu termines une activité. Le plan de session en tient compte. Garde la page ouverte sur ton téléphone pendant que tu joues.');
  h += '<div class="grid"><div class="card s7"><h2>En cours</h2>' + (timers.length ? '<div class="timers">' + timers.map(timerCard).join('') + '</div>' : '<p class="muted" style="margin:0">Aucun chrono. Choisis-en un à droite.</p>') + '</div>';
  h += '<div class="stack s5"><div class="card"><h2>Lancer</h2><div class="presets">' + presets.map(p => '<button class="preset" data-act="preset" data-i="' + p.i + '"><b>' + dmin(p.min) + '</b>' + esc(p.label) + '</button>').join('') + '</div>' +
    '<form class="form-row" data-form="custom-timer" style="margin-top:14px"><div class="field"><label for="ct-label">Chrono perso</label><input type="text" id="ct-label" placeholder="ex. Labo d’acide plein" autocomplete="off"></div>' +
    '<div class="field" style="flex:0 1 90px"><label for="ct-min">Minutes</label><input type="number" id="ct-min" min="1" max="1440" value="30"></div><button class="btn" type="submit">Lancer</button></form></div>' +
    '<div class="card"><h2>Options</h2>' +
    '<label class="toggle" for="opt-sound"><input type="checkbox" id="opt-sound" data-ui="sound"' + (ui.sound ? ' checked' : '') + '><span><b>Bip à la fin d’un chrono</b><br><span class="small muted">Fonctionne tant que la page reste ouverte.</span></span></label>' +
    '<label class="toggle" for="opt-wake" style="margin-top:12px"><input type="checkbox" id="opt-wake" data-ui="wake"' + (wantWake ? ' checked' : '') + '><span><b>Garder l’écran allumé</b><br><span class="small muted">Pratique sur un téléphone posé à côté de la manette.</span></span></label>' +
    (wakeMsg ? '<p class="notice">' + esc(wakeMsg) + '</p>' : '') + '</div></div></div>';
  return h;
}

/* ---------- Journal ---------- */
function renderJournal(P){
  const now = Date.now(), today = localDayKey(now);
  const tot = arr => sum(arr.map(e => e.amount));
  const gToday = tot(state.log.filter(e => localDayKey(e.t) === today));
  const gWeek = tot(state.log.filter(e => e.t >= P.w.start));
  const g7 = tot(state.log.filter(e => e.t >= now - 7*864e5));
  const gAll = tot(state.log);
  const srcOpts = ['Cayo Perico','Contrat Dr. Dre','The Titan Job','Cluckin’ Bell Farm Raid','KnoWay Out','Kortz Center Heist','Contrat du garage auto','Braquage de la casse','Payphone Hit','Vente de stock','Coffres','Quotidiens','GTA+','Autre'];
  let h = head('Journal', 'Note ce que tu gagnes pour voir ta vraie progression. Une dépense ? Tape un montant négatif (ex. −1,2M).');
  h += '<div class="tiles"><div class="tile"><span class="eyebrow">Aujourd’hui</span><b>' + short(gToday) + '</b></div><div class="tile"><span class="eyebrow">Depuis jeudi</span><b>' + short(gWeek) + '</b></div>' +
    '<div class="tile"><span class="eyebrow">7 derniers jours</span><b>' + short(g7) + '</b></div><div class="tile"><span class="eyebrow">Total noté</span><b>' + short(gAll) + '</b></div></div>';
  h += '<div class="grid" style="margin-top:16px"><div class="card s5"><h2>Noter un gain</h2><form data-form="log" class="stack" style="gap:10px">' +
    '<div class="field"><label for="lg-amt">Montant</label><input type="text" id="lg-amt" autocomplete="off" placeholder="ex. 1,1M ou 450k" required></div>' +
    '<div class="field"><label for="lg-src">Source</label><select id="lg-src">' + srcOpts.map(s => '<option>' + esc(s) + '</option>').join('') + '</select></div>' +
    '<label class="toggle" for="lg-cash"><input type="checkbox" id="lg-cash"' + (state.settings.addCash ? ' checked' : '') + '><span>Mettre à jour mon solde aussi</span></label>' +
    '<button class="btn primary" type="submit">Ajouter</button></form></div>';
  h += '<div class="card s7"><h2>14 derniers jours <small>gains par jour</small></h2>' + chart14() + '</div></div>';
  const entries = state.log.slice().sort((a,b) => b.t - a.t).slice(0,60);
  h += '<div class="grid" style="margin-top:16px"><div class="card s7"><h2>Dernières entrées <small>' + state.log.length + ' au total</small></h2>' +
    (entries.length ? '<div class="entries">' + entries.map(e => '<div class="entry"><div><div class="src">' + esc(e.src) + '</div><div class="d">' +
      new Date(e.t).toLocaleString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) + '</div></div>' +
      '<span class="money' + (e.amount < 0 ? ' neg' : '') + '">' + (e.amount < 0 ? '' : '+') + fmt(e.amount) + '</span>' +
      '<button class="icon-btn" data-act="log-del" data-id="' + e.id + '" aria-label="Supprimer cette entrée">×</button></div>').join('') + '</div>'
      : '<p class="muted" style="margin:0">Rien de noté pour l’instant. Le bouton « Terminé » des plans de session note aussi ici.</p>') + '</div>';
  h += '<div class="card s5"><h2>Mes notes</h2><textarea id="notes" data-notes placeholder="ex. Cible Cayo cette semaine : collier de rubis. Promo agence −40 % jusqu’à jeudi.">' + esc(state.notes) + '</textarea><p class="small muted" style="margin:6px 0 0">Enregistrées automatiquement.</p></div></div>';
  return h;
}
function chart14(){
  const days = [];
  const base = new Date(); base.setHours(12,0,0,0);
  for (let i = 13; i >= 0; i--){ const d = new Date(base.getTime() - i*864e5); days.push({key:localDayKey(d.getTime()), d, v:0}); }
  const idx = Object.fromEntries(days.map((x,i) => [x.key, i]));
  state.log.forEach(e => { const i = idx[localDayKey(e.t)]; if (i !== undefined && e.amount > 0) days[i].v += e.amount; });
  const maxV = Math.max(...days.map(d => d.v));
  if (!maxV) return '<p class="muted" style="margin:0">Le graphique apparaîtra dès ta première entrée.</p>';
  const step = niceStep(maxV / 3), top = Math.ceil(maxV / step) * step;
  const W = 700, H = 230, L = 52, R = 8, T = 22, B = 26, iw = W - L - R, ih = H - T - B, band = iw / days.length, bw = Math.min(30, band * 0.62);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gains par jour sur 14 jours">';
  for (let v = 0; v <= top + 1; v += step){
    const y = T + ih - v / top * ih;
    s += '<line class="grid-l" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="axis" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + esc(short(v)) + '</text>';
  }
  days.forEach((d, i) => {
    const x = L + i * band + (band - bw) / 2, bh = d.v / top * ih, y = T + ih - bh;
    const lab = d.d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
    if (d.v) s += '<path class="bar-m" id="bar-' + i + '" d="' + barPath(x, y, bw, bh, 4) + '"/>';
    s += '<rect class="hit" data-i="' + i + '" data-tip="' + esc(lab + ' · ' + short(d.v)) + '" data-x="' + (L + i*band + band/2).toFixed(1) + '" data-y="' + (d.v ? y : T + ih).toFixed(1) + '" x="' + (L + i*band).toFixed(1) + '" y="' + T + '" width="' + band.toFixed(1) + '" height="' + ih + '"/>';
    if ((days.length - 1 - i) % 2 === 0) s += '<text class="axis" x="' + (L + i*band + band/2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + d.d.getDate() + '</text>';
    if (i === days.length - 1 && d.v) s += '<text class="vlabel" x="' + (x + bw/2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle">' + esc(short(d.v)) + '</text>';
  });
  s += '</svg>';
  return '<div class="chart" id="chart">' + s + '<div class="pop" id="pop" hidden></div></div>';
}
function niceStep(raw){
  const p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
function barPath(x, y, w, h, r){
  r = Math.min(r, w/2, h);
  return 'M' + x.toFixed(1) + ',' + (y + h).toFixed(1) + 'V' + (y + r).toFixed(1) + 'Q' + x.toFixed(1) + ',' + y.toFixed(1) + ' ' + (x + r).toFixed(1) + ',' + y.toFixed(1) +
    'H' + (x + w - r).toFixed(1) + 'Q' + (x + w).toFixed(1) + ',' + y.toFixed(1) + ' ' + (x + w).toFixed(1) + ',' + (y + r).toFixed(1) + 'V' + (y + h).toFixed(1) + 'Z';
}

/* ---------- Rendu principal et navigation ---------- */
const VIEWS = {tableau:renderDash, routines:renderRoutines, empire:renderEmpire, achats:renderAchats, fiches:renderFiches,
  methodes:renderMethodes, chronos:renderChronos, journal:renderJournal,
  fiche: () => renderFiche(route.id), activite: () => renderActivite(route.id)};
function render(){
  const P = periods();
  const active = document.activeElement;
  const focusId = active && active.id && view.contains(active) ? active.id : null;
  const sel = focusId && typeof active.selectionStart === 'number' ? [active.selectionStart, active.selectionEnd] : null;
  const typed = focusId && active.tagName === 'INPUT' && active.type === 'text' ? active.value : null;
  document.getElementById('top-cash').textContent = short(state.cash);
  const tab = route.view === 'fiche' || route.view === 'activite' ? 'fiches' : route.view;
  document.querySelectorAll('.tab').forEach(b => { if (b.dataset.tab === tab) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  const doneTimers = state.timers.filter(t => t.end <= Date.now()).length;
  document.querySelector('.tab[data-tab="chronos"]').innerHTML = 'Chronos' + (doneTimers ? '<span class="dot">' + doneTimers + '</span>' : '');
  view.innerHTML = VIEWS[route.view](P);
  if (focusId){
    const el = document.getElementById(focusId);
    if (el){
      if (typed !== null && el.tagName === 'INPUT' && !el.value) el.value = typed;
      el.focus({preventScroll:true});
      if (sel) { try { el.setSelectionRange(sel[0], sel[1]); } catch(e){} }
    }
  }
  bindChart();
}
function bindChart(){
  const chart = document.getElementById('chart'); if (!chart) return;
  const pop = document.getElementById('pop'), svg = chart.querySelector('svg');
  const mark = (r, on) => { const b = document.getElementById('bar-' + r.dataset.i); if (b) b.classList.toggle('on', on); };
  const show = r => {
    const box = svg.getBoundingClientRect(), k = box.width / 700;
    chart.querySelectorAll('.bar-m.on').forEach(b => b.classList.remove('on'));
    mark(r, true);
    pop.textContent = r.dataset.tip; pop.hidden = false;
    pop.style.left = (+r.dataset.x * k) + 'px'; pop.style.top = (+r.dataset.y * k - 4) + 'px';
  };
  chart.querySelectorAll('.hit').forEach(r => {
    r.addEventListener('pointerenter', () => show(r));
    r.addEventListener('pointerleave', () => { pop.hidden = true; mark(r, false); });
    r.addEventListener('click', () => show(r));
  });
}
function parseRoute(){
  const h = decodeURIComponent((location.hash || '').slice(1));
  if (h.startsWith('fiche-')){ const id = h.slice(6); if (PROP[id]) return {view:'fiche', id: PROP[id].fiche ? id : ficheOf(id)}; }
  if (h.startsWith('activite-')){ const id = h.slice(9); if (ACT[id]) return {view:'activite', id}; }
  return {view: TABS.includes(h) ? h : 'tableau'};
}
function onRoute(){
  const next = parseRoute();
  const changed = next.view !== route.view || next.id !== route.id;
  route = next;
  ui.completing = null; ui.exportMsg = ui.importMsg = ui.exportCode = ui.importDraft = '';
  render();
  if (changed) window.scrollTo({top:0});
}

/* ======================================================================
   ACTIONS
   ====================================================================== */
function addLog(amount, src, toCash){
  state.log.push({id:uid(), t:Date.now(), amount, src, c: !!toCash});
  if (toCash) state.cash = Math.max(0, state.cash + amount);
}
function startTimer(label, min, act){
  const now = Date.now();
  state.timers = state.timers.filter(t => !(act && t.act === act));
  state.timers.push({id:uid(), act: act || null, label, start:now, end: now + min*60000});
}

document.getElementById('tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  if (location.hash === '#' + b.dataset.tab) onRoute(); else location.hash = b.dataset.tab;
});

view.addEventListener('click', e => {
  ensureAudio();
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  if (act === 'intro-hide'){ ui.introHidden = true; saveUI(); render(); }
  else if (act === 'budget'){ ui.budget = +b.dataset.min; ui.completing = null; saveUI(); render(); }
  else if (act === 'filter'){ ui.filter = b.dataset.v; saveUI(); render(); }
  else if (act === 'sync-bonus'){ syncBonus(true); }
  else if (act === 'salvage'){ state.weekly.salvage = Math.min(3, Math.max(0, (state.weekly.salvage || 0) + (+b.dataset.d))); commit(); }
  else if (act === 'complete'){ ui.completing = id; render(); const i = document.getElementById('cf-amt'); if (i){ i.focus(); i.select(); } }
  else if (act === 'cancel-complete'){ ui.completing = null; render(); }
  else if (act === 'act-timer'){ const a = ACT[id]; if (a && a.cd){ startTimer('Recharge ' + a.name, a.cd, a.id); commit(); } }
  else if (act === 'buy'){
    const o = findOption(id); if (!o) return;
    if (state.settings.deduct && o.cost) state.cash = Math.max(0, state.cash - o.cost);
    o.missing.forEach(pid => setOwned(pid, true));
    commit();
  }
  else if (act === 'preset'){ const p = PRESETS[+b.dataset.i]; if (p){ startTimer(p.label, p.min, p.act); commit(); } }
  else if (act === 'timer-del'){ state.timers = state.timers.filter(t => t.id !== id); notified.delete(id); commit(); }
  else if (act === 'timer-restart'){
    const t = state.timers.find(x => x.id === id);
    if (t){ const len = t.end - t.start; t.start = Date.now(); t.end = t.start + len; notified.delete(id); commit(); }
  }
  else if (act === 'export-copy'){
    encodeState().then(code => {
      ui.exportCode = code;
      const done = msg => { ui.exportMsg = msg; render(); const t = document.getElementById('export-out'); if (t){ t.focus(); t.select(); } };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(() => done('Code copié. Colle-le sur ton autre appareil (message à toi-même, notes…).'), () => done('Copie automatique refusée : sélectionne le code ci-dessous et copie-le.'));
      } else done('Sélectionne le code ci-dessous et copie-le.');
    });
  }
  else if (act === 'export-file'){
    const blob = new Blob([JSON.stringify(state, null, 1)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'qg-los-santos-' + localDayKey(Date.now()) + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    ui.exportMsg = 'Fichier téléchargé.'; render();
  }
  else if (act === 'import-code'){
    const v = (document.getElementById('import-code') || {}).value || '';
    if (!v.trim()){ ui.importMsg = 'Colle d’abord un code de transfert.'; render(); return; }
    if (!confirm('Remplacer les données de cet appareil par celles du code ?')) return;
    decodeCode(v).then(obj => { importState(obj); ui.importDraft = ''; ui.importMsg = 'Import réussi.'; render(); })
      .catch(() => { ui.importDraft = v; ui.importMsg = 'Code illisible. Vérifie qu’il est complet : il commence par QG1: ou QG0:.'; render(); });
  }
  else if (act === 'reset-all'){
    if (!confirm('Effacer toutes tes données sur cet appareil ? Pense à exporter avant.')) return;
    state = defaults(); notified.clear(); commit();
  }
  else if (act === 'log-del'){
    const e2 = state.log.find(x => x.id === id);
    if (e2){ if (e2.c) state.cash = Math.max(0, state.cash - e2.amount); state.log = state.log.filter(x => x.id !== id); commit(); }
  }
});

view.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.check){
    const k = el.dataset.check, id = el.dataset.id;
    const bag = k === 'daily' ? state.daily.done : k === 'weekly' ? state.weekly.done : state.monthly.done;
    if (el.checked) bag[id] = true; else delete bag[id];
    commit();
  } else if (el.dataset.own){
    setOwned(el.dataset.own, el.checked); commit();
  } else if (el.dataset.level){
    setOwned(el.dataset.level, +el.value); commit();
  } else if (el.dataset.setting){
    const k = el.dataset.setting;
    state.settings[k] = k === 'gtaplus' ? el.value === '1' : k === 'hours' ? +el.value : el.value; commit();
  } else if (el.dataset.settingBool){
    state.settings[el.dataset.settingBool] = el.checked; commit();
  } else if (el.dataset.ui === 'sound'){
    ui.sound = el.checked; saveUI(); if (el.checked){ ensureAudio(); beep(1); }
  } else if (el.dataset.ui === 'wake'){
    toggleWake(el.checked);
  } else if (el.id === 'import-file' && el.files && el.files[0]){
    el.files[0].text().then(txt => {
      if (!confirm('Remplacer les données de cet appareil par celles du fichier ?')) return;
      importState(JSON.parse(txt)); ui.importMsg = 'Import réussi.'; render();
    }).catch(() => { ui.importMsg = 'Fichier illisible : choisis un fichier exporté depuis QG Los Santos.'; render(); });
  } else if (el.id === 'lg-cash'){
    state.settings.addCash = el.checked; persist();
  }
});

let notesTimer = null;
view.addEventListener('input', e => {
  if (e.target.hasAttribute('data-notes')){
    state.notes = e.target.value.slice(0, 5000);
    clearTimeout(notesTimer); notesTimer = setTimeout(persist, 700);
  } else if (e.target.hasAttribute('data-q')){
    ui.q = e.target.value.slice(0, 60); render();
  }
});

view.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, kind = f.dataset.form;
  const bad = (inp, msg) => { inp.setCustomValidity(msg); f.reportValidity(); inp.setCustomValidity(''); };
  if (kind === 'cash'){
    const inp = f.querySelector('#cash-in'), v = parseAmount(inp.value);
    if (isNaN(v) || v < 0) return bad(inp, 'Montant non reconnu. Exemples : 3200000, 3,2M, 450k');
    state.cash = v; commit();
  } else if (kind === 'quicklog'){
    const inp = f.querySelector('#ql-amt'), v = parseAmount(inp.value);
    if (isNaN(v) || !v) return bad(inp, 'Montant non reconnu. Exemples : 600k, 1,1M');
    addLog(v, 'Ajout rapide', state.settings.addCash); commit();
  } else if (kind === 'log'){
    const inp = f.querySelector('#lg-amt'), v = parseAmount(inp.value);
    if (isNaN(v) || !v) return bad(inp, 'Montant non reconnu. Exemples : 1,1M, 450k, -2M');
    addLog(v, f.querySelector('#lg-src').value, f.querySelector('#lg-cash').checked); commit();
  } else if (kind === 'complete'){
    const a = ACT[f.dataset.id]; if (!a) return;
    const inp = f.querySelector('#cf-amt'), v = parseAmount(inp.value);
    if (isNaN(v)) return bad(inp, 'Montant non reconnu');
    if (v) addLog(v, a.name, state.settings.addCash);
    if (f.dataset.first === '1' && a.weekly) state.weekly.done[a.weekly] = true;
    if (a.id === 'salvage') state.weekly.salvage = Math.min(3, (state.weekly.salvage || 0) + 1);
    if (a.cd) startTimer('Recharge ' + a.name, a.cd, a.id);
    ui.completing = null; commit();
  } else if (kind === 'custom-timer'){
    const label = (f.querySelector('#ct-label').value || 'Chrono perso').trim().slice(0, 60);
    const min = Math.round(+f.querySelector('#ct-min').value);
    if (!(min >= 1 && min <= 1440)) return;
    startTimer(label, min, null); commit();
  }
});

/* ---------- Son, écran, tic-tac ---------- */
let audioCtx = null;
function ensureAudio(){
  if (audioCtx || !ui.sound) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ audioCtx = null; }
}
function beep(n){
  if (!audioCtx) return;
  try {
    for (let i = 0; i < n; i++){
      const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t0 = audioCtx.currentTime + i*0.25;
      o.type = 'sine'; o.frequency.value = 880; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.connect(g); g.connect(audioCtx.destination); o.start(t0); o.stop(t0 + 0.2);
    }
  } catch(e){}
}
let wakeLock = null, wakeMsg = '', wantWake = false;
async function toggleWake(on){
  wakeMsg = ''; wantWake = on;
  if (on){
    try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    catch(e){ wakeLock = null; wantWake = false; wakeMsg = 'Ton navigateur n’autorise pas à garder l’écran allumé ici.'; }
  } else if (wakeLock){ try { await wakeLock.release(); } catch(e){} wakeLock = null; }
  if (route.view === 'chronos') render();
}
const notified = new Set(state.timers.filter(t => t.end <= Date.now()).map(t => t.id));
function tick(){
  const now = Date.now();
  document.querySelectorAll('[data-end]').forEach(el => { el.textContent = clock(+el.dataset.end - now); });
  document.querySelectorAll('[data-bar-end]').forEach(el => {
    const s = +el.dataset.barStart, e = +el.dataset.barEnd;
    el.style.width = Math.min(100, Math.max(0, (now - s) / Math.max(1, e - s) * 100)) + '%';
  });
  document.querySelectorAll('[data-until]').forEach(el => { el.textContent = until(+el.dataset.until - now); });
  let fresh = false;
  state.timers.forEach(t => { if (t.end <= now && !notified.has(t.id)){ notified.add(t.id); fresh = true; } });
  if (fresh){ if (ui.sound) beep(3); render(); }
  const ready = state.timers.filter(t => t.end <= now).length;
  document.title = ready ? '(' + ready + ') Prêt · QG Los Santos' : 'QG Los Santos';
  const W = weekInfo(new Date()), D = dayInfo(new Date());
  if (state.weekly.key && (state.weekly.key !== W.key || state.daily.key !== D.key)){ render(); syncBonus(false); }
}

window.addEventListener('hashchange', onRoute);
onRoute();
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  tick();
  if (wantWake && wakeLock === null) toggleWake(true);
  if (!bonus || !bonus.syncedAt || Date.now() - bonus.syncedAt > 6*36e5) syncBonus(false);
});
askPersistence();
syncBonus(false);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
