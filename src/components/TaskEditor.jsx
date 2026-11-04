import { useRef, useState } from 'react';
import { useTodos } from '../state/context.js';

export function TaskEditor({ task }) {
  const { dispatch } = useTodos();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [time, setTime] = useState(task.time);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const titleRef = useRef(null);
  function reset() { setTitle(task.title); setDescription(task.description); setTime(task.time); setError(''); setMessage('Изменения отменены.'); }
  function save(event) {
    event.preventDefault();
    if (!title.trim()) { setError('Название не может быть пустым.'); setMessage(''); titleRef.current.focus(); return; }
    dispatch({ type: 'task/updated', id: task.id, changes: { title: title.trim(), description: description.trim(), time } });
    setTitle(title.trim()); setDescription(description.trim()); setError(''); setMessage('Изменения сохранены.');
  }
  return <form onSubmit={save} noValidate onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); reset(); } }} onChange={() => setMessage('')}>
    <div className="field"><label htmlFor="edit-task-title">Название задачи</label><input id="edit-task-title" ref={titleRef} value={title} onChange={(event) => { setTitle(event.target.value); setError(''); }} onBlur={() => { if (!title.trim()) setError('Название не может быть пустым. Изменения не сохранены.'); }} required maxLength={200} aria-invalid={Boolean(error)} aria-describedby={error ? 'edit-task-error' : undefined} />{error && <p id="edit-task-error" className="error" role="alert">{error}</p>}</div>
    <div className="field"><label htmlFor="edit-task-description">Описание</label><textarea id="edit-task-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} placeholder="Детали, заметки, первый шаг…" /></div>
    <div className="field"><label htmlFor="edit-task-time">Время</label><input id="edit-task-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div>
    <div className="editor-actions"><button className="primary" type="submit">Сохранить</button><button type="button" onClick={reset}>Отменить ввод</button></div>
    <p className="save-status muted" role="status">{message || 'Название, описание и время сохраняются кнопкой выше.'}</p>
  </form>;
}
