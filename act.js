// 🧾 ԱԿՏ՝ տեխ. մոնիտորինգից, Drive-ից կամ Excel/CSV ֆայլից -> Word/PDF + տպել
import { S, api, clear, clientSelect, emptyBox, field, filesResult, h, loader, modal, monthRange,
  nf, table, toast, t } from '../core.js';

export const sub = () => S.lang === 'ru' ? 'Отчёт о выходах: план / факт / не вышло по дням'
  : 'Հեռարձակման հաշվետվություն՝ պլան / փաստ / չհեռարձակված ըստ օրերի';

const A = { client: '', contract: '', start: '', end: '', source: 'monitor', token: null, files: [],
  link: '', planned: 0, times: [], addrMode: 'all', targets: [], nets: [], preview: null };

export async function render() {
  const L = S.lang === 'ru' ? 1 : 0;
  if (!A.start) { const [a, b] = monthRange(1); A.start = a; A.end = b; }
  const root = h('div');
  const previewBox = h('div');
  const sourceBox = h('div');

  // --- 1. հիմնական տվյալներ
  const { wrap, input } = clientSelect(A.client);
  input.addEventListener('input', () => { A.client = input.value; });
  const contract = h('input', { type: 'text', value: A.contract, placeholder: '0056' });
  contract.addEventListener('input', () => { A.contract = contract.value; });
  const s = h('input', { type: 'date', value: A.start });
  const e = h('input', { type: 'date', value: A.end });
  s.addEventListener('change', () => { A.start = s.value; });
  e.addEventListener('change', () => { A.end = e.value; });
  const quick = h('button', { class: 'btn sm' }, L ? 'Прошлый месяц' : 'Անցած ամիս');
  quick.addEventListener('click', () => { const [a, b] = monthRange(1); s.value = A.start = a; e.value = A.end = b; });

  root.append(h('div', { class: 'card' },
    h('h2', { text: '🧾 ' + (L ? 'Данные акта' : 'ԱԿՏ-ի տվյալները') }), h('div', { class: 'gradline' }),
    h('div', { class: 'grid c2' },
      field(t('word.client'), wrap),
      field(L ? 'Номер договора' : 'Պայմանագրի համարը', contract)),
    h('div', { class: 'grid c2' }, field(t('word.start'), s), field(t('word.end'), e)),
    h('div', { class: 'row' }, quick)));

  // --- 2. աղբյուր
  const tabs = h('div', { class: 'grid c3' });
  const SRC = [
    ['monitor', '📡', L ? 'Тех. мониторинг' : 'Տեխ. մոնիտորինգ', L ? 'Месячный Google Sheets по дням' : 'Ամսական Google Sheets ըստ օրերի'],
    ['drive', '☁️', L ? 'Ссылка Google Drive' : 'Google Drive հղում', L ? 'Файл, таблица или папка' : 'Ֆայլ, աղյուսակ կամ թղթապանակ'],
    ['file', '📎', L ? 'Файл xlsx / csv' : 'Ֆայլ xlsx / csv', L ? 'Загрузить с компьютера' : 'Բեռնել համակարգչից'],
  ];
  const drawTabs = () => {
    clear(tabs);
    SRC.forEach(([id, ic, title, note]) => tabs.append(h('button', {
      class: 'pick' + (A.source === id ? ' sel' : ''),
      onClick: () => { A.source = id; A.preview = null; clear(previewBox); drawTabs(); drawSource(); },
    }, h('div', { class: 'pico' }, ic), h('div', {}, h('div', { class: 'pt', text: title }), h('div', { class: 'pd', text: note })))));
  };
  root.append(h('div', { class: 'card' },
    h('h2', { text: '📥 ' + (L ? 'Источник данных' : 'Տվյալների աղբյուրը') }),
    h('p', { class: 'small muted', text: L ? 'Данные только читаются, ничего не изменяется.'
      : 'Տվյալները միայն կարդացվում են, ոչինչ չի փոխվում:' }),
    tabs, h('div', { class: 'hr' }), sourceBox));
  root.append(previewBox);
  drawTabs();
  drawSource();

  function drawSource() {
    clear(sourceBox);
    if (A.source === 'file') sourceBox.append(fileSource(L, show));
    else if (A.source === 'drive') sourceBox.append(driveSource(L, show));
    else sourceBox.append(monitorSource(L, show));
  }
  function show(res) {
    A.preview = res;
    clear(previewBox).append(previewCard(res, L, show));
    previewBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return root;
}

/* ------------------------------------------------ աղբյուրները */
function plannedField(L) {
  const inp = h('input', { type: 'number', min: '0', value: A.planned });
  inp.addEventListener('input', () => { A.planned = Number(inp.value) || 0; });
  return field(L ? 'План выходов в день (все адреса)' : 'Օրական նախատեսված հեռարձակում (բոլոր հասցեներով)', inp,
    { hint: L ? 'Например: 30 выходов × 23 адреса = 690. Если в файле есть колонка «План» — оставьте 0.'
      : 'Օրինակ՝ 30 հեռարձակում × 23 հասցե = 690: Եթե ֆայլում «Նախատեսված» սյունակ կա՝ թողեք 0:' });
}

function fileSource(L, show) {
  const box = h('div');
  const inp = h('input', { type: 'file', accept: '.xlsx,.xlsm,.csv', multiple: true, style: 'display:none' });
  const zone = h('div', { class: 'dropzone' }, h('div', { class: 'dzi' }, '📎'),
    h('div', { text: L ? 'Нажмите или перетащите .xlsx / .csv' : 'Սեղմեք կամ քաշեք .xlsx / .csv ֆայլը' }),
    h('div', { class: 'tiny muted', id: 'act-files', text: A.files.join(', ') }));
  const upload = async fileList => {
    const fd = new FormData();
    [...fileList].forEach(f => fd.append('files', f));
    loader(true, L ? 'Читаю файл…' : 'Կարդում եմ ֆայլը…');
    try {
      const r = await api('/api/act/upload', { method: 'POST', form: fd });
      A.token = r.token; A.files = r.files;
      zone.lastChild.textContent = r.files.join(', ');
      toast(`✅ ${r.files.length} ${t('word.files').toLowerCase()}`);
      await preview();
    } finally { loader(false); }
  };
  zone.addEventListener('click', () => inp.click());
  zone.addEventListener('dragover', ev => { ev.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', ev => { ev.preventDefault(); zone.classList.remove('over'); if (ev.dataTransfer.files.length) upload(ev.dataTransfer.files); });
  inp.addEventListener('change', () => { if (inp.files.length) upload(inp.files); });
  const btn = h('button', { class: 'btn primary' }, '🔍 ' + (L ? 'Посчитать' : 'Հաշվել'));
  btn.addEventListener('click', preview);
  async function preview() {
    if (!A.token) { toast(L ? 'Сначала загрузите файл' : 'Նախ բեռնեք ֆայլը', 'err'); return; }
    if (!check(L)) return;
    loader(true);
    try {
      const res = await api('/api/act/preview', { method: 'POST', body: {
        source: 'file', token: A.token, start: A.start, end: A.end, planned_per_day: A.planned } });
      show(res);
    } catch (e) { /* toast */ } finally { loader(false); }
  }
  box.append(zone, inp, h('div', { style: 'margin-top:12px' }, plannedField(L)), h('div', { class: 'row' }, btn));
  return box;
}

function driveSource(L, show) {
  const link = h('input', { type: 'text', value: A.link || S.meta.settings?.drive_link || '',
    placeholder: 'https://drive.google.com/…' });
  link.addEventListener('input', () => { A.link = link.value; });
  const btn = h('button', { class: 'btn primary' }, '☁️ ' + (L ? 'Прочитать и посчитать' : 'Կարդալ և հաշվել'));
  btn.addEventListener('click', async () => {
    if (!check(L)) return;
    loader(true, L ? 'Читаю Google Drive…' : 'Կարդում եմ Google Drive-ից…');
    try {
      const res = await api('/api/act/preview', { method: 'POST', body: {
        source: 'drive', link: link.value, start: A.start, end: A.end, planned_per_day: A.planned } });
      show(res);
    } catch (e) { /* toast */ } finally { loader(false); }
  });
  return h('div', {}, field(L ? 'Ссылка Google Drive (файл, Google Sheet или папка)'
    : 'Google Drive-ի հղում (ֆայլ, Google Sheet կամ թղթապանակ)', link,
  { hint: L ? 'Доступ: «Anyone with the link — Viewer»' : 'Հասանելիություն՝ «Anyone with the link — Viewer»' }),
  plannedField(L), h('div', { class: 'row' }, btn));
}

function monitorSource(L, show) {
  const box = h('div');
  const monthsBox = h('div', { style: 'margin-bottom:12px' });
  const timesInfo = h('span', { class: 'badge warn', text: '0' });
  const custom = h('input', { type: 'text', placeholder: '9:20-23:50/30' });
  const presets = h('div', { class: 'row' });
  const setTimes = async text => {
    try {
      const r = await api('/api/plan/times', { method: 'POST', body: { text }, quiet: true });
      A.times = r.slots;
      timesInfo.textContent = `${r.count} ${L ? 'выходов/день' : 'հեռարձակում/օր'}`;
      timesInfo.className = 'badge ok';
    } catch (e) { toast(e.message, 'err'); }
  };
  (S.meta.presets || []).forEach(p => presets.append(h('button', { class: 'btn sm', onClick: () => setTimes(p) },
    p.replace('/', ' · '))));
  presets.append(h('div', { class: 'inline', style: 'flex:1;min-width:200px' }, custom,
    h('button', { class: 'btn sm', onClick: () => setTimes(custom.value) }, t('btn.save'))));
  if (A.times.length) { timesInfo.textContent = `${A.times.length}`; timesInfo.className = 'badge ok'; }

  // հասցեների ռեժիմ
  const modeBox = h('div', { class: 'grid c3' });
  const targetsArea = h('textarea', { rows: '5', placeholder: L ? 'Один адрес на строку' : 'Յուրաքանչյուր հասցեն նոր տողից',
    value: A.targets.join('\n') });
  const netsBox = h('div', { class: 'list scroll sm' });
  const extra = h('div', { style: 'margin-top:10px' });
  const MODES = [['all', '📍', L ? 'Все адреса мониторинга' : 'Մոնիտորինգի բոլոր հասցեները'],
    ['net', '🏪', L ? 'По сетям' : 'Ըստ ցանցերի'],
    ['txt', '✍️', L ? 'Список адресов' : 'Հասցեների ցուցակ']];
  const drawMode = () => {
    clear(modeBox);
    MODES.forEach(([id, ic, title]) => modeBox.append(h('button', {
      class: 'pick' + (A.addrMode === id ? ' sel' : ''), onClick: () => { A.addrMode = id; drawMode(); },
    }, h('div', { class: 'pico' }, ic), h('div', {}, h('div', { class: 'pt', text: title })))));
    clear(extra);
    if (A.addrMode === 'txt') extra.append(field(t('word.addresses'), targetsArea));
    if (A.addrMode === 'net') {
      clear(netsBox);
      (S.meta.networks || []).forEach((n, i) => {
        const cb = h('input', { type: 'checkbox', checked: A.nets.includes(i) });
        cb.addEventListener('change', () => {
          A.nets = cb.checked ? [...A.nets, i] : A.nets.filter(x => x !== i);
        });
        netsBox.append(h('label', { class: 'li' }, cb,
          h('div', { class: 't' }, h('b', { text: n.name }), h('div', { class: 's', text: `${n.count} ${L ? 'адресов' : 'հասցե'}` }))));
      });
      extra.append(netsBox);
    }
  };
  drawMode();

  // ամիսների հղումները
  const loadMonths = async () => {
    if (!A.start || !A.end) return;
    clear(monthsBox);
    let rows = [];
    try { rows = await api(`/api/act/monitor/months?start=${A.start}&end=${A.end}`, { quiet: true }); } catch (e) { return; }
    const list = h('div', { class: 'list' });
    rows.forEach(m => {
      const set = h('button', { class: 'btn sm' }, m.ready ? '🔗 ' + t('btn.edit') : '🔗 ' + (L ? 'Добавить ссылку' : 'Ավելացնել հղում'));
      set.addEventListener('click', async () => {
        const link = await promptLink(m, L, m.link);
        if (!link) return;
        await api('/api/act/monitor/link', { method: 'POST', body: { month: m.month, link } });
        toast(t('msg.saved')); loadMonths();
      });
      list.append(h('div', { class: 'li' },
        h('span', { class: 'badge ' + (m.ready ? 'ok' : 'err'), text: m.month }),
        h('div', { class: 't' }, h('div', { class: 's', text: m.link || (L ? 'ссылка не задана' : 'հղումը դրված չէ') })), set));
    });
    monthsBox.append(h('h3', { text: L ? 'Файлы мониторинга по месяцам' : 'Մոնիտորինգի ֆայլերը՝ ըստ ամիսների' }), list);
  };
  loadMonths();

  const btn = h('button', { class: 'btn primary' }, '📡 ' + (L ? 'Посчитать по мониторингу' : 'Հաշվել մոնիտորինգով'));
  btn.addEventListener('click', async () => {
    if (!check(L)) return;
    if (!A.times.length) { toast(L ? 'Выберите часы' : 'Ընտրեք ժամերը', 'err'); return; }
    A.targets = targetsArea.value.split(/[\r\n]+/).map(x => x.trim()).filter(Boolean);
    loader(true, L ? 'Читаю мониторинг…' : 'Կարդում եմ մոնիտորինգը…');
    try {
      const res = await api('/api/act/monitor/preview', { method: 'POST', body: {
        start: A.start, end: A.end, times: A.times, addr_mode: A.addrMode,
        targets: A.targets, nets: A.nets } });
      show(res);
    } catch (e) { /* toast */ } finally { loader(false); }
  });
  box.append(monthsBox, h('div', { class: 'card-head' },
    h('h3', { text: '🕒 ' + (L ? 'График выходов' : 'Եթերացանկ') }), h('div', { class: 'right' }, timesInfo)),
  presets, h('div', { class: 'hr' }),
  h('h3', { text: '📍 ' + (L ? 'По каким адресам считать' : 'Ո՞ր հասցեներով հաշվել') }), modeBox, extra,
  h('div', { class: 'row', style: 'margin-top:12px' }, btn));
  return box;
}

function promptLink(m, L, value) {
  return new Promise(resolve => {
    const inp = h('input', { type: 'text', value: value || '', placeholder: 'https://docs.google.com/spreadsheets/…' });
    let done = false;
    modal({ title: `🔗 ${m.month}`, body: h('div', {}, field(L ? 'Ссылка Google Sheets (Anyone with the link — Viewer)'
      : 'Google Sheets-ի հղում (Anyone with the link — Viewer)', inp)),
    actions: [{ label: t('btn.cancel'), onClick: () => { done = true; resolve(null); } },
      { label: t('btn.save'), primary: true, onClick: () => { done = true; resolve(inp.value.trim()); } }],
    onClose: () => { if (!done) resolve(null); } });
  });
}

function check(L) {
  if (!A.client.trim()) { toast(L ? 'Укажите клиента' : 'Լրացրեք հաճախորդը', 'err'); return false; }
  if (!A.start || !A.end || new Date(A.end) < new Date(A.start)) {
    toast(L ? 'Проверьте период' : 'Ստուգեք ժամանակահատվածը', 'err'); return false;
  }
  return true;
}

/* ------------------------------------------------ նախադիտում + ստեղծում */
function previewCard(res, L, show) {
  const card = h('div', { class: 'card' });
  const pct = res.pct === null || res.pct === undefined ? '—' : res.pct + '%';
  card.append(h('div', { class: 'card-head' },
    h('h2', { text: '📊 ' + (L ? 'Результат расчёта' : 'Հաշվարկի արդյունքը') }),
    h('div', { class: 'right' },
      h('button', { class: 'btn sm', onClick: () => printTable(res, L) }, '🖨 ' + t('btn.print')))));
  card.append(h('div', { class: 'grid c4' },
    tile(L ? 'План' : 'Նախատեսված', nf(res.planned)),
    tile(L ? 'Вышло' : 'Հեռարձակված', nf(res.played)),
    tile(L ? 'Не вышло' : 'Չհեռարձակված', nf(res.missed)),
    tile(L ? 'Выполнение' : 'Կատարում', pct)));

  const warns = [];
  if (res.empty_days?.length) warns.push(`⚠️ ${res.empty_days.length} ${L ? 'дней без данных' : 'օր՝ առանց տվյալների'} (${res.empty_days[0]}…)`);
  if (res.nodata?.length) warns.push(`⚠️ ${res.nodata.length} ${L ? 'дней нет в мониторинге' : 'օրվա թերթ չկա մոնիտորինգում'} (${res.nodata[0]}…)`);
  if (res.missing_months?.length) warns.push(`⚠️ ${L ? 'нет ссылок на месяцы' : 'ամիսների հղումները չկան'}: ${res.missing_months.join(', ')}`);
  if (res.match) warns.push(`🔎 ${L ? 'Совпало адресов' : 'Համընկավ հասցե'}: ${res.match.matched}/${res.match.total}`);
  if (res.unmatched?.length) warns.push(`⚠️ ${L ? 'не найдены в мониторинге' : 'չգտնվեցին մոնիտորինգում'}: ${res.unmatched.slice(0, 5).join(' · ')}${res.unmatched.length > 5 ? ' …' : ''}`);
  (res.warnings || []).forEach(w => warns.push('⚠️ ' + w));
  if (warns.length) card.append(h('div', { style: 'margin:12px 0' }, ...warns.map(w =>
    h('div', { class: 'small', style: 'color:var(--warn)', text: w }))));

  card.append(h('h3', { style: 'margin-top:14px', text: L ? 'По дням' : 'Ըստ օրերի' }),
    table([L ? 'День' : 'Օր', { label: L ? 'План' : 'Նախատեսված', num: true },
      { label: L ? 'Вышло' : 'Հեռարձակված', num: true }, { label: L ? 'Не вышло' : 'Չհեռարձակված', num: true },
      { label: L ? 'Выполнение' : 'Կատարում', num: true }],
    res.days.map(d => [d.label, nf(d.planned), nf(d.played), nf(d.missed), d.pct === null ? '—' : d.pct + '%']),
    { total: [t('word.total'), nf(res.planned), nf(res.played), nf(res.missed), pct] }));

  if (res.clips?.length) card.append(h('h3', { style: 'margin-top:14px', text: t('word.clips') }),
    table([t('word.name'), { label: L ? 'Вышло' : 'Հեռարձակված', num: true }],
      res.clips.map(c => [c.name, nf(c.played)])));
  if (res.by_addr?.length) card.append(h('h3', { style: 'margin-top:14px', text: t('word.addresses') }),
    h('div', { class: 'scroll' }, table(['N', L ? 'Объект' : 'Օբյեկտ', L ? 'Адрес' : 'Հասցե',
      { label: L ? 'План' : 'Նախատեսված', num: true }, { label: L ? 'Вышло' : 'Հեռարձակված', num: true },
      { label: L ? 'Не вышло' : 'Չհեռարձակված', num: true }],
    res.by_addr.map((a, i) => [i + 1, a.obj, a.addr, nf(a.planned), nf(a.played), nf(a.missed)]))));

  const result = h('div');
  const make = h('button', { class: 'btn primary' }, '✅ ' + (L ? 'Создать АКТ' : 'Ստեղծել ԱԿՏ'));
  make.addEventListener('click', async () => {
    loader(true, L ? 'Готовлю АКТ…' : 'ԱԿՏ-ը պատրաստվում է…');
    try {
      const r = await api('/api/act/create', { method: 'POST', body: {
        client: A.client, contract: A.contract || '—', start: A.start, end: A.end,
        days: res.days, clips: res.clips, by_addr: res.by_addr } });
      clear(result).append(filesResult(r.files, r.note));
      toast(t('msg.ready'));
      S.meta.clients = await api('/api/clients', { quiet: true }).catch(() => S.meta.clients);
      result.scrollIntoView({ behavior: 'smooth' });
    } catch (e) { /* toast-ը ցույց է տրվել */ } finally { loader(false); }
  });
  card.append(h('div', { class: 'row', style: 'margin-top:16px' }, make,
    h('span', { class: 'tiny muted', text: L ? 'Word + PDF (если есть конвертер) и копия в хранилище'
      : 'Word + PDF (եթե փոխարկիչ կա) և պատճենը պահոցում' })));
  return h('div', {}, card, result);
}

function tile(k, v) {
  return h('div', { class: 'tile' }, h('div', { class: 'k', text: k }), h('div', { class: 'v', text: v }));
}
async function printTable(res, L) {
  const r = await api('/api/print/act', { method: 'POST', body: {
    client: A.client, period: `${A.start} — ${A.end}`, days: res.days,
    planned: res.planned, played: res.played, missed: res.missed, pct: res.pct } });
  window.open(r.url, '_blank');
}
