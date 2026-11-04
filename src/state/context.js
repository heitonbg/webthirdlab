import { createContext, useContext } from 'react';
export const TodoContext = createContext(null);
export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos должен вызываться внутри TodoProvider');
  return context;
}
