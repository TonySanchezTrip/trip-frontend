const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://stripe-backend-vercel.vercel.app";

const btn = document.getElementById("payBtn");
const msg = document.getElementById("msg");

btn.addEventListener("click", async () => {
  try {
    btn.disabled = true;
    msg.textContent = "Creando sesión de pago...";
    const res = await fetch(`${BACKEND}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.url) throw new Error("Respuesta sin URL de Checkout");
    window.location.href = data.url; // redirige al Checkout de Stripe
  } catch (err) {
    msg.textContent = "Error: " + err.message;
    btn.disabled = false;
  }
});