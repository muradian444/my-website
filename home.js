// 🏠 Գլխավոր էջ՝ արագ գործողություններ, թվեր, վերջին ֆայլերը
import { S, api, bytes, dt, emptyBox, fileIcon, h, nf, printMenu, t } from '../core.js';

export const sub = () => S.lang === 'ru' ? 'Всё для документов и работы в одном месте'
  : 'Ամբողջ աշխատանքը մեկ տեղում';

const ACTIONS = [
  ['contracts', '📄', ['Նոր պայմանագիր', 'Новый договор'], ['0046 · 0055 · 0056 շաբլոններից', 'Из шаблонов 0046 · 0055 · 0056']],
  ['plan', '📊', ['Մեդիա պլան', 'Медиаплан'], ['Հասցեների որոնումով և MP3-ներով', 'С поиском адресов и MP3']],
  ['act', '🧾', ['ԱԿՏ (հաշվետվություն)', 'АКТ (отчёт)'], ['Մոնիտորինգից կամ Excel-ից', 'Из мониторинга или Excel']],
  ['kp', '💼', ['Առևտրային առաջարկ', 'Коммерческое предложение'], ['5 պատրաստի տեսակ', '5 готовых типа']],
  ['quarterly', '📈', ['Եռամսյակային հաշվետվություն', 'Квартальный отчёт'], ['Սլայդներ → PDF / PowerPoint', 'Слайды → PDF / PowerPoint']],
  ['warehouse', '🏷', ['Պահեստ', 'Склад'], ['Սարքեր, որտեղ է գտնվում', 'Оборудование, где находится']],
  ['vault', '☁️', ['Ֆայլապահոց', 'Хранилище'], ['Բոլոր ֆայլերը, թղթապանակներով', 'Все файлы по папкам']],
  ['law', '⚖️', ['Իրավաբան', 'Юрист'], ['Համեմատել փաստաթղթերը', 'Сравнить документы']],
];

