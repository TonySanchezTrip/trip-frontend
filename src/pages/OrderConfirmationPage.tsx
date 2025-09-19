import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Extract orderId from query params or state if passed
    const params = new URLSearchParams(location.search);
    const id = params.get('orderId');
    if (id) {
      setOrderId(id);
    }
  }, [location]);

  return (
    <div className="container mt-5 text-center">
      <div className="card p-4 shadow-sm">
        <h2 className="card-title text-success mb-3">¡Pedido Realizado con Éxito!</h2>
        <p className="card-text lead">Gracias por tu compra.</p>
        {orderId && <p className="card-text">Tu número de pedido es: <strong>{orderId}</strong></p>}
        <p className="card-text">Recibirás un correo electrónico de confirmación con los detalles de tu pedido.</p>
        <hr className="my-4" />
        <Link to="/productos" className="btn btn-primary">Continuar Comprando</Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
