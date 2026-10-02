// 📈 Եռամսյակային հաշվետվություն՝ սլայդներ (16:9), ձեր ֆայլերը -> PDF / PowerPoint + տպել
import { S, api, bytes, clear, confirmDlg, debounce, emptyBox, esc, field, filesResult, h, loader,
  modal, nf, t, toast } from '../core.js';

export const sub = () => S.lang === 'ru' ? 'Свои слайды для презентации → PDF / PPTX'
  : 'Ձեր սլայդները պրեզենտացիայի համար → PDF / PPTX';

const TYPES = ['cover', 'metrics', 'chart', 'bullets', 'text', 'table', 'image', 'files', 'closing'];
const TYPE_IC = { cover: '🏁', text: '📝', bullets: '•', metrics: '🔢', chart: '📊', table: '🧮',
  image: '🖼', files: '📎', closing: '🙏' };

export async function render(params) {
  const L = S.lang === 'ru' ? 1 : 0;
  if (params.id) {
    const deck = await api(`/api/quarterly/${params.id}`);
    return editor(deck, L);
  }
  const decks = await api('/api/quarterly');
  const box = h('div');
  const add = h('button', { class: 'btn primary' }, '➕ ' + (L ? 'Новый отчёт' : 'Նոր հաշվետվություն'));
  add.addEventListener('click', () => newDeck(L));
  box.append(h('div', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { text: '📈 ' + (L ? 'Квартальные отчёты' : 'Եռամսյակային հաշվետվություններ') }),
      h('div', { class: 'right' }, add)),
    h('p', { class: 'small muted', text: L
      ? 'Соберите слайды (обложка, цифры, график, таблица, картинка, файлы), добавьте свои файлы и выгрузите '
        + 'в PDF или редактируемый PowerPoint.'
      : 'Հավաքեք սլայդները (շապիկ, թվեր, գծապատկեր, աղյուսակ, նկար, ֆայլեր), ավելացրեք ձեր ֆայլերը և '
        + 'արտահանեք PDF կամ խմբագրելի PowerPoint:' })));
  if (!decks.length) box.append(emptyBox(L ? 'Отчётов пока нет' : 'Հաշվետվություններ դեռ չկան', '📈'));
  const grid = h('div', { class: 'grid c2' });
  decks.forEach(d => grid.append(h('div', { class: 'card', style: 'margin:0' },
    h('div', { class: 'card-head' },
      h('h3', { style: 'margin:0', text: d.title }),
      h('div', { class: 'right' }, h('span', { class: 'badge plain', text: `${S.meta.quarters[d.quarter]} ${d.year}` }))),
    h('div', { class: 'small muted', text: `${d.client || '—'} · ${d.slides} ${L ? 'слайдов' : 'սլայդ'}` }),
    h('div', { class: 'row', style: 'margin-top:10px' },
      h('button', { class: 'btn sm primary', onClick: () => location.hash = `#/quarterly?id=${d.id}` }, '✏️ ' + t('btn.edit')),
      h('button', { class: 'btn sm', onClick: () => renderDeck(d.id, 'pdf', L) }, '📕 PDF'),
      h('button', { class: 'btn sm', onClick: () => renderDeck(d.id, 'pptx', L) }, '📙 PPTX'),
      h('button', { class: 'btn sm', onClick: () => window.open(`/print/quarterly/${d.id}`, '_blank') }, '🖨'),
      h('button', { class: 'btn sm danger', onClick: async () => {
        if (!await confirmDlg(L ? `Удалить «${d.title}»?` : `Ջնջե՞լ «${d.title}»-ը:`)) return;
        await api(`/api/quarterly/${d.id}`, { method: 'DELETE' });
        toast(t('msg.deleted'));
        window.MM.reload();
      } }, '🗑')))));
  box.append(grid);
  return box;
}

