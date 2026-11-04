import test from 'node:test';
import assert from 'node:assert/strict';
import { todoReducer } from '../src/state/todoReducer.js';
import { isValidState, loadState, saveState } from '../src/state/storage.js';

const task = { id: 't1', listId: 'l1', title: 'Задача', description: '', time: '', done: false, createdAt: 1, subtasks: [{ id: 's1', title: 'Шаг', done: false }] };
const initial = () => ({ lists: [{ id: 'l1', title: 'Учёба' }, { id: 'l2', title: 'Работа' }], tasks: [structuredClone(task), { ...structuredClone(task), id: 't2', listId: 'l2' }] });
const memory = (data = {}) => ({ getItem: (key) => data[key] ?? null, setItem: (key, value) => { data[key] = value; } });

test('Удаление списка каскадное, чужие задачи и исходные данные сохраняются', () => {
  const state = initial();
  const before = structuredClone(state);
  const next = todoReducer(state, { type: 'list/removed', id: 'l1' });
  assert.deepEqual(state, before);
  assert.deepEqual(next.lists.map((list) => list.id), ['l2']);
  assert.deepEqual(next.tasks.map((item) => item.id), ['t2']);
});
test('Подзадачи обновляются неизменяемо, независимо от отметки основной задачи', () => {
  const state = initial();
  const next = todoReducer(state, { type: 'subtask/toggled', taskId: 't1', id: 's1' });
  assert.equal(next.tasks[0].subtasks[0].done, true);
  assert.equal(next.tasks[0].done, false);
  assert.equal(state.tasks[0].subtasks[0].done, false);
  assert.equal(next.tasks[1], state.tasks[1]);
});
test('Очистка выполненных ограничена текущим списком', () => {
  const state = initial(); state.tasks.forEach((item) => { item.done = true; });
  const next = todoReducer(state, { type: 'task/cleared', listId: 'l1' });
  assert.deepEqual(next.tasks.map((item) => item.id), ['t2']);
});
test('Повреждённое хранилище не мешает запуску', () => {
  for (const value of ['not json', '{}', '{"lists":[],"tasks":[null]}']) assert.deepEqual(loadState(memory({ 'todo-app:v2': value })), { lists: [], tasks: [] });
  assert.deepEqual(loadState({ getItem() { throw new Error('denied'); } }), { lists: [], tasks: [] });
  assert.equal(saveState(initial(), { setItem() { throw new Error('quota'); } }), false);
});
test('Миграция Л2 сохраняет описание, время, статус; не изменяет старый ключ', () => {
  const old = JSON.stringify({ tasks: [{ id: 1, title: '  Из Л2  ', body: '<b>текст</b>', time: '12:30', done: true }] });
  const storage = memory({ 'todo-app:v1': old });
  const state = loadState(storage);
  assert.equal(state.lists[0].title, 'Входящие');
  assert.equal(state.tasks[0].title, 'Из Л2');
  assert.equal(state.tasks[0].description, '<b>текст</b>');
  assert.equal(state.tasks[0].time, '12:30');
  assert.equal(state.tasks[0].done, true);
  assert.equal(isValidState(state), true);
  saveState(state, storage);
  assert.equal(storage.getItem('todo-app:v1'), old);
  assert.deepEqual(loadState(storage), state);
});
test('Существующая v2 имеет приоритет над v1, даже если списки пусты', () => {
  assert.deepEqual(loadState(memory({ 'todo-app:v2': '{"lists":[],"tasks":[]}', 'todo-app:v1': '{"tasks":[{"title":"старое"}]}' })), { lists: [], tasks: [] });
});
