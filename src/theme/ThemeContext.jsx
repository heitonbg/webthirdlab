import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { ThemeContext } from './context.js';

export function ThemeProvider({ children }) {
  const [saved, setTheme] = useLocalStorage('todo-app:theme', document.documentElement.dataset.theme);
  const theme = saved === 'dark' || saved === 'light' ? saved : document.documentElement.dataset.theme;
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return <ThemeContext value={{ theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext>;
}
