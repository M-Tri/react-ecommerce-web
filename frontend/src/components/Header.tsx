import { Link } from 'react-router';
import './Header.css';
import type { CartItem } from '../types';

type HeaderProps = {
  cart: CartItem[];
  searchText?: string;
  onSearchChange?: (value: string) => void;
}

export function Header({ cart, searchText = '', onSearchChange }: HeaderProps) {
  const totalQuantity = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  return (
    <>
      <title>Header</title>
      <div className="header">
        <div className="left-section">
          <Link to="/" className="header-link">
            <span className="brand-logo">SuperSimpleMarket</span>
            <span className="brand-logo mobile-brand-logo">ML</span>
          </Link>
        </div>

        <div className="middle-section">
          {onSearchChange && (
            <>
              <input
                className="search-bar"
                type="text"
                placeholder="Search products"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
              />

              <button className="search-button" aria-label="Search products">
                <img className="search-icon" src="images/icons/search-icon.png" alt="" />
              </button>
            </>
          )}
        </div>

        <div className="right-section">
          <Link className="orders-link header-link" to="/orders">

            <span className="orders-text">Orders</span>
          </Link>

          <Link className="cart-link header-link" to="/checkout">
            <img className="cart-icon" src="images/icons/cart-icon.png" />
            <div className="cart-quantity">{totalQuantity}</div>
            <div className="cart-text">Cart</div>
          </Link>
        </div>
      </div>
    </>
  )
}
