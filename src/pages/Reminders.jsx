import { useState } from 'react';
import { SlidersHorizontal, MessageSquareText, Send, RefreshCcw, MessageCircle } from 'lucide-react';
import { PageHead } from '../components/UI.jsx';
import { tr } from '../i18n.js';
import { reminderTemplates } from '../data.js';
import { sendTelegramMessage } from '../dataService.js';

export function Reminders({ students, rules, setRules, messageLog, sendReminder, groups = [], locale = 'ru' }) {
  const [previewId, setPreviewId] = useState(students.find(s => !s.paid)?.id || students[0].id);
  const [templateId, setTemplateId] = useState(reminderTemplates[0].id);
  const s = students.find(x => x.id === previewId) || students[0];
  const tpl = reminderTemplates.find(x => x.id === templateId);
  const body = tpl.body
    .replace('{{name}}', s.name)
    .replace('{{amount}}', new Intl.NumberFormat('ru-RU').format(Math.max(0, s.fee - s.paidAmount)))
    .replace('{{due_date}}', s.due);

  const linkedGroups = groups.filter(g => g.telegramChatId);
  const [tgGroupId, setTgGroupId] = useState(linkedGroups[0]?.id || '');
  const [tgMessage, setTgMessage] = useState('');
  const [tgSending, setTgSending] = useState(false);
  const [tgResult, setTgResult] = useState(null);

  async function sendToTelegram() {
    if (!tgGroupId || !tgMessage.trim()) return;
    setTgSending(true);
    setTgResult(null);
    const res = await sendTelegramMessage(tgGroupId, tgMessage.trim());
    setTgSending(false);
    setTgResult(res);
    if (res.ok) setTgMessage('');
  }

  return (
    <section className="content">
      <PageHead title={tr(locale, 'reminders')} sub="Правила, очередь, шаблоны и журнал отправки">
        <span className="provider"><span /> Провайдер не подключён</span>
      </PageHead>
      <div className="remindergrid">
        <div className="card">
          <div className="cardhead">
            <div><h3>Правила оплаты</h3><p>Когда автоматически создавать SMS-job</p></div>
            <SlidersHorizontal size={17} />
          </div>
          <div className="cardbody">
            {rules.map(r => (
              <div className="toggle" key={r.id}>
                <div><b>{r.title}</b><small>Канал: {r.channel} · отправитель ALBAYAN</small></div>
                <label className="switch">
                  <input type="checkbox" checked={r.enabled} onChange={() => setRules(v => v.map(x => x.id === r.id ? { ...x, enabled: !x.enabled } : x))} />
                  <span />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="cardhead">
            <div><h3>Предпросмотр SMS</h3><p>Шаблон с переменными ученика</p></div>
            <MessageSquareText size={17} />
          </div>
          <div className="cardbody">
            <div className="grid2">
              <label className="field">Ученик
                <select value={previewId} onChange={e => setPreviewId(e.target.value)}>
                  {students.map(x => <option value={x.id} key={x.id}>{x.name}</option>)}
                </select>
              </label>
              <label className="field">Шаблон
                <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
                  {reminderTemplates.map(x => <option value={x.id} key={x.id}>{x.name}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="smsphone">
            <div className="smshead">ALBAYAN</div>
            <div className="bubble">{body}</div>
            <small>{body.length} символов · SMS preview</small>
          </div>
          <button className="btn btn-primary btn-full" onClick={() => sendReminder(s, tpl.name)}>
            <Send size={16} /> Добавить в очередь
          </button>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="cardhead">
            <div><h3>Telegram orqali guruhga xabar</h3><p>SMS provayder ulanmaguncha — bot orqali guruhga to'g'ridan-to'g'ri xabar yuboring</p></div>
            <MessageCircle size={17} />
          </div>
          <div className="cardbody">
            {linkedGroups.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
                Hali birorta guruh Telegram botga ulanmagan. Guruhlar sahifasida guruh kodini belgilang va botni mos Telegram guruhiga qo'shing.
              </p>
            ) : (
              <>
                <label className="field">Guruh
                  <select value={tgGroupId} onChange={e => setTgGroupId(e.target.value)}>
                    {linkedGroups.map(g => <option value={g.id} key={g.id}>{g.name} ({g.groupCode})</option>)}
                  </select>
                </label>
                <label className="field" style={{ marginTop: 10 }}>Xabar matni
                  <textarea rows={3} value={tgMessage} onChange={e => setTgMessage(e.target.value)} placeholder="Ertaga dars vaqti 18:30 ga o'zgardi." />
                </label>
                {tgResult && (
                  <p style={{ fontSize: 12.5, marginTop: 8, color: tgResult.ok ? 'var(--emerald-deep)' : 'var(--brick)' }}>
                    {tgResult.ok ? `Yuborildi: ${tgResult.sentTo}` : tgResult.error}
                  </p>
                )}
                <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} disabled={tgSending} onClick={sendToTelegram}>
                  <Send size={14} /> {tgSending ? 'Yuborilmoqda…' : 'Guruhga yuborish'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="cardhead">
            <div><h3>Журнал сообщений</h3><p>Статусы синхронизируются с очередью Supabase</p></div>
            <button className="btn btn-ghost btn-sm"><RefreshCcw size={13} /> Обновить</button>
          </div>
          <div className="tablewrap">
            <table>
              <thead><tr><th>Получатель</th><th>Тип</th><th>Телефон</th><th>Время</th><th>Статус</th></tr></thead>
              <tbody>
                {messageLog.map(m => (
                  <tr key={m.id}>
                    <td><b>{m.student}</b><br /><span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{m.id}</span></td>
                    <td>{m.type}</td>
                    <td className="mono">{m.phone}</td>
                    <td className="mono">{m.at}</td>
                    <td><span className={'pill ' + (m.status === 'delivered' ? 'pill-success' : 'pill-warning')}>{m.status === 'delivered' ? 'Доставлено' : 'В очереди'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
