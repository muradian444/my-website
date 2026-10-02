// ☁️ Ֆայլապահոց (Google Drive-ի նման)՝ թղթապանակներ, վերբեռնում, որոնում, տեղափոխում, տպել
import { S, api, bytes, clear, confirmDlg, debounce, dt, emptyBox, fileIcon, h, loader, modal,
  nf, promptDlg, t, toast } from '../core.js';

export const sub = () => S.lang === 'ru' ? 'Все файлы приложения в одном месте'
  : 'Հավելվածի բոլոր ֆայլերը մեկ տեղում';

let PATH = '';

export async function render(params) {
  const L = S.lang === 'ru' ? 1 : 0;
  if (params.path !== undefined) PATH = params.path;
  const root = h('div');
  const crumbs = h('div', { class: 'crumbs' });
  const items = h('div');
  const statsBox = h('span', { class: 'tiny muted' });
  const q = h('input', { type: 'search', placeholder: (L ? 'Поиск файла по всему хранилищу…' : 'Որոնել ֆայլ ամբողջ պահոցում…') });

  const upInput = h('input', { type: 'file', multiple: true, style: 'display:none' });
  upInput.addEventListener('change', () => upInput.files.length && upload(upInput.files));
  const bar = h('div', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { style: 'margin:0', text: '☁️ ' + (L ? 'Хранилище' : 'Ֆայլապահոց') }),
      h('div', { class: 'right' }, statsBox,
        h('button', { class: 'btn', onClick: () => mkdir() }, '📁 ' + (L ? 'Папка' : 'Թղթապանակ')),
        h('button', { class: 'btn primary', onClick: () => upInput.click() }, '⬆️ ' + t('btn.upload')), upInput)),
    h('div', { class: 'search', style: 'margin-bottom:10px' }, q), crumbs);
  const dz = h('div', { class: 'card', style: 'min-height:200px' }, items);
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over');
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files); });
  root.append(bar, dz);

  async function upload(files) {
    const fd = new FormData();
    fd.append('path', PATH);
    [...files].forEach(f => fd.append('files', f));
    loader(true, L ? 'Загружаю…' : 'Բեռնում եմ…');
    try {
      const r = await api('/api/vault/upload', { method: 'POST', form: fd });
      toast(`✅ ${r.items.length} ${t('word.files').toLowerCase()}`);
      load();
    } finally { loader(false); upInput.value = ''; }
  }
  async function mkdir() {
    const name = await promptDlg(L ? 'Название папки' : 'Թղթապանակի անունը');
    if (!name) return;
    await api('/api/vault/mkdir', { method: 'POST', body: { path: PATH, name } });
    toast(t('msg.saved')); load();
  }
  async function load() {
    const needle = q.value.trim();
    clear(crumbs); clear(items);
    try {
      const st = await api('/api/vault/stats', { quiet: true });
      statsBox.textContent = `${nf(st.files)} ${L ? 'файлов' : 'ֆայլ'} · ${bytes(st.size)}`;
    } catch (e) { /* ոչ կրիտիկական */ }
    if (needle.length >= 2) {
      crumbs.append(h('span', { class: 'badge plain', text: `🔍 ${needle}` }),
        h('button', { onClick: () => { q.value = ''; load(); } }, '✕ ' + t('btn.close')));
      const rows = await api(`/api/vault/search?q=${encodeURIComponent(needle)}`);
      if (!rows.length) { items.append(emptyBox(L ? 'Ничего не найдено' : 'Ոչինչ չգտնվեց', '🔍')); return; }
      items.append(grid(rows, L, load, true));
      return;
    }
    const data = await api(`/api/vault/list?path=${encodeURIComponent(PATH)}`);
    crumbs.append(h('button', { onClick: () => { PATH = ''; load(); } }, '☁️ ' + (L ? 'Хранилище' : 'Պահոց')));
    data.breadcrumbs.forEach(b => {
      crumbs.append(h('span', { class: 'muted', text: '/' }),
        h('button', { onClick: () => { PATH = b.path; load(); } }, b.name));
    });
    if (!data.items.length) items.append(emptyBox(L ? 'Папка пуста — перетащите файлы сюда'
      : 'Թղթապանակը դատարկ է՝ քաշեք ֆայլերը այստեղ', '📂'));
    else items.append(grid(data.items, L, load, false));
  }
  function grid(rows, L2, reload, showPath) {
    const g = h('div', { class: 'vgrid' });
    rows.forEach(it => {
      const card = h('div', { class: 'vitem' });
      card.append(h('button', { class: 'btn sm ghost vmenu', onClick: e => { e.stopPropagation(); menu(it, L2, reload); } }, '⋯'));
      if (it.kind === 'image') card.append(h('img', { class: 'thumb', loading: 'lazy',
        src: `/api/vault/file?path=${encodeURIComponent(it.path)}` }));
      else card.append(h('div', { class: 'vi', text: it.is_dir ? '📁' : fileIcon(it.ext) }));
      card.append(h('div', { class: 'vn', text: it.name }),
        h('div', { class: 'vs', text: it.is_dir ? `${it.items ?? 0} ${L2 ? 'эл.' : 'տարր'}`
          : `${bytes(it.size)} · ${dt(it.modified).slice(0, 10)}` }));
      if (showPath) card.append(h('div', { class: 'tiny muted', text: it.path }));
      card.addEventListener('click', () => {
        if (it.is_dir) { PATH = it.path; q.value = ''; reload(); }
        else open(it, L2);
      });
      g.append(card);
    });
    return g;
  }
  function open(it, L2) {
    const url = `/api/vault/file?path=${encodeURIComponent(it.path)}`;
    if (it.kind === 'image') {
      modal({ title: it.name, wide: true, body: h('img', { src: url, style: 'width:100%;border-radius:10px' }),
        actions: [{ label: '⬇️ ' + t('btn.download'), onClick: () => { window.location.href = url + '&download=1'; } }] });
      return;
    }
    if (it.ext === 'pdf') { window.open(url, '_blank'); return; }
    if (it.kind === 'audio') {
      modal({ title: it.name, body: h('audio', { controls: true, src: url, style: 'width:100%' }) });
      return;
    }
    if (it.ext === 'docx') { window.open(`/api/vault/print?path=${encodeURIComponent(it.path)}`, '_blank'); return; }
    window.location.href = url + '&download=1';
  }
  function menu(it, L2, reload) {
    const url = `/api/vault/file?path=${encodeURIComponent(it.path)}`;
    const row = (icon, label, fn) => h('button', { class: 'btn block', style: 'justify-content:flex-start;margin-bottom:6px',
      onClick: async () => { await fn(); m.close(); } }, `${icon}  ${label}`);
    const m = modal({ title: it.name, body: h('div', {},
      !it.is_dir ? row('👁', t('btn.open'), () => open(it, L2)) : null,
      !it.is_dir ? row('🖨', t('btn.print'), () => {
        if (it.ext === 'pdf') window.open(url, '_blank');
        else if (it.ext === 'docx') window.open(`/api/vault/print?path=${encodeURIComponent(it.path)}&auto=1`, '_blank');
        else toast(L2 ? 'Этот формат печатается только после скачивания' : 'Այս ձևաչափը տպվում է ներբեռնելուց հետո', 'warn');
      }) : null,
      !it.is_dir ? row('⬇️', t('btn.download'), () => { window.location.href = url + '&download=1'; }) : null,
      row('✏️', L2 ? 'Переименовать' : 'Վերանվանել', async () => {
        const name = await promptDlg(L2 ? 'Новое имя' : 'Նոր անունը', { value: it.name });
        if (!name) return;
        await api('/api/vault/rename', { method: 'POST', body: { path: it.path, name } });
        toast(t('msg.saved')); reload();
      }),
      row('📂', L2 ? 'Переместить' : 'Տեղափոխել', () => moveDlg(it, L2, reload)),
      row('🗑', t('btn.delete'), async () => {
        if (!await confirmDlg(L2 ? `Удалить «${it.name}»?` : `Ջնջե՞լ «${it.name}»-ը:`)) return;
        await api(`/api/vault/item?path=${encodeURIComponent(it.path)}`, { method: 'DELETE' });
        toast(t('msg.deleted')); reload();
      })) });
  }
  async function moveDlg(it, L2, reload) {
    const tree = await api('/api/vault/tree');
    const list = h('div', { class: 'list scroll' });
    const addRow = (node, depth) => {
      list.append(h('button', { class: 'li', style: `cursor:pointer;border:0;width:100%;text-align:left;padding-left:${12 + depth * 18}px`,
        onClick: async () => {
          await api('/api/vault/move', { method: 'POST', body: { path: it.path, to: node.path } });
          toast(t('msg.saved')); m.close(); reload();
        } }, `📁 ${node.name}`));
      (node.children || []).forEach(c => addRow(c, depth + 1));
    };
    list.append(h('button', { class: 'li', style: 'cursor:pointer;border:0;width:100%;text-align:left',
      onClick: async () => {
        await api('/api/vault/move', { method: 'POST', body: { path: it.path, to: '' } });
        toast(t('msg.saved')); m.close(); reload();
      } }, '☁️ ' + (L2 ? 'Корень' : 'Արմատ')));
    tree.forEach(n => addRow(n, 0));
    const m = modal({ title: `📂 ${L2 ? 'Куда переместить' : 'Ուր տեղափոխել'}`, body: list });
  }
  q.addEventListener('input', debounce(load, 280));
  await load();
  return root;
}
