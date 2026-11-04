import { NavLink, useNavigate } from 'react-router';
import { useTodos } from '../state/context.js';
import { TextForm } from './TextForm.jsx';

export function Sidebar({ onNavigate }) {
  const { state, dispatch } = useTodos();
  const navigate = useNavigate();
  return <>
    <div className="sidebar-heading"><h2>Мои списки</h2><span className="count">{state.lists.length}</span></div>
    <nav aria-label="Списки задач"><ul className="list-nav">{state.lists.map((list) => {
      const count = state.tasks.filter((task) => task.listId === list.id && !task.done).length;
      return <li key={list.id}><NavLink to={`/lists/${list.id}`} onClick={onNavigate}><span className="list-symbol" aria-hidden="true">#</span><span className="nav-title">{list.title}</span><span className="count" aria-label={`Активных задач: ${count}`}>{count}</span></NavLink></li>;
    })}</ul></nav>
    {!state.lists.length && <p className="muted sidebar-hint">Пока нет списков.<br />Начнём с первого?</p>}
    <TextForm label="Новый список" placeholder="Например, Учёба" button="+" onSubmit={(title) => {
      const id = crypto.randomUUID();
      dispatch({ type: 'list/added', list: { id, title } });
      navigate(`/lists/${id}`); onNavigate();
    }} />
    <div className="sidebar-note"><span aria-hidden="true">↳</span><p>Один список.<br />Один маленький шаг.<br />Больше порядка.</p></div>
  </>;
}
