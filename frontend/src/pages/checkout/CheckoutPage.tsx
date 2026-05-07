import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { CartItem, DeliveryOption, LoadCart } from '../../types';
import './CheckoutPage.css';
import './CheckoutPageHeader.css';
import { OrderSummary } from './OrderSummary';
import { PaymentSummary, type PaymentSummaryData } from './PaymentSummary';

type CheckoutPageProps = {
  cart: CartItem[];
  loadCart: LoadCart;
};

export function CheckoutPage({ cart, loadCart }: CheckoutPageProps) {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryData | null>(null);
  const totalQuantity = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deliveryResponse = await axios.get('/api/delivery-options?expand=estimatedDeliveryTime');
        setDeliveryOptions(deliveryResponse.data as DeliveryOption[]);

        const paymentResponse = await axios.get('/api/payment-summary');
        setPaymentSummary(paymentResponse.data as PaymentSummaryData);
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      }
    };

    fetchData();
  }, [cart]);

  return (
    <>
      <title>Checkout</title>
      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <Link to="/" className="checkout-brand">SuperSimpleMarket</Link>
          </div>

          <div className="checkout-header-middle-section">
            Checkout (<Link className="return-to-home-link"
              to="/">{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</Link>)
          </div>

          <div className="checkout-header-right-section">
            <img src="images/icons/checkout-lock-icon.png" />
          </div>
        </div>
      </div>

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary cart={cart} deliveryOptions={deliveryOptions} loadCart={loadCart} />

          <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} cart={cart}/>
        </div>
      </div>
    </>
  )
}
