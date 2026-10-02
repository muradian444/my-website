// 🛠 Ֆիքսիկ՝ փոքրիկ օգնական՝ հուշումներ ըստ բաժնի, համակարգի ստուգում, սխալների մատյան
import { $, S, api, clear, copyText, dt, h, loader, t, toast } from '../core.js';

let TAB = 'help';
let SECTION = 'home';
let CHAT = [];

const TIPS = {
  home: [['📄 Պայմանագիր', 'Պայմանագրեր → ընտրեք շաբլոնը → լրացրեք → «Ստեղծել»'],
    ['🖨 Տպել', 'Ցանկացած պատրաստված ֆայլի մոտ՝ «🖨 Տպել» կոճակը']],
  contracts: [['Ինչպես', 'Ընտրեք շաբլոն (0046/0055/0056) → լրացրեք դաշտերը → «Ստուգել տվյալները» → «Ստեղծել»'],
    ['Հասցեներ', '«📍 Վերցնել ցանցերից» կոճակով կարող եք ավելացնել պահված հասցեները'],
    ['PDF', 'Եթե PDF չի ստացվում՝ տեղադրեք LibreOffice-ը: Word տարբերակը միշտ ստացվում է']],
  plan: [['Որոնում', 'Հասցեների քայլում վերևի դաշտում գրեք փողոցը կամ շենքը՝ բոլոր ցանցերով կզտվի'],
    ['Նոր հասցե', 'Ցանցը բացեք և սեղմեք «➕ Նոր հասցե այս ցանցում»'],
    ['MP3', 'Հոլովակը կարող եք վերցնել Google Drive-ից, բեռնել ֆայլ կամ տալ հղում'],
    ['Սահմանափակում', 'Մեդիա պլանը՝ առավելագույնը 31 օր (մեկ ամիս)']],
  act: [['Աղբյուր', '3 տարբերակ՝ տեխ. մոնիտորինգ, Drive հղում, xlsx/csv ֆայլ'],
    ['Նախատեսված', 'Եթե ֆայլում «Նախատեսված» սյունակ չկա՝ գրեք օրական քանակը (30 × 23 = 690)'],
    ['Մոնիտորինգ', 'Ամսական ֆայլի հղումը պահվում է՝ հաջորդ անգամ ինքնաբերաբար կկարդացվի'],
    ['Տպել', 'Աղյուսակը կարելի է տպել «🖨» կոճակով՝ առանց Word-ի']],
  kp: [['Նմուշներ', '«👁 Ցույց տալ 5 նմուշը»՝ կտեսնեք բոլոր տեսակները PDF-ով'],
    ['Դաշտեր', 'Շատ դաշտեր ունեն պատրաստի արժեքներ՝ կարելի է չփոխել']],
  law: [['Ավտոմատ', 'Ուղարկեք միայն ստուգվող ֆայլը՝ բնօրինակը կգտնվի պահոցից և շաբլոններից'],
    ['Ինչ է ստուգվում', 'Ամեն տառ, թիվ, բացատ, անտեսանելի նշան և ձևաչափ (թավ/շեղ)'],
    ['Հաշվետվություն', 'Ամբողջ ցանկը՝ PDF-ում, որը կարելի է տպել և ուղարկել']],
  quarterly: [['Սլայդներ', 'Ավելացրեք սլայդ ➕ կոճակով՝ շապիկ, թվեր, գծապատկեր, աղյուսակ, նկար, ֆայլեր'],
    ['Ձեր ֆայլերը', '«📎 Ֆայլեր»՝ բեռնեք նկարներ և փաստաթղթեր: Նկարները կարելի է դնել սլայդում'],
    ['Արտահանում', '📕 PDF՝ ցուցադրելու համար, 📙 PPTX՝ PowerPoint-ում խմբագրելու համար'],
    ['Թվերը ֆայլից', '«📥 Ներմուծել թվերը»՝ ԱԿՏ-ի xlsx-ից ավտոմատ կհաշվի']],
  warehouse: [['Ավելացնել', '➕ → 1) ինչ է դա 2) որտեղ է գտնվում 3) նկարագրություն'],
    ['Որոնում', 'Որոնումը աշխատում է բոլոր դաշտերով՝ անուն, տեղ, սերիական, նկարագրություն'],
    ['Նկար', '📷 կոճակով ավելացրեք սարքի նկարը'],
    ['Տպել/Excel', '🖨 տպում է ցանկը, 📗 արտահանում է Excel-ի համար (CSV)']],
  vault: [['Թղթապանակներ', 'Ստեղծեք թղթապանակ, քաշեք ֆայլերը ուղիղ պատուհանի մեջ'],
    ['Ավտոմատ', 'Բոլոր պատրաստված փաստաթղթերը ինքնաբերաբար պահվում են ըստ բաժինների'],
    ['⋯ մենյու', 'Վերանվանել, տեղափոխել, ներբեռնել, տպել, ջնջել']],
  voice: [['Ձայն', 'Ընտրեք ձայնը → գրեք տեքստը → «🔊 Ձայնագրել»'],
    ['Կլոն', 'Բեռնեք 1–3 րոպե մաքուր խոսք՝ ձայնը կհայտնվի ցանկում (պետք է torch/torchaudio)'],
    ['Խոսք → տեքստ', '🎤 կոճակով ուղարկեք ձայնագրությունը՝ կստանաք տեքստ']],
  settings: [['Ցանցեր', 'Ավելացրեք ցանց և հասցեներ՝ դրանք օգտագործվում են մեդիա պլանում և ԱԿՏ-ում'],
    ['Drive', 'Պահեք մոնիտորինգի հղումը և MP3 թղթապանակը՝ որ ամեն անգամ չգրեք']],
};
const TIPS_RU = {
  home: [['📄 Договор', 'Договоры → выберите шаблон → заполните → «Создать»'],
    ['🖨 Печать', 'У каждого готового файла есть кнопка «🖨 Печать»']],
  contracts: [['Как', 'Шаблон (0046/0055/0056) → поля → «Проверить данные» → «Создать»'],
    ['Адреса', 'Кнопка «📍 Взять из сетей» подставит сохранённые адреса'],
    ['PDF', 'Нет PDF — установите LibreOffice. Word-версия создаётся всегда']],
  plan: [['Поиск', 'На шаге адресов введите улицу или дом — отфильтруются все сети'],
    ['Новый адрес', 'Откройте сеть и нажмите «➕ Новый адрес в эту сеть»'],
    ['MP3', 'Ролик можно взять из Google Drive, загрузить файлом или дать ссылку'],
    ['Лимит', 'Медиаплан — максимум 31 день (один месяц)']],
  act: [['Источник', '3 варианта: тех. мониторинг, ссылка Drive, файл xlsx/csv'],
    ['План', 'Если в файле нет колонки «План» — укажите количество в день (30 × 23 = 690)'],
    ['Мониторинг', 'Ссылка на месячный файл сохраняется — в следующий раз подхватится сама'],
    ['Печать', 'Таблицу можно распечатать кнопкой «🖨» без Word']],
  kp: [['Образцы', '«👁 Показать 5 образцов» — все типы в PDF'],
    ['Поля', 'У многих полей есть готовые значения — можно не менять']],
  law: [['Авто', 'Пришлите только проверяемый файл — оригинал найдётся сам'],
    ['Что проверяется', 'Каждая буква, цифра, пробел, невидимый символ и формат'],
    ['Отчёт', 'Полный список — в PDF, его можно распечатать и отправить']],
  quarterly: [['Слайды', '➕ добавьте слайд: обложка, цифры, график, таблица, картинка, файлы'],
    ['Свои файлы', '«📎 Файлы» — загрузите картинки и документы'],
    ['Экспорт', '📕 PDF — показать, 📙 PPTX — редактировать в PowerPoint'],
    ['Цифры из файла', '«📥 Импорт цифр» посчитает из xlsx АКТа']],
  warehouse: [['Добавить', '➕ → 1) что это 2) где находится 3) описание'],
    ['Поиск', 'Ищет по всем полям: название, место, серийник, описание'],
    ['Фото', 'Кнопка 📷 — добавить фото устройства'],
    ['Печать/Excel', '🖨 печатает список, 📗 выгружает в CSV для Excel']],
  vault: [['Папки', 'Создайте папку, перетащите файлы прямо в окно'],
    ['Автоматически', 'Все созданные документы складываются по разделам'],
    ['Меню ⋯', 'Переименовать, переместить, скачать, напечатать, удалить']],
  voice: [['Голос', 'Выберите голос → напишите текст → «🔊 Озвучить»'],
    ['Клон', 'Загрузите 1–3 минуты чистой речи (нужны torch/torchaudio)'],
    ['Речь → текст', 'Кнопка 🎤 — отправьте запись, получите текст']],
  settings: [['Сети', 'Добавьте сеть и адреса — они используются в медиаплане и АКТе'],
    ['Drive', 'Сохраните ссылку мониторинга и папку MP3, чтобы не вводить каждый раз']],
};

