// Mix Media web · գործարկում, մենյու, երթուղիներ
import { $, S, api, clear, h, loader, onLang, setLang, setTheme, t, toast } from './core.js';
import * as home from './sections/home.js';
import * as contracts from './sections/contracts.js';
import * as plan from './sections/plan.js';
import * as act from './sections/act.js';
import * as kp from './sections/kp.js';
import * as law from './sections/law.js';
import * as quarterly from './sections/quarterly.js';
import * as warehouse from './sections/warehouse.js';
import * as vault from './sections/vault.js';
import * as voice from './sections/voice.js';
import * as settings from './sections/settings.js';
import { initFixik, setFixikSection } from './sections/fixik.js';

const SECTIONS = [
  { ...home, id: 'home', icon: '🏠', group: null },
  { ...contracts, id: 'contracts', icon: '📄', group: 'nav.docs' },
  { ...plan, id: 'plan', icon: '📊', group: 'nav.docs' },
  { ...act, id: 'act', icon: '🧾', group: 'nav.docs' },
  { ...kp, id: 'kp', icon: '💼', group: 'nav.docs' },
  { ...quarterly, id: 'quarterly', icon: '📈', group: 'nav.work' },
  { ...warehouse, id: 'warehouse', icon: '🏷', group: 'nav.work' },
  { ...vault, id: 'vault', icon: '☁️', group: 'nav.work' },
  { ...law, id: 'law', icon: '⚖️', group: 'nav.system' },
  { ...voice, id: 'voice', icon: '🎙', group: 'nav.system' },
  { ...settings, id: 'settings', icon: '⚙️', group: 'nav.system' },
];
const BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
S.nav = SECTIONS;

/* ---------------------------------------------------------------- մենյու */
function buildNav() {
  const nav = clear($('#nav'));
  let group = undefined;
  SECTIONS.forEach(s => {
    if (s.group !== group) {
      group = s.group;
      if (group) nav.append(h('div', { class: 'group', text: t(group) }));
    }
    nav.append(h('button', {
      class: `navitem${S.section === s.id ? ' active' : ''}`,
      dataset: { id: s.id },
      onClick: () => go(s.id),
    }, h('span', { class: 'ic', text: s.icon }), h('span', { text: t('sec.' + s.id) }),
      s.badge ? h('span', { class: 'cnt', text: s.badge() }) : null));
  });
}
function markNav() {
  document.querySelectorAll('.navitem').forEach(b => b.classList.toggle('active', b.dataset.id === S.section));
}

