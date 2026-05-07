import { Link, useParams } from 'react-router';
import { Header } from '../components/Header';
import type { CartItem } from '../types';
import './OrderSuccessPage.css';

type OrderSuccessPageProps = {
  cart: CartItem[];
};

export function OrderSuccessPage({ cart }: OrderSuccessPageProps) {
  const { orderId } = useParams();

  return (
    <>
      <title>Order confirmed</title>
      <Header cart={cart} />

      <main className="order-success-page">
        <section className="order-success-panel">
          <div className="success-mark">✓</div>
          <p className="success-kicker">Order placed</p>
          <h1>Thanks for shopping with SuperSimpleMarket.</h1>
          <p className="success-copy">
            Your order is confirmed and ready to track from the orders page.
          </p>
          {orderId && <p className="success-order-id">Order ID: {orderId}</p>}
          <div className="success-actions">
            <Link className="button-primary success-button" to="/orders">View orders</Link>
            <Link className="button-secondary success-button" to="/">Keep shopping</Link>
          </div>
        </section>
      </main>
    </>
  );
}