export function setFixikSection(id) {
  SECTION = id;
  if (!$('#fixik').hidden && TAB === 'help') draw();
}

export function initFixik() {
  const btn = $('#fixik-btn');
  const panel = $('#fixik');
  btn.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) draw();
  });
  $('#fixik-close').addEventListener('click', () => { panel.hidden = true; });
  $('#fixik-tabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    TAB = b.dataset.tab;
    $('#fixik-tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    draw();
  }));
  refreshBadge();
  setInterval(refreshBadge, 60000);
}

async function refreshBadge() {
  try {
    const d = await api('/api/diagnostics', { quiet: true });
    const n = d.errors + (d.recent_errors || 0);
    const btn = $('#fixik-btn');
    btn.querySelector('.dot')?.remove();
    if (n) btn.append(h('span', { class: 'dot', text: String(n > 9 ? '9+' : n) }));
    $('#fixik-sub').textContent = d.state === 'ok'
      ? (S.lang === 'ru' ? 'всё в порядке' : 'ամեն ինչ կարգին է')
      : `${d.errors} ⛔ · ${d.warnings} ⚠️`;
  } catch (e) { /* լուռ */ }
}

function draw() {
  const L = S.lang === 'ru' ? 1 : 0;
  const body = clear($('#fixik-body'));
  const foot = clear($('#fixik-foot'));
  $('#fixik-tabs').querySelectorAll('button').forEach((b, i) => {
    b.textContent = ['💬 ' + t('fixik.help'), '🧪 ' + t('fixik.check'), '⚠️ ' + t('fixik.logs')][i];
  });
  if (TAB === 'help') return drawHelp(body, foot, L);
  if (TAB === 'check') return drawCheck(body, foot, L);
  return drawLogs(body, foot, L);
}

