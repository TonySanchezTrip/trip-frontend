import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { redirectToCheckout } from '../utils/stripeCheckout'; // Import the utility

// Define a type for the product props to ensure type safety
interface ProductCardProps {
  id: number;
  images: string[]; // Now an array of image URLs
  name: string;
  description: string;
  price: string;
  category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, images, name, description, price, category }) => {
  const { addToCart } = useCart();
  const [currentImage, setCurrentImage] = useState(images[0]);

  const handleAddToCart = () => {
    // Pass the first image URL to the cart item for display in cart
    addToCart({ id, name, price, imageUrl: images[0], category });
  };

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImage(images[1]); // Show the second image on hover
    }
  };

  const handleMouseLeave = () => {
    setCurrentImage(images[0]); // Revert to the first image on mouse leave
  };

  const handleBuyNow = () => {
    // Prepare item for direct checkout
    const itemForCheckout = {
      name: name,
      description: description,
      price: price,
      quantity: 1, // Buy Now typically means 1 item
      imageUrl: images[0], // Use the main image
      // priceId: 'price_123', // If you have a pre-defined Stripe Price ID
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
              <button className="btn btn-primary btn-sm me-2" onClick={handleAddToCart}>Añadir al Carrito</button>
              <button className="btn btn-success btn-sm" onClick={handleBuyNow}>Comprar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
