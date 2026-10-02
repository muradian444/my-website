// Mix Media web · ընդհանուր գործիքներ (API, լեզու, toast, modal, տպել)

export const S = { meta: null, lang: 'hy', theme: 'light', section: 'home', nav: [] };

/* ---------------------------------------------------------------- i18n */
const STR = {
  'app.sub': ['աշխատանքային հավելված', 'рабочее приложение'],
  'nav.docs': ['Փաստաթղթեր', 'Документы'],
  'nav.work': ['Աշխատանք', 'Работа'],
  'nav.system': ['Համակարգ', 'Система'],
  'sec.home': ['Գլխավոր', 'Главная'],
  'sec.contracts': ['Պայմանագրեր', 'Договоры'],
  'sec.plan': ['Մեդիա պլան', 'Медиаплан'],
  'sec.act': ['ԱԿՏ', 'АКТ'],
  'sec.kp': ['ԿՊ (առաջարկ)', 'КП (предложение)'],
  'sec.law': ['Իրավաբան', 'Юрист'],
  'sec.quarterly': ['Եռամսյակային հաշվետվություն', 'Квартальный отчёт'],
  'sec.warehouse': ['Պահեստ', 'Склад'],
  'sec.vault': ['Ֆայլապահոց', 'Хранилище'],
  'sec.voice': ['Ձայն', 'Голос'],
  'sec.settings': ['Կարգավորումներ', 'Настройки'],
  'btn.create': ['Ստեղծել', 'Создать'],
  'btn.save': ['Պահել', 'Сохранить'],
  'btn.cancel': ['Չեղարկել', 'Отмена'],
  'btn.delete': ['Ջնջել', 'Удалить'],
  'btn.add': ['Ավելացնել', 'Добавить'],
  'btn.edit': ['Փոխել', 'Изменить'],
  'btn.back': ['Հետ', 'Назад'],
  'btn.next': ['Շարունակել', 'Далее'],
  'btn.print': ['Տպել', 'Печать'],
  'btn.download': ['Ներբեռնել', 'Скачать'],
  'btn.open': ['Բացել', 'Открыть'],
  'btn.close': ['Փակել', 'Закрыть'],
  'btn.refresh': ['Թարմացնել', 'Обновить'],
  'btn.search': ['Որոնել', 'Поиск'],
  'btn.all': ['Ընտրել բոլորը', 'Выбрать все'],
  'btn.none': ['Մաքրել', 'Очистить'],
  'btn.upload': ['Վերբեռնել', 'Загрузить'],
  'btn.vault': ['Պահել պահոցում', 'Сохранить в хранилище'],
  'btn.copy': ['Պատճենել', 'Копировать'],
  'btn.export': ['Արտահանել', 'Экспорт'],
  'word.client': ['Հաճախորդ', 'Клиент'],
  'word.period': ['Ժամանակահատված', 'Период'],
  'word.start': ['Սկիզբ', 'Начало'],
  'word.end': ['Ավարտ', 'Конец'],
  'word.days': ['օր', 'дн.'],
  'word.addresses': ['Հասցեներ', 'Адреса'],
  'word.networks': ['Ցանցեր', 'Сети'],
  'word.clips': ['Հոլովակներ', 'Ролики'],
  'word.times': ['Ժամեր', 'Часы'],
  'word.total': ['Ընդամենը', 'Всего'],
  'word.name': ['Անվանում', 'Название'],
  'word.selected': ['Ընտրված է', 'Выбрано'],
  'word.search': ['Որոնում', 'Поиск'],
  'word.ready': ['Պատրաստ է', 'Готово'],
  'word.files': ['Ֆայլեր', 'Файлы'],
  'word.loading': ['Պատրաստվում է…', 'Готовится…'],
  'word.empty': ['Դատարկ է', 'Пусто'],
  'word.found': ['Գտնվեց', 'Найдено'],
  'word.required': ['Պարտադիր դաշտ', 'Обязательное поле'],
  'word.description': ['Նկարագրություն', 'Описание'],
  'word.location': ['Որտեղ է գտնվում', 'Где находится'],
  'word.qty': ['Քանակ', 'Количество'],
  'word.status': ['Վիճակ', 'Состояние'],
  'word.category': ['Տեսակ', 'Тип'],
  'msg.saved': ['Պահված է', 'Сохранено'],
  'msg.deleted': ['Ջնջված է', 'Удалено'],
  'msg.ready': ['Փաստաթուղթը պատրաստ է', 'Документ готов'],
  'msg.confirm': ['Հաստատե՞լ', 'Подтвердить?'],
  'print.menu': ['Տպելու մենյու', 'Меню печати'],
  'print.browser': ['Տպել դիտարկիչով', 'Печать через браузер'],
  'print.page': ['Տպել որպես էջ (Word)', 'Печать как страница (Word)'],
  'print.hint': ['Ընտրեք՝ ինչպես տպել փաստաթուղթը', 'Выберите, как печатать документ'],
  'fixik.help': ['Օգնություն', 'Помощь'],
  'fixik.check': ['Ստուգում', 'Проверка'],
  'fixik.logs': ['Սխալներ', 'Ошибки'],
  'fixik.ask': ['Գրեք հարցը…', 'Напишите вопрос…'],
  'fixik.hello': [
    'Բարև՛: Ես Ֆիքսիկն եմ: Կարող եմ օգնել՝ ինչպես պատրաստել պայմանագիր, մեդիա պլան, ԱԿՏ, ԿՊ, '
    + 'հաշվետվություն, ինչպես տպել, որտեղ են ֆայլերը: «Ստուգում» ներդիրում կտեսնեք՝ ամեն ինչ կարգին է, թե ոչ:',
    'Привет! Я Фиксик. Помогу: как сделать договор, медиаплан, АКТ, КП, отчёт, как печатать, где файлы. '
    + 'На вкладке «Проверка» видно, всё ли в порядке с системой.'],
};
export function t(key) {
  const v = STR[key];
  if (!v) return key;
  return S.lang === 'ru' ? v[1] : v[0];
}
const LANG_CBS = [];
export function onLang(cb) { LANG_CBS.push(cb); }
export function setLang(lang) {
  S.lang = lang === 'ru' ? 'ru' : 'hy';
  document.documentElement.lang = S.lang;
  localStorage.setItem('mm_lang', S.lang);
  document.querySelectorAll('#lang-seg button').forEach(b => b.classList.toggle('on', b.dataset.lang === S.lang));
  LANG_CBS.forEach(cb => { try { cb(S.lang); } catch (e) { console.warn(e); } });
  api('/api/settings', { method: 'POST', body: { lang: S.lang }, quiet: true }).catch(() => {});
}
export function setTheme(theme) {
  S.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = S.theme;
  localStorage.setItem('mm_theme', S.theme);
  const b = document.getElementById('theme-btn');
  if (b) b.textContent = S.theme === 'dark' ? '☀️' : '🌙';
  api('/api/settings', { method: 'POST', body: { theme: S.theme }, quiet: true }).catch(() => {});
}

