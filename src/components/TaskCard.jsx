import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useTodos } from '../state/context.js';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { TaskEditor } from './TaskEditor.jsx';
import { SubtaskList } from './SubtaskList.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';

export function TaskCard() {
  const { listId, taskId } = useParams();
  const [params] = useSearchParams();
  const { state, dispatch } = useTodos();
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const task = state.tasks.find((item) => item.id === taskId && item.listId === listId);
  const to = `/lists/${listId}${params.size ? `?${params}` : ''}`;
  return <section className="task-card" aria-label="Карточка задачи">{task ? <>
    <div className="card-top"><span className="eyebrow">Детали задачи</span><Link className="card-close" to={to} state={{ focusId: `task-link-${task.id}` }} aria-label="Закрыть карточку">← К списку</Link></div>
    <h2 data-page-title tabIndex={-1}>{task.title}</h2>
    <label className="task-complete"><input type="checkbox" checked={task.done} onChange={() => dispatch({ type: 'task/toggled', id: task.id })} />Задача выполнена</label>
    <TaskEditor key={task.id} task={task} />
    <SubtaskList task={task} />
    <div className="card-bottom"><span className="muted">Создано {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(task.createdAt)}</span><button className="text-button danger-text" onClick={() => setDeleting(true)}>Удалить задачу</button></div>
    {deleting && <ConfirmDialog title="Удалить задачу?" onClose={() => setDeleting(false)} onConfirm={() => { dispatch({ type: 'task/removed', id: task.id }); setDeleting(false); navigate(to, { state: { focusId: 'new-task' } }); }}><p>Задача «{task.title}» и её подзадачи будут удалены без возможности восстановления.</p></ConfirmDialog>}
  </> : <NotFoundPage title="Задача не найдена" to={to} link="К списку" />}</section>;
}
