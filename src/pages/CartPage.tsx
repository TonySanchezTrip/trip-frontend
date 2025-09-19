import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom'; // Import Link

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  const handleQuantityChange = (productId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value);
    if (!isNaN(newQuantity)) {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Tu Carrito de Compras</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          {cartItems.length === 0 ? (
            <p className="text-center">Tu carrito está vacío.</p>
          ) : (
            <ul className="list-group mb-3">
              {cartItems.map(item => (
                <li 
                  key={`${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}-${item.selectedNfcOption ? 'nfc' : ''}`}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', marginRight: '15px', objectFit: 'cover' }} className="rounded" />
                    <div>
                      <h6 className="my-0">{item.name}</h6>
                      {item.selectedSize && <small className="text-muted d-block">Talla: {item.selectedSize}</small>}
                      {item.selectedColor && <small className="text-muted d-block">Color: {item.selectedColor}</small>}
                      {item.selectedNfcOption && <small className="text-muted d-block">Con NFC</small>}
                      <div className="input-group input-group-sm" style={{ width: '120px' }}>
                        <span className="input-group-text">Cant.</span>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-muted">{item.price}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between align-items-center active">
                <strong>Total</strong>
                <strong>${getCartTotal().toFixed(2)}</strong>
              </li>
            </ul>
          )}
          <div className="d-grid gap-2">
            <Link to="/checkout" className="btn btn-success" disabled={cartItems.length === 0}>Proceder al Pago</Link>
            <button className="btn btn-outline-danger" onClick={clearCart} disabled={cartItems.length === 0}>Vaciar Carrito</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;