function newDeck(L) {
  const title = h('input', { type: 'text', value: L ? 'Квартальный отчёт' : 'Եռամսյակային հաշվետվություն' });
  const client = h('input', { type: 'text', placeholder: t('word.client') });
  const q = h('select', {}, ...[1, 2, 3, 4].map(i => h('option', { value: i,
    selected: i === Math.floor(new Date().getMonth() / 3) + 1 }, S.meta.quarters[i])));
  const year = h('input', { type: 'number', value: new Date().getFullYear() });
  const author = h('input', { type: 'text', placeholder: L ? 'Кто составил' : 'Ով է կազմել' });
  modal({ title: '➕ ' + (L ? 'Новый отчёт' : 'Նոր հաշվետվություն'),
    body: h('div', {}, field(L ? 'Название' : 'Վերնագիր', title), field(t('word.client'), client),
      h('div', { class: 'grid c2' }, field(L ? 'Квартал' : 'Եռամսյակ', q), field(L ? 'Год' : 'Տարի', year)),
      field(L ? 'Автор' : 'Հեղինակ', author)),
    actions: [{ label: t('btn.cancel') }, { label: t('btn.create'), primary: true, onClick: async () => {
      const d = await api('/api/quarterly', { method: 'POST', body: { title: title.value, client: client.value,
        quarter: Number(q.value), year: Number(year.value), author: author.value } });
      location.hash = `#/quarterly?id=${d.id}`;
    } }] });
}

async function renderDeck(id, fmt, L) {
  loader(true, L ? 'Собираю файл…' : 'Հավաքում եմ ֆայլը…');
  try {
    const r = await api(`/api/quarterly/${id}/render?fmt=${fmt}`, { method: 'POST', body: {} });
    modal({ title: fmt === 'pptx' ? '📙 PowerPoint' : '📕 PDF', body: filesResult(r.files) });
  } finally { loader(false); }
}

