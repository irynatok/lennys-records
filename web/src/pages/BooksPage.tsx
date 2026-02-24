import CatalogPage from './CatalogPage';
import { aggregateBooks } from '../data/canvasUtils';

export default function BooksPage() {
  return <CatalogPage title="Books" aggregatorFn={aggregateBooks} />;
}
