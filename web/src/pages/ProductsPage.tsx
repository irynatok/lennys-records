import CatalogPage from './CatalogPage';
import { aggregateProducts } from '../data/canvasUtils';

export default function ProductsPage() {
  return <CatalogPage title="Products" aggregatorFn={aggregateProducts} />;
}
