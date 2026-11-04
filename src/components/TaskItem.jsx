import { Link } from 'react-router';
import { useTodos } from '../state/context.js';

export function TaskItem({ task, search, onDelete }) {
  const { dispatch } = useTodos();
  const completed = task.subtasks.filter((subtask) => subtask.done).length;
  return <li className={`task ${task.done ? 'is-done' : ''}`}>
    <input type="checkbox" checked={task.done} onChange={() => dispatch({ type: 'task/toggled', id: task.id })} aria-label={`Выполнено: ${task.title}`} />
    <div className="task-content"><Link className="task-title" id={`task-link-${task.id}`} to={`tasks/${task.id}${search}`} aria-label={`Открыть задачу: ${task.title}`}>{task.title}</Link>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">{task.time && <span>◷ {task.time}</span>}{task.subtasks.length > 0 && <span aria-label={`Подзадачи: выполнено ${completed} из ${task.subtasks.length}`}>↳ {completed}/{task.subtasks.length}</span>}</div>
    </div>
    <div className="task-actions"><Link className="icon-button" to={`tasks/${task.id}${search}`} aria-label={`Редактировать: ${task.title}`} title="Редактировать">✎</Link><button className="icon-button" aria-label={`Удалить: ${task.title}`} title="Удалить" onClick={() => onDelete(task)}>×</button></div>
  </li>;
}
