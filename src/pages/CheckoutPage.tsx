import { BACKEND } from '../config';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal } = useCart(); // clearCart se usa en SuccessPage
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío. Por favor, añade productos antes de proceder.');
      navigate('/productos');
      return;
    }

    // (Opcional, para futuro) Si luego quieres cobrar dinámico, arma items y mándalos:
    // const itemsForStripe = cartItems.map(item => ({
    //   name: item.name,
    //   unit_amount: Math.round(parseFloat(String(item.price).replace(/[^\d.]/g, '')) * 100), // centavos
    //   quantity: item.quantity,
    // }));

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Hoy tu backend ignora el body; dejamos la estructura lista para futuro:
        body: JSON.stringify({}) // o JSON.stringify({ items: itemsForStripe })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { url } = await res.json();
      if (!url) throw new Error("Backend no devolvió 'url'");

      // Redirige a Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Error al iniciar el proceso de pago:', error);
      alert(`Error al iniciar el proceso de pago: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h2>Tu carrito está vacío.</h2>
        <p>Por favor, añade productos antes de proceder al pago.</p>
        <button className="btn btn-primary" onClick={() => navigate('/productos')}>Ir a Productos</button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Finalizar Compra</h2>
      <div className="row">
        {/* Shipping Information Form */}
        <div className="col-md-7 order-md-1">
          <h4 className="mb-3">Información de Envío</h4>
          <form onSubmit={handlePlaceOrder}>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="fullName" className="form-label">Nombre Completo</label>
                <input type="text" className="form-control" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="col-12">
                <label htmlFor="address" className="form-label">Dirección</label>
                <input type="text" className="form-control" id="address" name="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="city" className="form-label">Ciudad</label>
                <input type="text" className="form-control" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="zipCode" className="form-label">Código Postal</label>
                <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
              </div>
              <div className="col-12">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="col-12">
                <label htmlFor="phone" className="form-label">Teléfono</label>
                <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>
            <hr className="my-4" />
            <button className="w-100 btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? 'Creando sesión...' : 'Proceder al Pago con Stripe'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="col-md-5 order-md-2 mb-4">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">Tu Carrito</span>
            <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
          </h4>
          <ul className="list-group mb-3">
            {cartItems.map(item => (
              <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                <div>
                  <h6 className="my-0">{item.name}</h6>
                  <small className="text-muted">
                    {item.selectedSize && `Talla: ${item.selectedSize}`}
                    {item.selectedColor && `, Color: ${item.selectedColor}`}
                    {item.selectedNfcOption && `, Con NFC`}
                    {` (x${item.quantity})`}
                  </small>
                </div>
                <span className="text-muted">{item.price}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between">
              <span>Total (MXN)</span>
              <strong>${getCartTotal().toFixed(2)}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;