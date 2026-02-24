import CatalogPage from './CatalogPage';
import { aggregateMovies } from '../data/canvasUtils';

export default function MoviesPage() {
  return <CatalogPage title="Movies & TV" aggregatorFn={aggregateMovies} />;
}
