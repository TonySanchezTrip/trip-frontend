import React from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';

const ProductsPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();

  // A more descriptive title based on the category
  const title = categoryName
    ? `Mostrando: ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ')}`
    : 'Todos Nuestros Productos';

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{title}</h2>
      {/* For now, we render the same grid. Later, we can pass the category to filter. */}
      <ProductGrid category={categoryName} />
    </div>
  );
};

export default ProductsPage;
