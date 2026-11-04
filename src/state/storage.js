export const STORAGE_KEY = 'todo-app:v2';
const empty = () => ({ lists: [], tasks: [] });
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

export function isValidState(value) {
  return Boolean(value && Array.isArray(value.lists) && Array.isArray(value.tasks)
    && value.lists.every((list) => list && isText(list.id) && isText(list.title))
    && uniqueIds(value.lists)
    && value.tasks.every((task) => task && isText(task.id) && isText(task.title)
      && value.lists.some((list) => list.id === task.listId)
      && typeof task.done === 'boolean' && typeof task.description === 'string'
      && typeof task.time === 'string' && Number.isFinite(task.createdAt) && Math.abs(task.createdAt) <= 8.64e15
      && Array.isArray(task.subtasks)
      && task.subtasks.every((sub) => sub && isText(sub.id) && isText(sub.title) && typeof sub.done === 'boolean')
      && uniqueIds(task.subtasks)) && uniqueIds(value.tasks));
}

export function loadState(storage) {
  try {
    storage ??= localStorage;
    const saved = storage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return isValidState(parsed) ? parsed : empty();
    }
    const old = JSON.parse(storage.getItem('todo-app:v1'));
    if (!old || !Array.isArray(old.tasks)) return empty();
    const tasks = old.tasks.filter((task) => task && isText(task.title)).map((task) => ({
      id: crypto.randomUUID(), listId: 'inbox', title: task.title.trim(),
      description: typeof task.body === 'string' ? task.body : '',
      time: typeof task.time === 'string' ? task.time : '', done: Boolean(task.done),
      createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now(), subtasks: [],
    }));
    return tasks.length ? { lists: [{ id: 'inbox', title: 'Входящие' }], tasks } : empty();
  } catch { return empty(); }
}

export function saveState(state, storage) {
  try { (storage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