/* ---------------------------------------------------------------- երթուղի */
export function go(id, params) {
  const sec = BY_ID[id] ? id : 'home';
  const hash = `#/${sec}${params ? '?' + new URLSearchParams(params) : ''}`;
  if (location.hash !== hash) { location.hash = hash; return; }
  render(sec, params);
}
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [id, qs] = raw.split('?');
  return { id: BY_ID[id] ? id : 'home', params: Object.fromEntries(new URLSearchParams(qs || '')) };
}
async function render(id, params) {
  const sec = BY_ID[id] || BY_ID.home;
  S.section = sec.id;
  markNav();
  document.body.classList.remove('nav-open');
  $('#page-title').textContent = t('sec.' + sec.id);
  $('#page-sub').textContent = sec.sub ? sec.sub() : '';
  setFixikSection(sec.id);
  const view = clear($('#view'));
  view.append(h('div', { class: 'card', style: 'text-align:center;color:var(--muted)' }, t('word.loading')));
  try {
    const node = await sec.render(params || {});
    clear(view).append(node);
    window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (e) {
    console.error(e);
    clear(view).append(h('div', { class: 'card' },
      h('h2', { text: '⚠️ ' + (S.lang === 'ru' ? 'Раздел не открылся' : 'Բաժինը չբացվեց') }),
      h('p', { class: 'small', text: String(e.message || e) }),
      h('button', { class: 'btn primary', onClick: () => render(id, params) }, t('btn.refresh'))));
    api('/api/client-error', { method: 'POST', quiet: true, body: { message: `${id}: ${e.message}`, stack: String(e.stack || '') } }).catch(() => {});
  }
}

/* ---------------------------------------------------------------- մուտք */
function showLogin(note) {
  $('#shell').hidden = true;
  $('#fixik-btn').hidden = true;
  $('#login').hidden = false;
  if (note) $('#login-err').textContent = note;
}
async function boot() {
  S.lang = localStorage.getItem('mm_lang') || 'hy';
  S.theme = localStorage.getItem('mm_theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = S.theme;
  $('#theme-btn').textContent = S.theme === 'dark' ? '☀️' : '🌙';
  document.querySelectorAll('#lang-seg button').forEach(b => b.classList.toggle('on', b.dataset.lang === S.lang));
  try {
    S.meta = await api('/api/meta', { quiet: true });
  } catch (e) {
    if (e.status === 401) { showLogin(''); return; }
    showLogin(e.message);
    return;
  }
  if (S.meta.settings?.lang && !localStorage.getItem('mm_lang')) S.lang = S.meta.settings.lang;
  if (S.meta.settings?.theme && !localStorage.getItem('mm_theme')) {
    S.theme = S.meta.settings.theme;
    document.documentElement.dataset.theme = S.theme;
  }
  $('#login').hidden = true;
  $('#shell').hidden = false;
  $('#fixik-btn').hidden = false;
  $('#logout-btn').hidden = !S.meta.auth_required;
  $('#sfoot-company').textContent = S.meta.company?.name || 'Mix Media';
  $('#sfoot-ver').textContent = `v${S.meta.version} · ${S.meta.company?.site || ''}`;
  document.documentElement.lang = S.lang;
  buildNav();
  initFixik();
  const { id, params } = parseHash();
  render(id, params);
  if (!S.meta.pdf?.ready) {
    toast(S.lang === 'ru'
      ? 'PDF-конвертер не найден: договоры и АКТ будут в Word (.docx). Печать работает через кнопку «Печать».'
      : 'PDF փոխարկիչ չկա՝ պայմանագիրը և ԱԿՏ-ը կստացվեն Word-ով: Տպելը աշխատում է «Տպել» կոճակով:', 'warn');
  }
}

/* ---------------------------------------------------------------- իրադարձություններ */
window.addEventListener('hashchange', () => { const { id, params } = parseHash(); render(id, params); });
document.addEventListener('mm:auth', () => showLogin(S.lang === 'ru' ? 'Сессия закрыта, войдите снова' : 'Մտեք կրկին'));
onLang(() => { buildNav(); const { id, params } = parseHash(); render(id, params); });

document.addEventListener('DOMContentLoaded', () => {
  $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#theme-btn').addEventListener('click', () => setTheme(S.theme === 'dark' ? 'light' : 'dark'));
  document.querySelectorAll('#lang-seg button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  $('#logout-btn').addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST', body: {}, quiet: true }).catch(() => {});
    location.reload();
  });
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const pass = $('#login-pass').value;
    $('#login-err').textContent = '';
    try {
      loader(true);
      await api('/api/login', { method: 'POST', body: { password: pass }, quiet: true });
      location.reload();
    } catch (err) {
      $('#login-err').textContent = err.message;
    } finally { loader(false); }
  });
  document.body.addEventListener('click', e => {
    const a = e.target.closest('[data-go]');
    if (a) { e.preventDefault(); go(a.dataset.go); }
  });
  window.addEventListener('error', ev => {
    api('/api/client-error', { method: 'POST', quiet: true,
      body: { message: String(ev.message), stack: `${ev.filename}:${ev.lineno}` } }).catch(() => {});
  });
  boot();
});

export function reload() { const { id, params } = parseHash(); render(id, params); }
window.MM = { go, reload, S };
