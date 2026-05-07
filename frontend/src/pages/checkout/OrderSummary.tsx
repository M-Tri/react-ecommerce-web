import axios from 'axios';
import dayjs from 'dayjs';
import type { CartItem, DeliveryOption, LoadCart } from '../../types';
import { formatMoney } from '../../utils/money';
import { DeliveryOptions } from './DeliveryOptions';

type OrderSummaryProps = {
  deliveryOptions: DeliveryOption[];
  cart: CartItem[];
  loadCart: LoadCart;
};

export function OrderSummary({ deliveryOptions, cart, loadCart }: OrderSummaryProps) {
  if (cart.length === 0) {
    return (
      <div className="empty-state checkout-empty-state">
        Your cart is empty. Add a few products before checkout.
      </div>
    );
  }

  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 && cart.map((cartItem) => {
        const selectedDeliveryOption = deliveryOptions.find((deliveryOption) => {
          return deliveryOption.id === cartItem.deliveryOptionId;
        }) ?? deliveryOptions[0];

        if (!selectedDeliveryOption) {
          return null;
        }

        const deleteCartItem = async () => {
          await axios.delete(`/api/cart-items/${cartItem.productId}`);
          await loadCart();
        };

        const updateQuantity = async (quantity: number) => {
          await axios.put(`/api/cart-items/${cartItem.productId}`, {
            quantity
          });
          await loadCart();
        };

        return (
          <div key={cartItem.productId}
            className="cart-item-container">
            <div className="delivery-date">
              Delivery date: {dayjs(selectedDeliveryOption.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
            </div>

            <div className="cart-item-details-grid">
              <img className="product-image"
                src={cartItem.product.image} />

              <div className="cart-item-details">
                <div className="product-name">
                  {cartItem.product.name}
                </div>
                <div className="product-price">
                  {formatMoney(cartItem.product.priceCents)}
                </div>
                <div className="product-quantity">
                  <span>
                    Quantity: <span className="quantity-label">{cartItem.quantity}</span>
                  </span>
                  <select
                    className="quantity-update-select"
                    aria-label={`Update quantity for ${cartItem.product.name}`}
                    value={cartItem.quantity}
                    onChange={(event) => updateQuantity(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((quantity) => (
                      <option key={quantity} value={quantity}>{quantity}</option>
                    ))}
                  </select>
                  <span className="delete-quantity-link link-primary"
                    onClick={deleteCartItem}>
                    Delete
                  </span>
                </div>
              </div>
              <DeliveryOptions deliveryOptions={deliveryOptions} cartItem={cartItem} loadCart={loadCart}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}
