import axios from 'axios';
import { useNavigate } from 'react-router';
import type { CartItem, LoadCart, Order } from '../../types';
import { formatMoney } from '../../utils/money';

export type PaymentSummaryData = {
  totalItems: number;
  productCostCents: number;
  shippingCostCents: number;
  totalCostBeforeTaxCents: number;
  taxCents: number;
  totalCostCents: number;
};

type PaymentSummaryProps = {
  paymentSummary: PaymentSummaryData | null;
  loadCart: LoadCart;
  cart: CartItem[];
};

export function PaymentSummary({ paymentSummary, loadCart, cart }: PaymentSummaryProps) {
  const navigate = useNavigate();

  const createOrder = async () => {
    const response = await axios.post<Order>('/api/orders');
    await loadCart();
    navigate(`/order-success/${response.data.id}`);
  };

  return (
    <div className="payment-summary">
      <div className="payment-summary-title">
        Payment Summary
      </div>

      {paymentSummary && (
        <>
          <div className="payment-summary-row">
            <div>Items ({paymentSummary.totalItems}):</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.productCostCents)}
            </div>
          </div>

          <div className="payment-summary-row">
            <div>Shipping &amp; handling:</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.shippingCostCents)}
            </div>
          </div>

          <div className="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.totalCostBeforeTaxCents)}
            </div>
          </div>

          <div className="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.taxCents)}
            </div>
          </div>

          <div className="payment-summary-row total-row">
            <div>Order total:</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.totalCostCents)}
            </div>
          </div>

          <button className="place-order-button button-primary"
            disabled={cart.length === 0}
            onClick={createOrder}>
            Place your order
          </button>
        </>
      )}
    </div>
  )
}
