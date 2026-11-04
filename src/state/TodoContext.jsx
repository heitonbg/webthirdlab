import { useEffect, useMemo, useReducer, useState } from 'react';
import { TodoContext } from './context.js';
import { todoReducer } from './todoReducer.js';
import { loadState, saveState } from './storage.js';

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, () => loadState());
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    // Ошибка браузерного API — внешний результат синхронизации.
    const saved = saveState(state);
    if (!saved) queueMicrotask(() => setStorageFailed(true));
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <TodoContext value={value}>{storageFailed && <p className="storage-warning" role="alert">Хранилище недоступно. Изменения сохранятся только до закрытия страницы.</p>}{children}</TodoContext>;
}