/* ---------------------------------------------------------------- 💬 օգնություն */
function drawHelp(body, foot, L) {
  const tips = (L ? TIPS_RU : TIPS)[SECTION] || (L ? TIPS_RU : TIPS).home;
  if (!CHAT.length) body.append(h('div', { class: 'bubble', text: t('fixik.hello') }));
  CHAT.forEach(m => body.append(h('div', { class: 'bubble' + (m.me ? ' me' : ''), text: m.text })));
  body.append(h('div', { class: 'tiny muted', style: 'margin:10px 0 6px',
    text: (L ? 'Подсказки для раздела: ' : 'Հուշումներ այս բաժնի համար՝ ') + t('sec.' + SECTION) }));
  tips.forEach(([title, text]) => body.append(h('div', { class: 'chk' },
    h('span', { class: 'ci', text: '💡' }), h('div', {}, h('b', { text: title }), h('div', { text })))));
  const chips = h('div', { style: 'margin-top:10px' });
  (L ? ['pdf', 'печать', 'адрес', 'акт', 'склад', 'отчет', 'голос', 'файл']
    : ['pdf', 'տպել', 'հասցե', 'ակտ', 'պահեստ', 'հաշվետվություն', 'ձայն', 'ֆայլ'])
    .forEach(q => chips.append(h('button', { class: 'qchip', onClick: () => ask(q) }, q)));
  body.append(chips);

  const input = h('input', { type: 'text', placeholder: t('fixik.ask') });
  const send = h('button', { class: 'btn primary' }, '→');
  const go = () => { const v = input.value.trim(); if (v) { input.value = ''; ask(v); } };
  send.addEventListener('click', go);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  foot.append(input, send);
  body.scrollTop = body.scrollHeight;
}