/* ---------------------------------------------------------------- DOM */
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(3)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export function esc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

/* ---------------------------------------------------------------- ձևաչափեր */
export function nf(n) {
  const x = Number(n);
  if (!isFinite(x)) return String(n ?? '—');
  return x.toLocaleString('ru-RU').replace(/,/g, ' ').replace(/ /g, ' ');
}
export function bytes(n) {
  const u = ['Բ', 'ԿԲ', 'ՄԲ', 'ԳԲ'], ru = ['Б', 'КБ', 'МБ', 'ГБ'];
  const names = S.lang === 'ru' ? ru : u;
  let i = 0, v = Number(n) || 0;
  while (v >= 1024 && i < 3) { v /= 1024; i++; }
  return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)} ${names[i]}`;
}
export function dmy(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}
export function dt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return `${dmy(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export function isoToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
export function monthRange(back = 1) {   // նախորդ ամիսը (ԱԿՏ-ի լռելյայն)
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
  const last = new Date(now.getFullYear(), now.getMonth() - back + 1, 0);
  const f = d => d.toISOString().slice(0, 10);
  return [f(first), f(last)];
}
export function nextMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const f = d => d.toISOString().slice(0, 10);
  return [f(first), f(last)];
}

/* ---------------------------------------------------------------- toast / loader */
export function toast(msg, type = 'ok', title = '') {
  const box = h('div', { class: `toast ${type}` }, title ? h('b', { text: title }) : null, String(msg));
  $('#toasts').append(box);
  const kill = () => { box.style.opacity = '0'; setTimeout(() => box.remove(), 200); };
  box.addEventListener('click', kill);
  setTimeout(kill, type === 'err' ? 9000 : 4500);
  return box;
}
let loaderCount = 0;
export function loader(on, text) {
  const el = $('#loader');
  loaderCount = Math.max(0, loaderCount + (on ? 1 : -1));
  if (text) $('#loader-text').textContent = text;
  el.hidden = loaderCount === 0;
  if (loaderCount === 0) $('#loader-text').textContent = t('word.loading');
}

/* ---------------------------------------------------------------- API */
export class ApiError extends Error {
  constructor(msg, status, data) { super(msg); this.status = status; this.data = data || {}; }
}
export async function api(path, opts = {}) {
  const { method = 'GET', body, form, quiet = false, text = false } = opts;
  const init = { method, headers: {}, credentials: 'same-origin' };
  if (form) init.body = form;
  else if (body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
  let res;
  try {
    res = await fetch(path, init);
  } catch (e) {
    const msg = S.lang === 'ru' ? 'Нет связи с сервером. Запущен ли server.py?'
      : 'Սերվերի հետ կապ չկա: Գործարկված է՞ server.py-ը:';
    if (!quiet) toast(msg, 'err');
    throw new ApiError(msg, 0);
  }
  if (res.status === 401) {
    document.dispatchEvent(new CustomEvent('mm:auth'));
    throw new ApiError('auth', 401);
  }
  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (text) data = await res.text();
  else if (ct.includes('application/json')) data = await res.json().catch(() => null);
  else data = await res.text();
  if (!res.ok) {
    const msg = (data && data.detail) || (typeof data === 'string' && data) || `Սխալ ${res.status}`;
    if (!quiet) toast(msg, 'err');
    throw new ApiError(msg, res.status, data);
  }
  return data;
}

/* ---------------------------------------------------------------- modal */
export function modal({ title, body, actions = [], wide = false, onClose }) {
  const root = $('#modal-root');
  const box = h('div', { class: `modal${wide ? ' wide' : ''}` });
  const close = () => { ov.remove(); document.removeEventListener('keydown', esckey); if (onClose) onClose(); };
  const esckey = e => { if (e.key === 'Escape') close(); };
  const head = h('div', { class: 'mh' }, h('h3', { text: title || '' }), h('div', { class: 'spacer' }),
    h('button', { class: 'btn icon ghost', onClick: close, title: t('btn.close') }, '✕'));
  const mb = h('div', { class: 'mb' });
  if (typeof body === 'string') mb.innerHTML = body; else if (body) mb.append(body);
  const mf = h('div', { class: 'mf' });
  actions.forEach(a => {
    if (!a) return;
    mf.append(h('button', {
      class: `btn ${a.primary ? 'primary' : (a.danger ? 'danger' : '')}`,
      onClick: async () => { const r = a.onClick ? await a.onClick({ close, body: mb }) : true; if (r !== false) close(); },
    }, a.label));
  });
  box.append(head, mb, actions.length ? mf : h('div', { class: 'mf' }, h('button', { class: 'btn', onClick: close }, t('btn.close'))));
  const ov = h('div', { class: 'overlay', onClick: e => { if (e.target === ov) close(); } }, box);
  root.append(ov);
  document.addEventListener('keydown', esckey);
  setTimeout(() => { const f = box.querySelector('input,textarea,select,button.primary'); if (f) f.focus(); }, 60);
  return { close, body: mb };
}
export function confirmDlg(text, { title, danger = true, okLabel } = {}) {
  return new Promise(resolve => {
    let done = false;
    modal({
      title: title || t('msg.confirm'),
      body: h('p', { text }),
      actions: [
        { label: t('btn.cancel'), onClick: () => { done = true; resolve(false); } },
        { label: okLabel || t('btn.delete'), danger, primary: !danger, onClick: () => { done = true; resolve(true); } },
      ],
      onClose: () => { if (!done) resolve(false); },
    });
  });
}
export function promptDlg(label, { value = '', title, placeholder = '', textarea = false } = {}) {
  return new Promise(resolve => {
    const input = textarea
      ? h('textarea', { placeholder })
      : h('input', { type: 'text', value, placeholder });
    if (textarea) input.value = value;
    let done = false;
    const m = modal({
      title: title || label,
      body: h('div', { class: 'field' }, h('label', { text: label }), input),
      actions: [
        { label: t('btn.cancel'), onClick: () => { done = true; resolve(null); } },
        { label: t('btn.save'), primary: true, onClick: () => { done = true; resolve(input.value.trim()); } },
      ],
      onClose: () => { if (!done) resolve(null); },
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !textarea) { e.preventDefault(); done = true; resolve(input.value.trim()); m.close(); }
    });
  });
}

/* ---------------------------------------------------------------- ֆայլեր և տպել */
const EXT_ICON = { pdf: '📕', docx: '📘', doc: '📘', xlsx: '📗', xlsm: '📗', csv: '📗', pptx: '📙',
  mp3: '🎵', wav: '🎵', png: '🖼', jpg: '🖼', jpeg: '🖼', webp: '🖼', txt: '📄', zip: '🗜' };
export const fileIcon = ext => EXT_ICON[String(ext || '').toLowerCase()] || '📄';

export function printUrl(url) {
  // PDF՝ թաքնված iframe-ով ուղիղ տպիչ, եթե չստացվի՝ նոր ներդիր
  const fr = h('iframe', { src: url, style: 'position:fixed;width:0;height:0;border:0;left:-9999px' });
  let used = false;
  fr.onload = () => {
    try { fr.contentWindow.focus(); fr.contentWindow.print(); used = true; } catch (e) { console.warn(e); }
    if (!used) window.open(url, '_blank');
    setTimeout(() => fr.remove(), 60000);
  };
  fr.onerror = () => { fr.remove(); window.open(url, '_blank'); };
  document.body.append(fr);
}
export function printMenu(file) {
  const isPdf = String(file.ext || '').toLowerCase() === 'pdf';
  const rows = h('div', { class: 'grid c2' });
  const opt = (icon, title, note, fn) => h('button', { class: 'pick', onClick: () => { fn(); } },
    h('div', { class: 'pico' }, icon), h('div', {}, h('div', { class: 'pt', text: title }), h('div', { class: 'pd', text: note })));
  if (isPdf) {
    rows.append(opt('🖨', t('print.browser'), 'PDF → ' + (S.lang === 'ru' ? 'печать сразу' : 'անմիջապես տպիչ'),
      () => printUrl(file.url)));
  } else {
    rows.append(opt('🖨', t('print.page'), S.lang === 'ru' ? 'Word → страница для печати' : 'Word → տպելու էջ',
      () => window.open(file.print_url + '?auto=1', '_blank')));
  }
  rows.append(opt('👁', t('btn.open'), S.lang === 'ru' ? 'Открыть в новой вкладке' : 'Բացել նոր ներդիրում',
    () => window.open(isPdf ? file.url : file.print_url, '_blank')));
  rows.append(opt('⬇️', t('btn.download'), file.name, () => { window.location.href = file.download; }));
  rows.append(opt('☁️', t('btn.vault'), S.lang === 'ru' ? 'Копия в хранилище' : 'Պատճենը պահոցում',
    async () => { await api(`/api/files/${file.id}/vault`, { method: 'POST', body: {} }); toast(t('msg.saved')); }));
  modal({ title: `${t('print.menu')} · ${file.name}`, body: h('div', {}, h('p', { class: 'muted small', text: t('print.hint') }), rows) });
}

export function filesResult(files, note) {
  const box = h('div', { class: 'card' });
  box.append(h('div', { class: 'card-head' },
    h('h2', { text: '✅ ' + t('msg.ready') }),
    h('div', { class: 'right' }, h('span', { class: 'badge ok', text: `${files.length} ${t('word.files').toLowerCase()}` }))));
  if (note) box.append(h('p', { class: 'small', style: 'color:var(--warn)', text: '⚠️ ' + note }));
  files.filter(Boolean).forEach(f => {
    box.append(h('div', { class: 'filecard', style: 'margin-bottom:8px' },
      h('div', { class: 'fi' }, fileIcon(f.ext)),
      h('div', { style: 'flex:1;min-width:0' },
        h('div', { class: 'fn', text: f.name }),
        h('div', { class: 'tiny muted', text: `${(f.ext || '').toUpperCase()} · ${bytes(f.size)}${f.vault ? ' · ☁️ ' + f.vault : ''}` })),
      h('div', { class: 'row tight' },
        h('button', { class: 'btn sm primary', onClick: () => printMenu(f) }, '🖨 ' + t('btn.print')),
        h('button', { class: 'btn sm', onClick: () => window.open(String(f.ext).toLowerCase() === 'pdf' ? f.url : f.print_url, '_blank') }, '👁'),
        h('a', { class: 'btn sm', href: f.download }, '⬇️'))));
  });
  return box;
}

/* ---------------------------------------------------------------- մանր օգնականներ */
export function field(label, input, { hint, error } = {}) {
  return h('div', { class: 'field' },
    label ? h('label', { text: label }) : null, input,
    hint ? h('div', { class: 'hint', text: hint }) : null,
    error ? h('div', { class: 'err', text: error }) : null);
}
export function emptyBox(text, icon = '📭') {
  return h('div', { class: 'empty' }, h('div', { class: 'ei', text: icon }), h('div', { text }));
}
export function table(head, rows, { total } = {}) {
  const thead = h('tr', {}, ...head.map(c => h('th', { class: typeof c === 'object' && c.num ? 'num' : '',
    text: typeof c === 'object' ? c.label : c })));
  const body = rows.map(r => h('tr', { class: r.cls || '' },
    ...(r.cells || r).map((c, i) => h('td', { class: (typeof head[i] === 'object' && head[i].num) ? 'num' : '' },
      c instanceof Node ? c : String(c ?? '')))));
  if (total) body.push(h('tr', { class: 'total' }, ...total.map((c, i) =>
    h('td', { class: (typeof head[i] === 'object' && head[i].num) ? 'num' : '' }, String(c ?? '')))));
  return h('div', { class: 'tablewrap' }, h('table', { class: 'table' }, h('thead', {}, thead), h('tbody', {}, ...body)));
}
export function steps(list, current, onClick) {
  return h('div', { class: 'steps' }, ...list.map((s, i) => h('div', {
    class: `step ${i === current ? 'on' : (i < current ? 'done' : '')}${onClick && i < current ? ' clickable' : ''}`,
    onClick: onClick && i < current ? () => onClick(i) : null,
  }, h('b', { text: i < current ? '✓' : String(i + 1) }), s)));
}
export function highlight(text, query) {
  const q = String(query || '').trim();
  if (!q) return esc(text);
  const words = q.split(/\s+/).filter(w => w.length > 0).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return esc(text);
  let out = esc(text);
  words.forEach(w => { out = out.replace(new RegExp(`(${w})`, 'gi'), '<mark>$1</mark>'); });
  return out;
}
export function copyText(txt) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => toast(t('btn.copy') + ' ✓')).catch(() => toast('Ctrl+C', 'warn'));
  } else {
    const ta = h('textarea', { style: 'position:fixed;left:-9999px' });
    ta.value = txt; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast(t('btn.copy') + ' ✓'); } catch (e) { toast('Ctrl+C', 'warn'); }
    ta.remove();
  }
}
export function debounce(fn, ms = 250) {
  let tm;
  return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); };
}
export function clientSelect(value = '') {
  const sel = h('select', {}, h('option', { value: '' }, '— ' + t('word.client') + ' —'),
    ...(S.meta?.clients || []).map(c => h('option', { value: c, selected: c === value }, c)));
  const input = h('input', { type: 'text', value, placeholder: t('word.client') });
  sel.addEventListener('change', () => { if (sel.value) { input.value = sel.value; input.dispatchEvent(new Event('input')); } });
  const wrap = h('div', {}, (S.meta?.clients || []).length ? sel : null,
    h('div', { style: 'margin-top:6px' }, input));
  return { wrap, input };
}
