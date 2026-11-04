import { Navigate } from 'react-router';
import { useTodos } from '../state/context.js';
import { TextForm } from '../components/TextForm.jsx';

export function HomePage() {
  const { state, dispatch } = useTodos();
  if (state.lists.length) return <Navigate to={`/lists/${state.lists[0].id}`} replace />;
  return <section className="welcome"><p className="eyebrow">Место для ваших планов</p><div className="empty-illustration" aria-hidden="true"><span>✓</span><i /><i /><i /></div><h1 tabIndex={-1} data-page-title>Большие дела<br />начинаются со списка.</h1><p className="muted">Соберите задачи в одном месте.<br />Создайте свой первый список — остальное по шагам.</p><TextForm label="Как назовём список?" placeholder="Например, Мои планы" button="Создать" onSubmit={(title) => dispatch({ type: 'list/added', list: { id: crypto.randomUUID(), title } })} /></section>;
}
