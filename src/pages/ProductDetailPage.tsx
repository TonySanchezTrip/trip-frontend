import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[]; // Now an array of image URLs
  details: string;
  variations: { // New variations object
    sizes: string[];
    colors: string[];
    hasNfcOption: boolean;
  };
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for image gallery
  const [mainImage, setMainImage] = useState<string>('');

  // States for selected variations
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedNfcOption, setSelectedNfcOption] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Producto no encontrado o error en el servidor.');
        }
        const data: Product = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]); // Set first image as main
        }
        // Set default selected variations
        if (data.variations) {
          if (data.variations.sizes && data.variations.sizes.length > 0) {
            setSelectedSize(data.variations.sizes[0]);
          }
          if (data.variations.colors && data.variations.colors.length > 0) {
            setSelectedColor(data.variations.colors[0]);
          }
          setSelectedNfcOption(data.variations.hasNfcOption && false); // Default to false even if option exists
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      // Add selected variations to the product object before adding to cart
      const productToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0] ?? '',
        selectedSize,
        selectedColor,
        selectedNfcOption: !!selectedNfcOption
      };
      addToCart(productToAdd);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Cargando detalles del producto...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-5">Error: {error}</p>;
  }

  if (!product) {
    return <p className="text-center mt-5">Producto no encontrado.</p>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Image Gallery */}
        <div className="col-md-6">
          <img src={`http://localhost:3001${mainImage}`} className="img-fluid rounded mb-3" alt={product.name} />
          <div className="d-flex justify-content-center">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:3001${image}`}
                alt={`Thumbnail ${index + 1}`}
                className={`img-thumbnail me-2 ${mainImage === image ? 'border border-primary' : ''}`}
                style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>
        </div>

        {/* Product Details and Variations */}
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">Categoría: {product.category}</p>
          <h3 className="text-primary">{product.price}</h3>
          <p>{product.details}</p>
          <p>{product.description}</p>

          {/* Variation Selection */}
          {product.variations && (
            <div className="mb-3">
              {product.variations.sizes && product.variations.sizes.length > 0 && (
                <div className="mb-3">
                  <label htmlFor="sizeSelect" className="form-label">Talla:</label>
                  <select id="sizeSelect" className="form-select" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                    {product.variations.sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {product.variations.colors && product.variations.colors.length > 0 && (
                <div className="mb-3">
                  <label htmlFor="colorSelect" className="form-label">Color:</label>
                  <select id="colorSelect" className="form-select" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                    {product.variations.colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {product.variations.hasNfcOption && (
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="nfcOptionCheck" checked={selectedNfcOption} onChange={(e) => setSelectedNfcOption(e.target.checked)} />
                  <label className="form-check-label" htmlFor="nfcOptionCheck">
                    Incluir Tecnología NFC
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="d-grid gap-2">
            <button className="btn btn-success btn-lg" onClick={handleAddToCart}>Añadir al Carrito</button>
            <Link to="/productos" className="btn btn-outline-secondary btn-lg">Volver a Productos</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;