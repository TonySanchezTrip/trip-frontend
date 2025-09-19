import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Header from './components/Header';
import HomePage from './pages/HomePage';
import NfcPage from './pages/NfcPage';
import ProductsPage from './pages/ProductsPage';
import ContactoPage from './pages/ContactoPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminProductsPage from './pages/AdminProductsPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage'; // Import OrderConfirmationPage
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/t/:tagId" element={<NfcPage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/productos/:categoryName" element={<ProductsPage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} /> {/* Add OrderConfirmationPage route */}
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel"  element={<CancelPage  />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
