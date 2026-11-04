import { Link, useParams, useSearchParams } from 'react-router';
import { useTodos } from '../state/context.js';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function TaskCard() {
  const { listId, taskId } = useParams();
  const [params] = useSearchParams();
  const { state } = useTodos();
  const task = state.tasks.find((item) => item.id === taskId && item.listId === listId);
  const to = `/lists/${listId}${params.size ? `?${params}` : ''}`;
  return <section className="task-card">{task ? <><Link to={to}>← К списку</Link><h2 data-page-title tabIndex={-1}>{task.title}</h2><p>{task.description}</p></> : <NotFoundPage title="Задача не найдена" to={to} link="К списку" />}</section>;
}
