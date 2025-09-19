import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// Define a type for the product data structure
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[]; // Changed from imageUrl to images array
  details: string; // Added for consistency with backend data
  variations: { // Added for consistency with backend data
    sizes: string[];
    colors: string[];
    hasNfcOption: boolean;
  };
}

interface ProductGridProps {
  category?: string; // Category is optional
}

const ProductGrid: React.FC<ProductGridProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch products from the backend
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct the URL with an optional category query parameter
        const baseUrl = 'http://localhost:3001/api/products';
        const url = category ? `${baseUrl}?category=${category}` : baseUrl;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue correcta');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]); // Re-run the effect if the category prop changes

  if (loading) {
    return <p className="text-center">Cargando productos...</p>;
  }

  if (error) {
    return <p className="text-center text-danger">Error: {error}</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {products.length > 0 ? (
        products.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            images={product.images} // Pass images array
            category={product.category}
          />
        ))
      ) : (
        <div className="col">
          <p>No se encontraron productos en esta categoría.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;