export async function render() {
  const L = S.lang === 'ru' ? 1 : 0;
  const [wh, vs, files, diag] = await Promise.all([
    api('/api/warehouse', { quiet: true }).catch(() => null),
    api('/api/vault/stats', { quiet: true }).catch(() => null),
    api('/api/files?limit=8', { quiet: true }).catch(() => []),
    api('/api/diagnostics', { quiet: true }).catch(() => null),
  ]);
  const box = h('div');

  // hero
  box.append(h('div', {
    class: 'card',
    style: 'background:linear-gradient(135deg,#1D1B5E,#2A2070);color:#fff;border:0;overflow:hidden;position:relative',
  },
    h('div', { style: 'position:absolute;right:-30px;top:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(106,61,232,.55),transparent 70%)' }),
    h('div', { class: 'tiny', style: 'letter-spacing:1.6px;opacity:.75', text: 'MIX MEDIA PRODUCTION' }),
    h('h2', { style: 'color:#fff;font-size:22px;margin:6px 0 4px',
      text: L ? 'Рабочее приложение' : 'Աշխատանքային հավելված' }),
    h('p', { class: 'small', style: 'opacity:.85;max-width:620px', text: L
      ? 'Договоры, медиапланы, АКТ, коммерческие предложения, квартальные отчёты, склад и хранилище файлов — '
        + 'с печатью и помощником Фиксиком.'
      : 'Պայմանագրեր, մեդիա պլաններ, ԱԿՏ, առևտրային առաջարկներ, եռամսյակային հաշվետվություններ, պահեստ և '
        + 'ֆայլապահոց՝ տպելու հնարավորությամբ և Ֆիքսիկ օգնականով:' })));

  // tiles
  const pct = diag ? diag.ok + '/' + (diag.ok + diag.warnings + diag.errors) : '—';
  box.append(h('div', { class: 'grid c4', style: 'margin-bottom:16px' },
    tile(L ? 'Клиенты' : 'Հաճախորդներ', nf((S.meta.clients || []).length), L ? 'в списке' : 'ցանկում', 'clients'),
    tile(L ? 'Адреса' : 'Հասցեներ', nf(S.meta.addresses_total || 0),
      `${(S.meta.networks || []).length} ${L ? 'сетей' : 'ցանց'}`, 'plan'),
    tile(L ? 'Склад' : 'Պահեստ', nf(wh?.stats?.total ?? 0),
      `${nf(wh?.stats?.units ?? 0)} ${L ? 'ед.' : 'միավոր'}`, 'warehouse'),
    tile(L ? 'Хранилище' : 'Ֆայլապահոց', nf(vs?.files ?? 0), bytes(vs?.size ?? 0), 'vault')));

  // արագ գործողություններ
  const acts = h('div', { class: 'grid c3' }, ...ACTIONS.map(([id, icon, title, note]) =>
    h('button', { class: 'pick', dataset: { go: id } },
      h('div', { class: 'pico' }, icon),
      h('div', {}, h('div', { class: 'pt', text: title[L] }), h('div', { class: 'pd', text: note[L] })))));
  box.append(h('div', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { text: L ? 'Что сделать' : 'Ի՞նչ անել' })), acts));

  // վերջին ֆայլերը + համակարգի վիճակ
  const grid = h('div', { class: 'grid c2' });
  const recent = h('div', { class: 'card' },
    h('div', { class: 'card-head' }, h('h3', { text: L ? 'Последние документы' : 'Վերջին փաստաթղթերը' }),
      h('div', { class: 'right' }, h('button', { class: 'btn sm ghost', dataset: { go: 'vault' } }, '☁️ ' + t('sec.vault')))));
  if (!files.length) recent.append(emptyBox(L ? 'Пока нет созданных документов' : 'Դեռ փաստաթղթեր չկան', '📄'));
  files.forEach(f => recent.append(h('div', { class: 'list', style: 'margin-bottom:6px' },
    h('div', { class: 'li' }, h('span', { style: 'font-size:18px', text: fileIcon(f.ext) }),
      h('div', { class: 't' }, h('b', { text: f.name }), h('div', { class: 's', text: `${dt(f.created)} · ${bytes(f.size)}` })),
      h('button', { class: 'btn sm', onClick: () => printMenu(f) }, '🖨'),
      h('a', { class: 'btn sm', href: f.download }, '⬇️')))));
  grid.append(recent);

  const sysCard = h('div', { class: 'card' },
    h('div', { class: 'card-head' }, h('h3', { text: L ? 'Состояние системы' : 'Համակարգի վիճակ' }),
      h('div', { class: 'right' }, h('span', {
        class: 'badge ' + (diag?.state === 'ok' ? 'ok' : diag?.state === 'warn' ? 'warn' : 'err'),
        text: diag ? (diag.state === 'ok' ? (L ? 'Всё в порядке' : 'Ամեն ինչ կարգին է')
          : `${diag.errors} ⛔ · ${diag.warnings} ⚠️`) : '—' }))));
  (diag?.checks || []).filter(c => c.state !== 'ok').slice(0, 5).forEach(c => sysCard.append(
    h('div', { class: 'chk' }, h('span', { class: 'ci', text: c.state === 'error' ? '⛔' : '⚠️' }),
      h('div', {}, h('b', { text: c.name }), h('div', { class: 'tiny muted', text: c.detail }),
        c.fix ? h('div', { class: 'fix', text: '→ ' + c.fix }) : null))));
  if (diag && diag.state === 'ok') sysCard.append(h('p', { class: 'small muted',
    text: L ? 'Шаблоны, шрифты, папки и библиотеки на месте.' : 'Շաբլոնները, տառատեսակները, թղթապանակները և գրադարանները տեղում են:' }));
  sysCard.append(h('div', { class: 'row', style: 'margin-top:10px' },
    h('button', { class: 'btn sm', onClick: () => document.getElementById('fixik-btn').click() }, '🛠 ' + t('fixik.check')),
    h('span', { class: 'tiny muted', text: diag ? `Python ${diag.system.python}` : '' })));
  grid.append(sysCard);
  box.append(grid);
  return box;
}

function tile(k, v, n, go) {
  return h('div', { class: 'tile', style: go ? 'cursor:pointer' : '', dataset: go ? { go } : {} },
    h('div', { class: 'k', text: k }), h('div', { class: 'v', text: v }), h('div', { class: 'n', text: n }));
}
