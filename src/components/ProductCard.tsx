import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { redirectToCheckout } from '../utils/stripeCheckout';

// Define a type for the product props to ensure type safety
interface ProductCardProps {
  id: number;
  images: string[];   // array of image URLs
  name: string;
  description: string;
  price: string;      // shown as formatted string in UI
  category: string;   // we keep it as prop, but we DO NOT send it to addToCart
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  images,
  name,
  description,
  price,
  category, // not used in addToCart payload (CartItem type doesn't include it)
}) => {
  const { addToCart } = useCart();
  const firstImage = images && images.length > 0 ? images[0] : '';
  const [currentImage, setCurrentImage] = useState<string>(firstImage);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      imageUrl: images && images.length > 0 ? images[0] : ''
    });
  };

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImage(images[1]); // Show the second image on hover
    }
  };

  const handleMouseLeave = () => {
    setCurrentImage(firstImage); // Revert to the first image on mouse leave
  };

  const handleBuyNow = () => {
    // Prepare item for direct checkout (utility handles the backend call)
    const itemForCheckout = {
      name,
      description,
      price,          // if later you use dynamic pricing, convert to cents in the utility/backend
      quantity: 1,    // Buy Now usually means 1 item
      imageUrl: firstImage,
      // priceId: 'price_123', // if you switch to Stripe predefined Prices
    };
    redirectToCheckout([itemForCheckout]);
  };

  return (
    <div className="col">
      <div className="card h-100">
        <Link to={`/product/${id}`}>
          <img
            src={currentImage}
            className="card-img-top"
            alt={name}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </Link>
        <div className="card-body">
          <Link to={`/product/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h5 className="card-title">{name}</h5>
          </Link>
          <p className="card-text">{description}</p>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">{price}</span>
            <div>
              <button className="btn btn-primary btn-sm me-2" onClick={handleAddToCart}>
                Añadir al Carrito
              </button>
              <button className="btn btn-success btn-sm" onClick={handleBuyNow}>
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