async function ask(q) {
  CHAT.push({ me: true, text: q });
  draw();
  try {
    const r = await api('/api/fixik/ask', { method: 'POST', body: { q, lang: S.lang, section: SECTION }, quiet: true });
    CHAT.push({ me: false, text: r.answer });
  } catch (e) {
    CHAT.push({ me: false, text: e.message });
  }
  if (CHAT.length > 20) CHAT = CHAT.slice(-20);
  draw();
}

/* ---------------------------------------------------------------- 🧪 ստուգում */
async function drawCheck(body, foot, L) {
  body.append(h('div', { class: 'bubble', text: L ? 'Проверяю систему…' : 'Ստուգում եմ համակարգը…' }));
  let d;
  try { d = await api('/api/diagnostics', { quiet: true }); } catch (e) {
    clear(body).append(h('div', { class: 'bubble', text: e.message })); return;
  }
  clear(body);
  body.append(h('div', { class: 'row', style: 'margin-bottom:10px' },
    h('span', { class: 'badge ok', text: `✓ ${d.ok}` }),
    h('span', { class: 'badge warn', text: `⚠️ ${d.warnings}` }),
    h('span', { class: 'badge err', text: `⛔ ${d.errors}` })));
  const order = { error: 0, warn: 1, ok: 2 };
  [...d.checks].sort((a, b) => order[a.state] - order[b.state]).forEach(c => body.append(
    h('div', { class: 'chk' }, h('span', { class: 'ci', text: c.state === 'ok' ? '✅' : c.state === 'warn' ? '⚠️' : '⛔' }),
      h('div', {}, h('b', { text: c.name }), h('div', { class: 'tiny muted', text: c.detail }),
        c.fix ? h('div', { class: 'fix', text: '→ ' + c.fix }) : null))));
  body.append(h('div', { class: 'tiny muted', style: 'margin-top:8px',
    text: `Python ${d.system.python} · ${d.system.platform}` }));
  foot.append(h('button', { class: 'btn block', onClick: () => draw() }, '🔄 ' + t('btn.refresh')),
    h('button', { class: 'btn', onClick: () => copyText(JSON.stringify(d, null, 2)) }, '📋'));
}

/* ---------------------------------------------------------------- ⚠️ սխալներ */
async function drawLogs(body, foot, L) {
  let rows = [];
  try { rows = await api('/api/logs?limit=80', { quiet: true }); } catch (e) {
    body.append(h('div', { class: 'bubble', text: e.message })); return;
  }
  if (!rows.length) {
    body.append(h('div', { class: 'bubble', text: L ? 'Ошибок нет — чисто ✨' : 'Սխալներ չկան՝ մաքուր է ✨' }));
  }
  rows.forEach(r => body.append(h('div', { class: 'logrow ' + r.level },
    h('div', { class: 'lt', text: `${dt(r.at)} · ${r.where}` }),
    h('div', { text: r.text }),
    r.trace ? h('details', {}, h('summary', { class: 'tiny', text: L ? 'подробности' : 'մանրամասներ' }),
      h('pre', { text: r.trace })) : null)));
  foot.append(h('button', { class: 'btn block', onClick: () => draw() }, '🔄 ' + t('btn.refresh')),
    h('button', { class: 'btn', onClick: () => copyText(rows.map(r => `${r.at} ${r.level} ${r.where}: ${r.text}`).join('\n')) }, '📋'),
    h('button', { class: 'btn danger', onClick: async () => {
      await api('/api/logs', { method: 'DELETE' });
      toast(L ? 'Журнал очищен' : 'Մատյանը մաքրվեց'); draw(); refreshBadge();
    } }, '🗑'));
}
