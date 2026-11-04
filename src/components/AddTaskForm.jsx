import { useRef, useState } from 'react';

export function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const input = useRef(null);
  function submit(event) {
    event.preventDefault();
    if (!title.trim()) { setError('Введите название задачи.'); input.current.focus(); return; }
    onAdd({ title: title.trim(), description: description.trim(), time });
    setTitle(''); setDescription(''); setTime(''); setError(''); input.current.focus();
  }
  return <form className="add-task-form" onSubmit={submit} noValidate>
    <label className="visually-hidden" htmlFor="new-task">Новая задача</label>
    <div className="input-row"><input id="new-task" ref={input} placeholder="Что нужно сделать?" value={title} onChange={(event) => { setTitle(event.target.value); setError(''); }} maxLength={200} required aria-invalid={Boolean(error)} aria-describedby={error ? 'new-task-error' : undefined} /><button className="primary" type="submit"><span aria-hidden="true">＋ </span>Добавить</button></div>
    {error && <p className="error" role="alert" id="new-task-error">{error}</p>}
    <details className="task-options"><summary>Описание и время</summary><div className="field"><label htmlFor="new-description">Описание</label><textarea id="new-description" value={description} maxLength={5000} onChange={(event) => setDescription(event.target.value)} /></div><div className="field"><label htmlFor="new-time">Время (необязательно)</label><input id="new-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div></details>
  </form>;
}
