import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';

function App() {
  return <main className="workspace"><p className="eyebrow">Лабораторная работа №3</p><h1>Список дел</h1><p>Каркас React-приложения готов.</p></main>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
