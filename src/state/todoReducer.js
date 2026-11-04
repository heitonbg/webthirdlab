export function todoReducer(state, action) {
  const updateTask = (change) => ({ ...state, tasks: state.tasks.map((task) => task.id === action.id ? change(task) : task) });
  const updateSubtasks = (change) => ({ ...state, tasks: state.tasks.map((task) => task.id === action.taskId ? { ...task, subtasks: change(task.subtasks) } : task) });
  switch (action.type) {
    case 'list/added': return { ...state, lists: [...state.lists, action.list] };
    case 'list/updated': return { ...state, lists: state.lists.map((list) => list.id === action.id ? { ...list, title: action.title } : list) };
    case 'list/removed': return { ...state, lists: state.lists.filter((list) => list.id !== action.id), tasks: state.tasks.filter((task) => task.listId !== action.id) };
    case 'task/added': return { ...state, tasks: [...state.tasks, action.task] };
    case 'task/updated': return updateTask((task) => ({ ...task, ...action.changes }));
    case 'task/toggled': return updateTask((task) => ({ ...task, done: !task.done }));
    case 'task/removed': return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };
    case 'task/cleared': return { ...state, tasks: state.tasks.filter((task) => task.listId !== action.listId || !task.done) };
    case 'subtask/added': return updateSubtasks((items) => [...items, action.subtask]);
    case 'subtask/updated': return updateSubtasks((items) => items.map((item) => item.id === action.id ? { ...item, title: action.title } : item));
    case 'subtask/toggled': return updateSubtasks((items) => items.map((item) => item.id === action.id ? { ...item, done: !item.done } : item));
    case 'subtask/removed': return updateSubtasks((items) => items.filter((item) => item.id !== action.id));
    default: throw new Error(`Неизвестное действие: ${action.type}`);
  }
}