/* ================================================================ խմբագրիչ */
function editor(deck, L) {
  let cur = 0;
  const root = h('div');
  const slidesCol = h('div');
  const editCol = h('div');
  const statusBadge = h('span', { class: 'badge ok', text: t('msg.saved') });

  const save = debounce(async () => {
    statusBadge.textContent = '…';
    statusBadge.className = 'badge warn';
    try {
      await api(`/api/quarterly/${deck.id}`, { method: 'PUT', body: deck, quiet: true });
      statusBadge.textContent = t('msg.saved');
      statusBadge.className = 'badge ok';
    } catch (e) {
      statusBadge.textContent = '⚠️ ' + e.message;
      statusBadge.className = 'badge err';
    }
  }, 600);

  // --- վերնագիր
  const head = h('div', { class: 'card' });
  const title = h('input', { type: 'text', value: deck.title });
  const client = h('input', { type: 'text', value: deck.client });
  const q = h('select', {}, ...[1, 2, 3, 4].map(i => h('option', { value: i, selected: i === deck.quarter }, S.meta.quarters[i])));
  const year = h('input', { type: 'number', value: deck.year });
  [title, client, q, year].forEach(i => i.addEventListener('input', () => {
    deck.title = title.value; deck.client = client.value;
    deck.quarter = Number(q.value); deck.year = Number(year.value); save();
  }));
  q.addEventListener('change', () => { deck.quarter = Number(q.value); save(); });
  head.append(h('div', { class: 'card-head' },
    h('button', { class: 'btn sm ghost', onClick: () => location.hash = '#/quarterly' }, '← ' + t('btn.back')),
    h('h2', { style: 'margin:0', text: '📈 ' + (L ? 'Редактор отчёта' : 'Հաշվետվության խմբագրիչ') }),
    h('div', { class: 'right' }, statusBadge,
      h('button', { class: 'btn sm', onClick: () => filesDlg(deck, L, redraw) }, '📎 ' + t('word.files')),
      h('button', { class: 'btn sm', onClick: () => renderDeck(deck.id, 'pdf', L) }, '📕 PDF'),
      h('button', { class: 'btn sm', onClick: () => renderDeck(deck.id, 'pptx', L) }, '📙 PPTX'),
      h('button', { class: 'btn sm primary', onClick: () => window.open(`/print/quarterly/${deck.id}`, '_blank') }, '🖨 ' + t('btn.print')))),
    h('div', { class: 'grid c4' }, field(L ? 'Название' : 'Վերնագիր', title), field(t('word.client'), client),
      field(L ? 'Квартал' : 'Եռամսյակ', q), field(L ? 'Год' : 'Տարի', year)));

  function redraw() {
    // --- սլայդների ցանկ
    clear(slidesCol);
    const addBtn = h('button', { class: 'btn sm primary block' }, '➕ ' + (L ? 'Слайд' : 'Սլայդ'));
    addBtn.addEventListener('click', () => addSlideDlg(deck, L, i => { cur = i; save(); redraw(); }));
    slidesCol.append(h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', { style: 'margin:0', text: `${L ? 'Слайды' : 'Սլայդներ'} (${deck.slides.length})` })),
      h('div', { class: 'scroll' }, ...deck.slides.map((s, i) => {
        const mini = h('div', { class: 'slide-mini' + (i === cur ? ' active' : ''), style: 'margin-bottom:7px' },
          h('div', { class: 'sn', text: String(i + 1) }),
          h('div', { class: 'st' }, h('b', { text: s.title || S.meta.slide_names[s.type] }),
            h('span', { text: `${TYPE_IC[s.type] || '•'} ${S.meta.slide_names[s.type]}` })),
          h('div', { class: 'row tight' },
            h('button', { class: 'btn sm ghost', title: '↑', onClick: e => { e.stopPropagation(); move(i, -1); } }, '↑'),
            h('button', { class: 'btn sm ghost', title: '↓', onClick: e => { e.stopPropagation(); move(i, 1); } }, '↓'),
            h('button', { class: 'btn sm ghost', title: t('btn.delete'), onClick: async e => {
              e.stopPropagation();
              if (!await confirmDlg(L ? 'Удалить слайд?' : 'Ջնջե՞լ սլայդը:')) return;
              deck.slides.splice(i, 1); cur = Math.max(0, cur - (i <= cur ? 1 : 0)); save(); redraw();
            } }, '🗑')));
        mini.addEventListener('click', () => { cur = i; redraw(); });
        return mini;
      })), addBtn));
    // --- ընթացիկ սլայդը
    clear(editCol);
    if (!deck.slides.length) { editCol.append(h('div', { class: 'card' }, emptyBox(L ? 'Добавьте слайд' : 'Ավելացրեք սլայդ', '➕'))); return; }
    cur = Math.min(cur, deck.slides.length - 1);
    editCol.append(slideEditor(deck, cur, L, save, redraw));
  }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= deck.slides.length) return;
    [deck.slides[i], deck.slides[j]] = [deck.slides[j], deck.slides[i]];
    cur = j; save(); redraw();
  }
  redraw();
  root.append(head, h('div', { class: 'grid', style: 'grid-template-columns:minmax(230px,300px) 1fr;align-items:start' },
    slidesCol, editCol));
  return root;
}

function addSlideDlg(deck, L, after) {
  let m;
  const grid = h('div', { class: 'grid c3' }, ...TYPES.map(ty => h('button', { class: 'pick', onClick: () => {
    deck.slides.push(blank(ty, deck, L));
    after(deck.slides.length - 1);
    if (m) m.close();
  } }, h('div', { class: 'pico' }, TYPE_IC[ty]), h('div', {}, h('div', { class: 'pt', text: S.meta.slide_names[ty] })))));
  m = modal({ title: '➕ ' + (L ? 'Тип слайда' : 'Սլայդի տեսակը'), wide: true, body: grid });
}

function blank(type, deck, L) {
  const s = { type, title: '', subtitle: '', body: '', caption: '', items: [], image: '', unit: '', head: [], rows: [] };
  if (type === 'cover') { s.title = deck.title; s.subtitle = deck.client; }
  if (type === 'metrics') { s.title = L ? 'Основные цифры' : 'Հիմնական թվերը';
    s.items = [{ label: L ? 'Выходы' : 'Հեռարձակումներ', value: '0', note: 'սփոթ' }]; }
  if (type === 'chart') { s.title = L ? 'Динамика' : 'Դինամիկա'; s.items = []; }
  if (type === 'bullets') { s.title = L ? 'Результаты' : 'Արդյունքներ'; s.items = ['']; }
  if (type === 'table') { s.title = L ? 'Таблица' : 'Աղյուսակ'; s.head = [L ? 'Показатель' : 'Ցուցանիշ', L ? 'Значение' : 'Արժեք']; }
  if (type === 'closing') { s.title = L ? 'Спасибо' : 'Շնորհակալություն'; }
  if (type === 'files') { s.title = L ? 'Приложенные файлы' : 'Կցված ֆայլեր'; }
  return s;
}

