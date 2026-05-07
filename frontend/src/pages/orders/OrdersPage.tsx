import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router';
import { Header } from '../../components/Header';
import './OrdersPage.css';
import { formatMoney } from '../../utils/money';
import type { CartItem, LoadCart, Order } from '../../types';

type OrdersPageProps = {
  cart: CartItem[];
  loadCart: LoadCart;
};

export function OrdersPage({ cart, loadCart }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders?expand=products');
        setOrders(response.data as Order[]);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const buyAgain = async (productId: string) => {
    await axios.post('/api/cart-items', {
      productId,
      quantity: 1
    });
    await loadCart();
  };

  return (
    <>
      <title>Orders</title>

      <Header cart={cart} />

      <div className="orders-page">
        <div className="page-title">Your Orders</div>

        {orders.length === 0 ? (
          <div className="empty-state">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => {
            return (
              <div key={order.id}
                className="order-container">

                <div className="order-header">
                  <div className="order-header-left-section">
                    <div className="order-date">
                      <div className="order-header-label">Order Placed:</div>
                      <div>{dayjs(order.orderTimeMs).format('MMMM D')} </div>
                    </div>
                    <div className="order-total">
                      <div className="order-header-label">Total:</div>
                      <div>{formatMoney(order.totalCostCents)}</div>
                    </div>
                  </div>

                  <div className="order-header-right-section">
                    <div className="order-header-label">Order ID:</div>
                    <div>{order.id}</div>
                  </div>
                </div>

                <div className="order-details-grid">
                  {order.products.map((orderProduct) => {
                    return (
                      <Fragment key={orderProduct.product.id}>
                        <div className="product-image-container">
                          <img src={orderProduct.product.image} alt={orderProduct.product.name} />
                        </div>

                        <div className="product-details">
                          <div className="product-name">
                            {orderProduct.product.name}
                          </div>
                          <div className="product-delivery-date">
                            Arriving on: {dayjs(orderProduct.estimatedDeliveryTimeMs).format('MMMM D')}
                          </div>
                          <div className="product-quantity">
                            Quantity: {orderProduct.quantity}
                          </div>
                          <button
                            className="buy-again-button button-primary"
                            onClick={() => buyAgain(orderProduct.productId)}
                          >
                            <img className="buy-again-icon" src="images/icons/buy-again.png" alt="Buy again icon" />
                            <span className="buy-again-message">Add to Cart</span>
                          </button>
                        </div>

                        <div className="product-actions">
                          <Link to={`/tracking/${order.id}/${orderProduct.productId}`}>
                            <button className="track-package-button button-secondary">
                              Track package
                            </button>
                          </Link>
                        </div>
                      </Fragment>
                    );
                  })}

                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </>
  );
}
