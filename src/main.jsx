import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { TodoProvider } from './state/TodoContext.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import { router } from './router.jsx';
import './styles/tokens.css';
import './styles/base.css';

createRoot(document.getElementById('root')).render(<StrictMode><ThemeProvider><TodoProvider><RouterProvider router={router} /></TodoProvider></ThemeProvider></StrictMode>);
