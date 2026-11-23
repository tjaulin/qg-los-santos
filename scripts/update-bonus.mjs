#!/usr/bin/env node
/**
 * Récupère les bonus hebdomadaires de GTA Online depuis la page publique de GTA Boss
 * et les écrit dans bonus.json, que le site lit avec son bouton « Sync ».
 *
 * Lancé chaque jeudi par .github/workflows/bonus.yml (ou à la main : node scripts/update-bonus.mjs).
 * Si la page change de structure, le script s'arrête en erreur sans toucher à bonus.json.
 */
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE = 'https://www.gtaboss.gg/gta-5-online/gta-online-weekly-updates';
const OUT = new URL('../bonus.json', import.meta.url);

// [titre de section sur la page source, identifiant, titre affiché dans l'appli]
const SECTIONS = [
  ['Bonus GTA$ & RP', 'bonus', 'Bonus GTA$ et RP'],
  ['Weekly Challenge', 'challenge', 'Défi hebdomadaire'],
  ['Heist Primary Targets', 'targets', 'Cibles principales des braquages'],
  ['Salvage Yard', 'salvage', 'Casse : véhicules à voler'],
  ['Vehicle Discounts', 'discounts', 'Promotions'],
  ['Podium Vehicle', 'podium', 'Voiture du podium (casino)'],
  ['Prize Ride', 'prize', 'Prize Ride (LS Car Meet)'],
  ['Gun Van', 'gunvan', 'Gun Van'],
  ['GTA+ Benefits', 'gtaplus', 'Avantages GTA+']
];

const decode = s => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const text = s => decode(s.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'qg-los-santos-bonus/1.0 (+https://github.com/tjaulin/qg-los-santos)' } });
if (!res.ok) { console.error(`Source injoignable : HTTP ${res.status}`); process.exit(1); }
const raw = await res.text();

// Titre et date de début de la semaine : données structurées de l'article
let title = '', start = '';
for (const m of raw.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
  try {
    const d = JSON.parse(m[1]);
    for (const x of Array.isArray(d) ? d : [d]) {
      if (/Article/.test(x['@type'] || '')) { title = x.headline || title; start = x.datePublished || start; }
    }
  } catch {}
}
const html = raw.replace(/<(script|style|svg|picture|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
if (!title) { const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html); if (h1) title = text(h1[1]); }
if (!start) {
  const d = /([A-Z][a-z]+ \d{1,2}, \d{4})/.exec(title);
  if (d) start = new Date(Date.parse(`${d[1]} 10:00 UTC`)).toISOString();
}

// Découpe la page par titres <h2>, puis lit les éléments de liste de chaque section
const parts = [];
const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
let m, last = null;
while ((m = re.exec(html))) {
  if (last) last.body = html.slice(last.end, m.index);
  last = { title: text(m[1]), end: re.lastIndex };
  parts.push(last);
}
if (last) last.body = html.slice(last.end, last.end + 20000);

const sections = [];
for (const [src, id, label] of SECTIONS) {
  const p = parts.find(x => x.title.toLowerCase() === src.toLowerCase());
  if (!p) continue;
  let items = [...p.body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(x => text(x[1]));
  if (!items.filter(Boolean).length) {
    items = [...p.body.matchAll(/<(p|h3|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(x => text(x[2]));
  }
  items = [...new Set(items.filter(t => t && t.length <= 300 && !/image credit/i.test(t)))].slice(0, 12);
  if (items.length) sections.push({ id, title: label, items });
}

const startMs = Date.parse(start);
if (!startMs || !sections.some(s => s.id === 'bonus')) {
  console.error('Structure de la page inattendue : bonus.json n’est pas modifié.');
  process.exit(1);
}

const out = {
  version: 1,
  source: 'GTA Boss',
  sourceUrl: SOURCE,
  title,
  start: new Date(startMs).toISOString(),
  end: new Date(startMs + 7 * 864e5).toISOString(),
  sections
};

let prev = null;
try { prev = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
if (prev) { const { fetchedAt, ...rest } = prev; if (JSON.stringify(rest) === JSON.stringify(out)) { console.log('Déjà à jour :', title); process.exit(0); } }

out.fetchedAt = new Date().toISOString();
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
console.log('bonus.json mis à jour :', title);
for (const s of sections) console.log(`  ${s.title} : ${s.items.length} élément(s)`);