/* ---------------------------------------------------------------- սլայդի խմբագրիչ */
function slideEditor(deck, idx, L, save, redraw) {
  const s = deck.slides[idx];
  const card = h('div', { class: 'card' });
  const preview = h('div');
  const upd = () => { save(); clear(preview).append(slidePreview(s, deck, L)); };

  const inp = (label, key, { ta = false, rows = 3, hint = '' } = {}) => {
    const el = ta ? h('textarea', { rows: String(rows) }) : h('input', { type: 'text' });
    el.value = s[key] || '';
    el.addEventListener('input', () => { s[key] = el.value; upd(); });
    return field(label, el, { hint });
  };
  card.append(h('div', { class: 'card-head' },
    h('h3', { style: 'margin:0', text: `${TYPE_IC[s.type]} ${S.meta.slide_names[s.type]} · ${L ? 'слайд' : 'սլայդ'} ${idx + 1}` }),
    h('div', { class: 'right' },
      h('select', { onChange: e => { deck.slides[idx] = { ...blank(e.target.value, deck, L), title: s.title }; save(); redraw(); } },
        ...TYPES.map(ty => h('option', { value: ty, selected: ty === s.type }, S.meta.slide_names[ty]))))));

  card.append(inp(L ? 'Заголовок' : 'Վերնագիր', 'title'));
  if (['cover', 'text'].includes(s.type)) card.append(inp(L ? 'Подзаголовок' : 'Ենթավերնագիր', 'subtitle'));
  if (['text', 'closing'].includes(s.type)) card.append(inp(L ? 'Текст' : 'Տեքստ', 'body', { ta: true, rows: 7 }));

  if (s.type === 'bullets') {
    const ta = h('textarea', { rows: '8' });
    ta.value = (s.items || []).join('\n');
    ta.addEventListener('input', () => { s.items = ta.value.split(/[\r\n]+/).map(x => x.trim()).filter(Boolean); upd(); });
    card.append(field(L ? 'Пункты (каждый с новой строки)' : 'Կետերը (յուրաքանչյուրը նոր տողից)', ta));
  }
  if (s.type === 'metrics' || s.type === 'chart') {
    const ta = h('textarea', { rows: '8' });
    ta.value = (s.items || []).map(i => [i.label, i.value, i.note].filter(x => x !== '' && x !== undefined).join('; ')).join('\n');
    ta.addEventListener('input', () => {
      s.items = ta.value.split(/[\r\n]+/).map(line => {
        const p = line.split(';').map(x => x.trim());
        return p[0] || p[1] ? { label: p[0] || '', value: p[1] || '', note: p[2] || '' } : null;
      }).filter(Boolean);
      upd();
    });
    card.append(field(L ? 'Строки: Название; Значение; Примечание' : 'Տողերը՝ Անվանում; Արժեք; Նշում', ta,
      { hint: L ? 'Например: Выходы; 21 560; спот' : 'Օրինակ՝ Հեռարձակումներ; 21 560; սփոթ' }));
    if (s.type === 'chart') card.append(inp(L ? 'Единица (подпись)' : 'Միավոր (ստորագրություն)', 'unit'));
    const imp = h('input', { type: 'file', accept: '.xlsx,.xlsm,.csv', style: 'display:none' });
    const impBtn = h('button', { class: 'btn sm' }, '📥 ' + (L ? 'Импорт цифр из файла (АКТ)' : 'Ներմուծել թվերը ֆայլից (ԱԿՏ)'));
    impBtn.addEventListener('click', () => imp.click());
    imp.addEventListener('change', async () => {
      if (!imp.files.length) return;
      const fd = new FormData(); fd.append('file', imp.files[0]);
      loader(true, L ? 'Считаю…' : 'Հաշվում եմ…');
      try {
        const r = await api('/api/quarterly/import', { method: 'POST', form: fd });
        s.items = s.type === 'chart' ? r.chart : r.metrics;
        if (!s.title) s.title = r.period;
        ta.value = s.items.map(i => [i.label, i.value, i.note].filter(Boolean).join('; ')).join('\n');
        toast(`✅ ${r.period}`); upd();
      } finally { loader(false); imp.value = ''; }
    });
    card.append(h('div', { class: 'row' }, impBtn, imp));
  }
  if (s.type === 'table') {
    const head = h('input', { type: 'text', value: (s.head || []).join('; ') });
    head.addEventListener('input', () => { s.head = head.value.split(';').map(x => x.trim()).filter(Boolean); upd(); });
    const rows = h('textarea', { rows: '8' });
    rows.value = (s.rows || []).map(r => r.join('; ')).join('\n');
    rows.addEventListener('input', () => {
      s.rows = rows.value.split(/[\r\n]+/).filter(x => x.trim())
        .map(line => line.split(';').map(c => c.trim()));
      upd();
    });
    card.append(field(L ? 'Заголовки через ;' : 'Վերնագրերը՝ ; նշանով', head),
      field(L ? 'Строки (ячейки через ;)' : 'Տողերը (վանդակները՝ ; նշանով)', rows));
  }
  if (s.type === 'image') {
    const images = (deck.attachments || []).filter(a => a.kind === 'image');
    const sel = h('select', {}, h('option', { value: '' }, '— ' + (L ? 'выберите картинку' : 'ընտրեք նկարը') + ' —'),
      ...images.map(a => h('option', { value: a.path, selected: a.path === s.image }, a.name)));
    sel.addEventListener('change', () => { s.image = sel.value; upd(); });
    card.append(field(L ? 'Картинка (из ваших файлов)' : 'Նկար (ձեր ֆայլերից)', sel,
      { hint: images.length ? '' : (L ? 'Сначала добавьте файлы кнопкой 📎 Файлы' : 'Նախ ավելացրեք ֆայլեր 📎 կոճակով') }),
    inp(L ? 'Подпись' : 'Ստորագրություն', 'caption'));
  }
  if (s.type === 'files') {
    const ta = h('textarea', { rows: '5' });
    ta.value = (s.items || []).join('\n');
    ta.addEventListener('input', () => { s.items = ta.value.split(/[\r\n]+/).map(x => x.trim()).filter(Boolean); upd(); });
    card.append(field(L ? 'Список (пусто = все приложенные файлы)' : 'Ցուցակ (դատարկ՝ բոլոր կցված ֆայլերը)', ta));
  }
  clear(preview).append(slidePreview(s, deck, L));
  return h('div', {}, card, h('div', { class: 'card' },
    h('h3', { text: '👁 ' + (L ? 'Предпросмотр' : 'Նախադիտում') }), preview));
}

