import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Header } from '../components/Header';
import type { CartItem, Order, OrderProduct } from '../types';
import './TrackingPage.css';

type TrackingPageProps = {
  cart: CartItem[];
};

export function TrackingPage ({ cart }: TrackingPageProps) {
  const { orderId, productId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const response = await axios.get(`/api/orders/${orderId}?expand=products`);
        setOrder(response.data as Order);
      } catch (error) {
        console.error('Error fetching tracking details:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  const trackedProduct = useMemo<OrderProduct | undefined>(() => {
    return order?.products.find((product) => product.productId === productId);
  }, [order, productId]);

  const estimatedDeliveryTimeMs = trackedProduct?.estimatedDeliveryTimeMs ?? Date.now();
  const orderTimeMs = order?.orderTimeMs ?? Date.now();
  const deliveryWindowMs = Math.max(1, estimatedDeliveryTimeMs - orderTimeMs);
  const progressPercent = Math.min(
    100,
    Math.max(18, ((Date.now() - orderTimeMs) / deliveryWindowMs) * 100)
  );

  return (
    <>
      <title>Tracking</title>
      <Header cart={cart} />

    <div className="tracking-page">
      {trackedProduct ? (
        <div className="order-tracking">
        <Link className="back-to-orders-link link-primary" to="/orders">
          View all orders
        </Link>

        <div className="delivery-date">
          Arriving on {dayjs(estimatedDeliveryTimeMs).format('dddd, MMMM D')}
        </div>

        <div className="product-info">
          {trackedProduct.product.name}
        </div>

        <div className="product-info">
          Quantity: {trackedProduct.quantity}
        </div>

        <img className="product-image" src={trackedProduct.product.image} alt={trackedProduct.product.name} />

        <div className="progress-labels-container">
          <div className="progress-label">
            Preparing
          </div>
          <div className="progress-label current-status">
            Shipped
          </div>
          <div className="progress-label">
            Delivered
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
      ) : (
        <div className="empty-state">
          Tracking details are not available for this item.
        </div>
      )}
    </div>
    </>
  )
}
