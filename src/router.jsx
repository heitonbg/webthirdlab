import { createBrowserRouter } from 'react-router';
import { Layout } from './pages/Layout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ListRoute } from './pages/ListRoute.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { TaskCard } from './components/TaskCard.jsx';

export const router = createBrowserRouter([{
  path: '/', element: <Layout />, children: [
    { index: true, element: <HomePage /> },
    { path: 'lists/:listId', element: <ListRoute />, children: [{ path: 'tasks/:taskId', element: <TaskCard /> }] },
    { path: '*', element: <NotFoundPage /> },
  ],
}]);
