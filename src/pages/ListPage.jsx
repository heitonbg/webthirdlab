import { useState } from 'react';
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router';
import { useTodos } from '../state/context.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { AddTaskForm } from '../components/AddTaskForm.jsx';
import { TextForm } from '../components/TextForm.jsx';
import { TaskItem } from '../components/TaskItem.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';

export function ListPage({ listId }) {
  const { state, dispatch } = useTodos();
  const [params, setParams] = useSearchParams();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const debounced = useDebounce(query);
  const list = state.lists.find((item) => item.id === listId);
  if (!list) return <NotFoundPage title="Список не найден" />;
  const filter = ['active', 'done'].includes(params.get('filter')) ? params.get('filter') : 'all';
  const tasks = state.tasks.filter((task) => task.listId === listId);
  const active = tasks.filter((task) => !task.done).length;
  const filtered = tasks.filter((task) => (filter === 'all' || (filter === 'done' ? task.done : !task.done)) && task.title.toLocaleLowerCase('ru').includes(debounced.trim().toLocaleLowerCase('ru')));
  const search = params.size ? `?${params}` : '';
  function removeTask(task) {
    const index = filtered.findIndex((item) => item.id === task.id);
    const next = filtered[index + 1] || filtered[index - 1];
    const focusId = next && next.id !== task.id ? `task-link-${next.id}` : 'new-task';
    dispatch({ type: 'task/removed', id: task.id }); setDeleting(null);
    if (taskId === task.id) navigate(`/lists/${listId}${search}`, { state: { focusId } });
    else requestAnimationFrame(() => document.getElementById(focusId)?.focus());
  }
  return <div className={`list-layout ${taskId ? 'has-card' : ''}`}>
    <section className="list-pane" aria-label={`Список ${list.title}`}>
      <header className="page-header"><p className="eyebrow">Ваш фокус на сегодня</p><div className="title-row"><h1 tabIndex={-1} data-page-title={taskId ? undefined : true}>{list.title}</h1><span className="list-number">{String(tasks.length).padStart(2, '0')}</span></div><div className="list-tools"><button onClick={() => setRenaming((value) => !value)} aria-expanded={renaming} aria-controls="rename-list">Переименовать</button><button onClick={() => setDeleting({ kind: 'list' })}>Удалить список</button></div></header>
      {renaming && <div className="rename-panel" id="rename-list"><TextForm label="Название списка" initial={list.title} button="Сохранить" onSubmit={(title) => { dispatch({ type: 'list/updated', id: listId, title }); setRenaming(false); }} /><button className="text-button" onClick={() => setRenaming(false)}>Отмена</button></div>}
      <AddTaskForm onAdd={(fields) => dispatch({ type: 'task/added', task: { id: crypto.randomUUID(), listId, ...fields, done: false, createdAt: Date.now(), subtasks: [] } })} />
      <div className="search-field"><label htmlFor="task-search" className="visually-hidden">Поиск по названию в текущем списке</label><span aria-hidden="true">⌕</span><input id="task-search" type="search" placeholder="Найти в этом списке" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" /></div>
      <div className="list-toolbar"><div className="filters" role="group" aria-label="Фильтр задач">{[['all', 'Все'], ['active', 'Активные'], ['done', 'Выполненные']].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => { const next = new URLSearchParams(params); next.set('filter', value); setParams(next); }}>{label}</button>)}</div><span className="muted result-count" role="status" aria-live="polite">Найдено: {filtered.length}</span></div>
      {filtered.length ? <ul className="task-list">{filtered.map((task) => <TaskItem key={task.id} task={task} search={search} onDelete={(item) => setDeleting({ kind: 'task', task: item })} />)}</ul> : <div className="empty-state compact"><span className="empty-symbol" aria-hidden="true">{debounced.trim() ? '⌕' : '✓'}</span><h2>{debounced.trim() ? 'Ничего не нашлось' : tasks.length ? 'Здесь пока пусто' : 'Чистый лист'}</h2><p className="muted">{debounced.trim() ? `Нет задач по запросу «${debounced}».` : tasks.length ? 'В выбранном фильтре нет задач.' : 'Добавьте первую задачу. Даже маленькую.'}</p>{query && <button onClick={() => setQuery('')}>Сбросить поиск</button>}</div>}
      <div className="list-bottom"><span className="muted" role="status">Активных задач: <strong>{active}</strong></span><button className="text-button" disabled={active === tasks.length} onClick={() => { dispatch({ type: 'task/cleared', listId }); if (tasks.some((task) => task.id === taskId && task.done)) navigate(`/lists/${listId}${search}`, { state: { focusId: 'new-task' } }); }}>Очистить выполненные</button></div>
    </section>
    <Outlet />
    {deleting && <ConfirmDialog title={deleting.kind === 'list' ? 'Удалить список?' : 'Удалить задачу?'} onClose={() => setDeleting(null)} onConfirm={() => {
      if (deleting.kind === 'list') { dispatch({ type: 'list/removed', id: listId }); setDeleting(null); navigate('/'); }
      else removeTask(deleting.task);
    }}><p>{deleting.kind === 'list' ? `Список «${list.title}» и все его задачи будут удалены.` : `Задача «${deleting.task.title}» и её подзадачи будут удалены.`}</p><p className="muted">Это действие нельзя отменить.</p></ConfirmDialog>}
  </div>;
}
