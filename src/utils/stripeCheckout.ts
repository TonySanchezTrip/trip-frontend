interface StripeCheckoutItem {
  priceId?: string; // For pre-defined Stripe Prices
  name?: string;
  description?: string;
  price: string; // e.g., "$25.00"
  quantity: number;
  imageUrl?: string;
}

export const redirectToCheckout = async (items: StripeCheckoutItem[]) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la sesión de pago.');
    }

    const session = await response.json();
    // Redirect to Stripe Checkout page
    window.location.href = session.url;

  } catch (error: any) {
    console.error('Error al redirigir a Stripe Checkout:', error);
    alert(`Error al iniciar el proceso de pago: ${error.message}`);
  }
};
