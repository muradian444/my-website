// ⚙️ Կարգավորումներ՝ ցանցեր և հասցեներ, հաճախորդներ, Drive, լեզու/թեմա, համակարգ
import { S, api, clear, confirmDlg, debounce, emptyBox, field, h, highlight, loader, modal, nf,
  promptDlg, setLang, setTheme, t, toast } from '../core.js';

export const sub = () => S.lang === 'ru' ? 'Сети, адреса, клиенты, Google Drive'
  : 'Ցանցեր, հասցեներ, հաճախորդներ, Google Drive';

export async function render() {
  const L = S.lang === 'ru' ? 1 : 0;
  const root = h('div');
  const [nets, clients, folder, diag] = await Promise.all([
    api('/api/networks'), api('/api/clients'),
    api('/api/drive/folder', { quiet: true }).catch(() => ({ folder: '' })),
    api('/api/diagnostics', { quiet: true }).catch(() => null),
  ]);

  // ------------------------------------------------ ցանցեր և հասցեներ
  const netsBox = h('div');
  const q = h('input', { type: 'search', placeholder: L ? 'Поиск адреса…' : 'Որոնել հասցե…' });
  const drawNets = async (data) => {
    const rows = data || await api('/api/networks');
    clear(netsBox);
    const needle = q.value.trim().toLowerCase();
    rows.forEach(n => {
      const matches = needle ? n.addresses.map((a, i) => [a, i]).filter(([a]) => a.toLowerCase().includes(needle)) : [];
      if (needle && !matches.length && !n.name.toLowerCase().includes(needle)) return;
      const list = h('div', { class: 'list', style: 'margin-bottom:10px' });
      const addBtn = h('button', { class: 'btn sm' }, '➕ ' + (L ? 'Адреса' : 'Հասցեներ'));
      addBtn.addEventListener('click', async () => {
        const txt = await promptDlg(L ? 'Адреса (каждый с новой строки)' : 'Հասցեներ (յուրաքանչյուրը նոր տողից)',
          { textarea: true, title: n.name });
        if (!txt) return;
        const r = await api(`/api/networks/${n.index}/addresses`, { method: 'POST', body: { text: txt } });
        toast(`${t('btn.add')}: ${r.added}` + (r.skipped ? ` · ${L ? 'повторы' : 'կրկնվող'}: ${r.skipped}` : ''));
        S.meta.addresses_total += r.added;
        drawNets();
      });
      list.append(h('div', { class: 'li', style: 'background:var(--card-2)' },
        h('div', { class: 't' }, h('b', { text: n.name }),
          h('div', { class: 's', text: `${n.addresses.length} ${L ? 'адресов' : 'հասցե'}` })),
        addBtn,
        h('button', { class: 'btn sm ghost', onClick: () => window.open(`/print/addresses?nets=${n.index}`, '_blank') }, '🖨')));
      (needle ? matches : n.addresses.map((a, i) => [a, i])).slice(0, needle ? 50 : 500).forEach(([a, ai]) => {
        list.append(h('div', { class: 'li' },
          h('div', { class: 't' }, h('span', { html: highlight(a, needle) })),
          h('button', { class: 'btn sm ghost danger', onClick: async () => {
            if (!await confirmDlg(L ? `Удалить адрес «${a}»?` : `Ջնջե՞լ «${a}» հասցեն:`)) return;
            await api(`/api/networks/${n.index}/addresses/${ai}`, { method: 'DELETE' });
            S.meta.addresses_total = Math.max(0, S.meta.addresses_total - 1);
            toast(t('msg.deleted')); drawNets();
          } }, '🗑')));
      });
      netsBox.append(list);
    });
    if (!netsBox.children.length) netsBox.append(emptyBox(L ? 'Ничего не найдено' : 'Ոչինչ չգտնվեց', '🔍'));
  };
  q.addEventListener('input', debounce(() => drawNets(), 250));
  const addNet = h('button', { class: 'btn primary' }, '➕ ' + (L ? 'Новая сеть' : 'Նոր ցանց'));
  addNet.addEventListener('click', async () => {
    const name = await promptDlg(L ? 'Название сети' : 'Ցանցի անունը');
    if (!name) return;
    try {
      await api('/api/networks', { method: 'POST', body: { name } });
      toast(t('msg.saved'));
      S.meta.networks = (await api('/api/networks')).map(n => ({ name: n.name, count: n.addresses.length }));
      drawNets();
    } catch (e) { /* toast */ }
  });
  root.append(h('div', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { style: 'margin:0', text: '🏪 ' + (L ? 'Сети и адреса' : 'Ցանցեր և հասցեներ') }),
      h('div', { class: 'right' },
        h('span', { class: 'badge plain', text: `${nets.length} · ${nf(S.meta.addresses_total)}` }),
        h('button', { class: 'btn', onClick: () => window.open('/print/addresses', '_blank') }, '🖨 ' + t('btn.print')),
        addNet)),
    h('div', { class: 'search', style: 'margin-bottom:10px' }, q), netsBox));
  await drawNets(nets);

  // ------------------------------------------------ հաճախորդներ
  const clBox = h('div', { class: 'list scroll sm' });
  const drawClients = async (rows) => {
    const list = rows || await api('/api/clients');
    S.meta.clients = list;
    clear(clBox);
    if (!list.length) clBox.append(emptyBox(L ? 'Список пуст' : 'Ցանկը դատարկ է', '👤'));
    list.forEach(c => clBox.append(h('div', { class: 'li' }, h('div', { class: 't' }, h('b', { text: c })),
      h('button', { class: 'btn sm ghost danger', onClick: async () => {
        if (!await confirmDlg(L ? `Удалить «${c}» из списка?` : `Ջնջե՞լ «${c}»-ը ցանկից:`)) return;
        await api(`/api/clients?name=${encodeURIComponent(c)}`, { method: 'DELETE' });
        drawClients();
      } }, '🗑'))));
  };
  const addCl = h('button', { class: 'btn sm' }, '➕ ' + t('btn.add'));
  addCl.addEventListener('click', async () => {
    const name = await promptDlg(L ? 'Имя клиента' : 'Հաճախորդի անունը');
    if (!name) return;
    await api('/api/clients', { method: 'POST', body: { name } });
    drawClients();
  });

  // ------------------------------------------------ Drive + ընդհանուր
  const driveLink = h('input', { type: 'text', value: S.meta.settings?.drive_link || '',
    placeholder: 'https://drive.google.com/… (' + (L ? 'мониторинг / данные' : 'մոնիտորինգ / տվյալներ') + ')' });
  const mp3Folder = h('input', { type: 'text', value: folder.folder || '', placeholder: 'https://drive.google.com/drive/folders/…' });
  const saveDrive = h('button', { class: 'btn primary' }, '💾 ' + t('btn.save'));
  saveDrive.addEventListener('click', async () => {
    loader(true);
    try {
      await api('/api/settings', { method: 'POST', body: { drive_link: driveLink.value } });
      if (mp3Folder.value.trim()) await api('/api/drive/folder', { method: 'POST', body: { link: mp3Folder.value } });
      S.meta.settings = await api('/api/settings');
      toast(t('msg.saved'));
    } catch (e) { /* toast */ } finally { loader(false); }
  });

  const langSeg = h('div', { class: 'seg' },
    h('button', { class: S.lang === 'hy' ? 'on' : '', onClick: () => setLang('hy') }, 'ՀԱՅԵՐԵՆ'),
    h('button', { class: S.lang === 'ru' ? 'on' : '', onClick: () => setLang('ru') }, 'РУССКИЙ'));
  const themeSeg = h('div', { class: 'seg' },
    h('button', { class: S.theme === 'light' ? 'on' : '', onClick: () => setTheme('light') }, '☀️ ' + (L ? 'Светлая' : 'Լուսավոր')),
    h('button', { class: S.theme === 'dark' ? 'on' : '', onClick: () => setTheme('dark') }, '🌙 ' + (L ? 'Тёмная' : 'Մուգ')));

  root.append(h('div', { class: 'grid c2' },
    h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', { style: 'margin:0', text: '👤 ' + (L ? 'Клиенты' : 'Հաճախորդներ') }),
        h('div', { class: 'right' }, addCl)), clBox),
    h('div', { class: 'card' },
      h('h3', { text: '☁️ Google Drive' }),
      field(L ? 'Ссылка на данные (для АКТа)' : 'Տվյալների հղում (ԱԿՏ-ի համար)', driveLink),
      field(L ? 'Папка с MP3 роликами' : 'MP3 հոլովակների թղթապանակ', mp3Folder,
        { hint: L ? 'Доступ: «Anyone with the link — Viewer»' : 'Հասանելիություն՝ «Anyone with the link — Viewer»' }),
      h('div', { class: 'row' }, saveDrive))));
  await drawClients(clients);

  root.append(h('div', { class: 'grid c2' },
    h('div', { class: 'card' }, h('h3', { text: '🎨 ' + (L ? 'Внешний вид' : 'Տեսք') }),
      field(L ? 'Язык интерфейса' : 'Ծրագրի լեզուն', langSeg),
      field(L ? 'Тема' : 'Թեմա', themeSeg)),
    h('div', { class: 'card' }, h('h3', { text: 'ℹ️ ' + (L ? 'О приложении' : 'Հավելվածի մասին') }),
      h('div', { class: 'list' },
        info(L ? 'Компания' : 'Ընկերություն', S.meta.company?.name),
        info(L ? 'Адрес' : 'Հասցե', S.meta.company?.address),
        info(L ? 'Телефон' : 'Հեռախոս', S.meta.company?.phone),
        info('Email', S.meta.company?.email),
        info(L ? 'PDF-конвертер' : 'PDF փոխարկիչ', S.meta.pdf?.how),
        info('Python', diag?.system?.python || '—'),
        info(L ? 'Папка' : 'Թղթապանակ', diag?.system?.base || '—')),
      h('div', { class: 'row', style: 'margin-top:10px' },
        h('button', { class: 'btn', onClick: () => document.getElementById('fixik-btn').click() },
          '🛠 ' + (L ? 'Проверка системы' : 'Համակարգի ստուգում'))))));
  return root;
}

const info = (k, v) => h('div', { class: 'li' }, h('div', { class: 't' }, h('b', { text: k })),
  h('div', { class: 'small muted', style: 'text-align:right;word-break:break-all', text: String(v || '—') }));
