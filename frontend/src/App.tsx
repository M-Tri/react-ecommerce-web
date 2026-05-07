import axios from 'axios';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import './App.css';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { HomePage } from './pages/home/HomePage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { TrackingPage } from './pages/TrackingPage';
import type { CartItem } from './types';


function App() {

  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCart = async () => {
    try {
      const response = await axios.get('/api/cart-items?expand=product');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);


  return (
    <Routes>
      <Route path="/" element={<HomePage cart={cart} loadCart={loadCart} />} />
      <Route path="checkout" element={<CheckoutPage cart={cart} loadCart={loadCart}/>} />
      <Route path="order-success/:orderId" element={<OrderSuccessPage cart={cart} />} />
      <Route path="orders" element={<OrdersPage cart={cart} loadCart={loadCart} />} />
      <Route path="tracking/:orderId/:productId" element={<TrackingPage cart={cart} />} />
    </Routes>
  )
}

export default App