function slidePreview(s, deck, L) {
  const dark = s.type === 'cover' || s.type === 'closing';
  const box = h('div', { class: 'preview' + (dark ? ' dark' : '') });
  box.append(h('div', { class: 'pk', text: dark ? `${S.meta.quarters[deck.quarter]} ${deck.year}` : S.meta.slide_names[s.type] }));
  box.append(h('h4', { text: s.title || S.meta.slide_names[s.type] }));
  if (s.subtitle) box.append(h('div', { class: 'small', style: 'opacity:.8', text: s.subtitle }));
  if (s.type === 'metrics') box.append(h('div', { class: 'pgrid' }, ...(s.items || []).slice(0, 8).map(i =>
    h('div', { class: 'pm' }, h('div', { class: 'pv', text: i.value || '—' }), h('div', { class: 'pl', text: i.label })))));
  if (s.type === 'chart') {
    const vals = (s.items || []).map(i => Number(String(i.value).replace(/[^\d.-]/g, '')) || 0);
    const max = Math.max(...vals, 1);
    box.append(h('div', { class: 'pbars' }, ...vals.slice(0, 24).map(v =>
      h('i', { style: `height:${Math.max(2, (v / max) * 100)}%` }))));
  }
  if (s.type === 'bullets') box.append(h('ul', { class: 'small', style: 'margin:6px 0 0;padding-left:18px' },
    ...(s.items || []).slice(0, 8).filter(Boolean).map(x => h('li', { text: x }))));
  if (s.type === 'text' || s.type === 'closing') box.append(h('p', { class: 'small',
    text: (s.body || '').slice(0, 420) }));
  if (s.type === 'table') {
    const head = s.head?.length ? s.head : (s.rows?.[0] || []);
    const rows = s.head?.length ? (s.rows || []) : (s.rows || []).slice(1);
    box.append(h('table', { class: 'table', style: 'font-size:10px;margin-top:6px' },
      h('thead', {}, h('tr', {}, ...head.map(x => h('th', { text: x })))),
      h('tbody', {}, ...rows.slice(0, 5).map(r => h('tr', {}, ...r.map(c => h('td', { text: c })))))));
  }
  if (s.type === 'image') {
    if (s.image) box.append(h('img', { src: `/api/quarterly/${deck.id}/media?path=${encodeURIComponent(s.image)}`,
      style: 'max-height:62%;border-radius:8px;margin-top:8px' }));
    else box.append(h('div', { class: 'small muted', text: L ? 'Картинка не выбрана' : 'Նկարը ընտրված չէ' }));
  }
  if (s.type === 'files') {
    const names = (s.items?.length ? s.items : (deck.attachments || []).map(a => a.name));
    box.append(h('ul', { class: 'small', style: 'margin:6px 0 0;padding-left:18px' },
      ...names.slice(0, 7).map(n => h('li', { text: n }))));
  }
  return box;
}

