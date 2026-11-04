import { Link } from 'react-router';
export function NotFoundPage({ title = 'Страница не найдена', to = '/', link = 'На главную' }) {
  return <section className="empty-state"><p className="eyebrow">404 / Здесь пусто</p><h1 data-page-title tabIndex={-1}>{title}</h1><p className="muted">Возможно, этот адрес устарел или запись уже удалена.</p><Link to={to} className="button-link">{link} →</Link></section>;
}
