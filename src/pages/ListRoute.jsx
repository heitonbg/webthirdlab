import { useParams } from 'react-router';
import { ListPage } from './ListPage.jsx';

export function ListRoute() {
  const { listId } = useParams();
  return <ListPage key={listId} listId={listId} />;
}
