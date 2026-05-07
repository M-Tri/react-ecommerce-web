import axios from 'axios';
import { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import type { CartItem, LoadCart, Product } from '../../types';
import './HomePage.css';
import { ProductsGrid } from './ProductsGrid';

type HomePageProps = {
  cart: CartItem[];
  loadCart: LoadCart;
};

export function HomePage({ cart, loadCart }: HomePageProps) {

  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const normalizedSearch = searchText.trim().toLowerCase();
  const visibleProducts = normalizedSearch
    ? products.filter((product) => {
        const searchableText = [
          product.name,
          ...product.keywords,
        ].join(' ').toLowerCase();
        return searchableText.includes(normalizedSearch);
      })
    : products;

  return (
    <>
      <title>SuperSimpleMarket</title>

      <Header
        cart={cart}
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      <div className="home-page">
        <section className="home-hero">
          <div>
            <p className="hero-kicker">Find it faster</p>
            <h1>Find what you are looking for.</h1>
            <p className="hero-copy">
              Shop home goods, apparel, kitchen favorites, and practical gifts with a clean cart-to-order flow.
            </p>
          </div>
          <div className="hero-image-strip" aria-hidden="true">
            <img src="images/products/black-and-silver-espresso-maker.jpg" alt="" />
            <img src="images/products/luxury-towel-set.jpg" alt="" />
            <img src="images/products/3-piece-cooking-set.jpg" alt="" />
          </div>
        </section>

        {visibleProducts.length > 0 ? (
          <ProductsGrid products={visibleProducts} loadCart={loadCart} />
        ) : (
          <div className="empty-state">
            No products match "{searchText}".
          </div>
        )}
      </div>
    </>
  );
}
