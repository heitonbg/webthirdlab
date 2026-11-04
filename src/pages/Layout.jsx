import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar.jsx';
import { useTheme } from '../theme/context.js';

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = (location.state?.focusId && document.getElementById(location.state.focusId)) || document.querySelector('[data-page-title]');
      target?.focus();
      document.title = `${document.querySelector('[data-page-title]')?.textContent || 'Список дел'} — менеджер задач`;
    });
    return () => cancelAnimationFrame(frame);
  }, [location]);
  return <div className="app-shell">
    <a className="skip-link" href="#main">К содержимому</a>
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">✓</span><span>Список дел<span className="brand-caption">МЕНЕДЖЕР ЗАДАЧ</span></span></Link>
      <div className="topbar-actions"><button className="menu-toggle" aria-controls="sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? 'Закрыть меню' : 'Списки'}</button><button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}><span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span><span>{theme === 'dark' ? 'Светлая' : 'Тёмная'}</span></button></div>
    </header>
    <div className="app-body"><aside id="sidebar" className={`sidebar ${menuOpen ? 'is-open' : ''}`} onKeyDown={(e) => { if (e.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle')?.focus(); } }}><Sidebar onNavigate={() => setMenuOpen(false)} /></aside>
      <main id="main" className="main"><Outlet /></main>
    </div>
    <footer className="footer"><span>Меньше шума. Больше сделанного.</span><span>REACT / ЛАБОРАТОРНАЯ №03</span></footer>
  </div>;
}