/* ---------------------------------------------------------------- ֆայլեր */
function filesDlg(deck, L, after) {
  const list = h('div');
  const inp = h('input', { type: 'file', multiple: true, style: 'display:none' });
  const zone = h('div', { class: 'dropzone' }, h('div', { class: 'dzi' }, '📎'),
    h('div', { text: L ? 'Нажмите или перетащите свои файлы' : 'Սեղմեք կամ քաշեք ձեր ֆայլերը' }),
    h('div', { class: 'tiny muted', text: L ? 'Картинки можно вставить в слайд, остальные — в список файлов'
      : 'Նկարները կարելի է դնել սլայդում, մնացածը՝ ֆայլերի ցանկում' }));
  const draw = () => {
    clear(list);
    if (!deck.attachments.length) { list.append(emptyBox(L ? 'Файлов нет' : 'Ֆայլեր չկան', '📎')); return; }
    deck.attachments.forEach(a => list.append(h('div', { class: 'li' },
      h('span', { style: 'font-size:18px', text: a.kind === 'image' ? '🖼' : '📄' }),
      h('div', { class: 't' }, h('b', { text: a.name }), h('div', { class: 's', text: bytes(a.size) })),
      h('a', { class: 'btn sm', href: `/api/quarterly/${deck.id}/media?path=${encodeURIComponent(a.path)}`, target: '_blank' }, '👁'),
      h('button', { class: 'btn sm danger', onClick: async () => {
        const d = await api(`/api/quarterly/${deck.id}/attach?path=${encodeURIComponent(a.path)}`, { method: 'DELETE' });
        deck.attachments = d.attachments; draw(); after();
      } }, '🗑'))));
  };
  const upload = async files => {
    const fd = new FormData();
    [...files].forEach(f => fd.append('files', f));
    loader(true, L ? 'Загружаю…' : 'Բեռնում եմ…');
    try {
      const r = await api(`/api/quarterly/${deck.id}/attach`, { method: 'POST', form: fd });
      deck.attachments = r.deck.attachments;
      toast(`✅ ${r.attachments.length}`); draw(); after();
    } finally { loader(false); }
  };
  zone.addEventListener('click', () => inp.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); upload(e.dataTransfer.files); });
  inp.addEventListener('change', () => inp.files.length && upload(inp.files));
  draw();
  modal({ title: '📎 ' + (L ? 'Мои файлы' : 'Իմ ֆայլերը'), wide: true,
    body: h('div', {}, zone, inp, h('div', { class: 'hr' }), h('div', { class: 'list' }, list)) });
}
