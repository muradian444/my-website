// 🎙 Ձայն՝ տեքստ -> MP3 (edge-tts / տեղական շարժիչ), ձայնի կլոն, ձայնագրություն -> տեքստ
import { S, api, clear, confirmDlg, emptyBox, filesResult, h, loader, modal, promptDlg, t, toast } from '../core.js';

export const sub = () => S.lang === 'ru' ? 'Текст → MP3, свои голоса, распознавание речи'
  : 'Տեքստ → MP3, ձեր ձայները, խոսքի ճանաչում';

let VOICE = '';

export async function render() {
  const L = S.lang === 'ru' ? 1 : 0;
  const root = h('div');
  const voicesBox = h('div');
  const result = h('div');

  const text = h('textarea', { rows: '6', placeholder: L ? 'Текст для озвучки (на армянском)…'
    : 'Տեքստը ձայնագրելու համար (հայերեն)…' });
  const count = h('span', { class: 'tiny muted' });
  text.addEventListener('input', () => { count.textContent = `${text.value.length}`; });

  const say = h('button', { class: 'btn primary' }, '🔊 ' + (L ? 'Озвучить' : 'Ձայնագրել'));
  say.addEventListener('click', async () => {
    if (!VOICE) { toast(L ? 'Сначала выберите голос' : 'Նախ ընտրեք ձայնը', 'err'); return; }
    if (!text.value.trim()) { toast(L ? 'Введите текст' : 'Մուտքագրեք տեքստը', 'err'); return; }
    loader(true, L ? 'Готовлю MP3… (клон может занять до 2 минут)' : 'Պատրաստվում է… (կլոնը կարող է տևել մինչև 2 րոպե)');
    try {
      const r = await api('/api/voice/synth', { method: 'POST', body: { key: VOICE, text: text.value } });
      clear(result).append(player(r.files[0], L), filesResult(r.files));
    } catch (e) { /* toast */ } finally { loader(false); }
  });

  async function loadVoices() {
    clear(voicesBox);
    let voices = [];
    try { voices = await api('/api/voice/voices'); } catch (e) {
      voicesBox.append(h('div', { class: 'card' }, h('p', { class: 'small', style: 'color:var(--warn)',
        text: e.message }))); return;
    }
    if (!voices.length) { voicesBox.append(emptyBox(L ? 'Голосов нет' : 'Ձայներ չկան', '🎙')); return; }
    const grid = h('div', { class: 'grid c3' });
    voices.forEach(v => {
      const pick = h('button', { class: 'pick' + (VOICE === v.key ? ' sel' : '') },
        h('div', { class: 'pico' }, v.kind === 'clone' ? '🧬' : '🔊'),
        h('div', { style: 'flex:1' }, h('div', { class: 'pt', text: v.name }),
          h('div', { class: 'pd', text: v.kind === 'clone' ? (L ? 'ваш голос (клон)' : 'ձեր ձայնը (կլոն)')
            : (L ? 'готовый голос' : 'պատրաստի ձայն') })));
      pick.addEventListener('click', () => { VOICE = v.key; loadVoices(); });
      const tools = h('div', { class: 'row tight', style: 'margin-top:8px' },
        h('button', { class: 'btn sm', onClick: async () => {
          loader(true, L ? 'Готовлю образец…' : 'Նմուշը պատրաստվում է…');
          try {
            const r = await api('/api/voice/sample', { method: 'POST', body: { key: v.key } });
            modal({ title: '🔊 ' + v.name, body: player(r.files[0], L) });
          } catch (e) { /* toast */ } finally { loader(false); }
        } }, '▶ ' + (L ? 'Образец' : 'Նմուշ')),
        v.kind === 'clone' ? h('button', { class: 'btn sm danger', onClick: async () => {
          if (!await confirmDlg(L ? `Удалить голос «${v.name}»?` : `Ջնջե՞լ «${v.name}» ձայնը:`)) return;
          await api(`/api/voice/${v.key}`, { method: 'DELETE' });
          if (VOICE === v.key) VOICE = '';
          toast(t('msg.deleted')); loadVoices();
        } }, '🗑') : null);
      grid.append(h('div', {}, pick, tools));
    });
    voicesBox.append(grid);
  }

  const upl = h('input', { type: 'file', accept: 'audio/*', style: 'display:none' });
  upl.addEventListener('change', async () => {
    if (!upl.files.length) return;
    const name = await promptDlg(L ? 'Название нового голоса' : 'Նոր ձայնի անունը',
      { placeholder: L ? 'например: Арам' : 'օրինակ՝ Արամ' });
    if (!name) { upl.value = ''; return; }
    const fd = new FormData(); fd.append('name', name); fd.append('file', upl.files[0]);
    loader(true, L ? 'Проверяю запись…' : 'Ստուգում եմ ձայնագրությունը…');
    try {
      const r = await api('/api/voice/upload', { method: 'POST', form: fd });
      toast(`✅ ${name} · ${r.seconds} ${L ? 'сек' : 'վրկ'}` + (r.warning ? `\n⚠️ ${r.warning}` : ''), r.warning ? 'warn' : 'ok');
      loadVoices();
    } catch (e) { /* toast */ } finally { loader(false); upl.value = ''; }
  });

  const sttInput = h('input', { type: 'file', accept: 'audio/*', style: 'display:none' });
  sttInput.addEventListener('change', async () => {
    if (!sttInput.files.length) return;
    const fd = new FormData(); fd.append('file', sttInput.files[0]);
    loader(true, L ? 'Распознаю речь…' : 'Ճանաչում եմ խոսքը…');
    try {
      const r = await api('/api/voice/stt', { method: 'POST', form: fd });
      text.value = r.text; count.textContent = String(r.text.length);
      toast(L ? 'Текст распознан' : 'Տեքստը ճանաչվեց');
    } catch (e) { /* toast */ } finally { loader(false); sttInput.value = ''; }
  });

  root.append(h('div', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { style: 'margin:0', text: '🎙 ' + (L ? 'Голоса' : 'Ձայներ') }),
      h('div', { class: 'right' },
        h('button', { class: 'btn', onClick: () => upl.click() }, '⬆️ ' + (L ? 'Загрузить свой голос' : 'Բեռնել ձեր ձայնը')), upl)),
    h('p', { class: 'small muted', text: L
      ? 'Выберите голос, затем напишите текст. Для клона нужны 1–3 минуты чистой речи (torch/torchaudio).'
      : 'Ընտրեք ձայնը, հետո գրեք տեքստը: Կլոնի համար պետք է 1–3 րոպե մաքուր խոսք (torch/torchaudio):' }),
    voicesBox));
  root.append(h('div', { class: 'card' },
    h('div', { class: 'card-head' }, h('h3', { style: 'margin:0', text: '✍️ ' + (L ? 'Текст' : 'Տեքստ') }),
      h('div', { class: 'right' }, count,
        h('button', { class: 'btn sm', onClick: () => sttInput.click() }, '🎤 ' + (L ? 'Из записи' : 'Ձայնագրությունից')), sttInput)),
    text, h('div', { class: 'row', style: 'margin-top:10px' }, say)));
  root.append(result);
  await loadVoices();
  return root;
}

function player(file, L) {
  return h('div', { class: 'card', style: 'margin:0 0 10px' },
    h('audio', { controls: true, src: file.url, style: 'width:100%' }),
    h('div', { class: 'tiny muted', text: file.name }));
}
