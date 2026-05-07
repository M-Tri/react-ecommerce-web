import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import productRoutes from './routes/products.js';
import deliveryOptionRoutes from './routes/deliveryOptions.js';
import cartItemRoutes from './routes/cartItems.js';
import orderRoutes from './routes/orders.js';
import resetRoutes from './routes/reset.js';
import paymentSummaryRoutes from './routes/paymentSummary.js';
import { Product } from './models/Product.js';
import { DeliveryOption } from './models/DeliveryOption.js';
import { CartItem } from './models/CartItem.js';
import { Order } from './models/Order.js';
import { OrderProduct } from './models/OrderProduct.js';
import { defaultProducts } from './defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from './defaultData/defaultDeliveryOptions.js';
import { defaultCart } from './defaultData/defaultCart.js';
import { defaultOrders } from './defaultData/defaultOrders.js';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/delivery-options', deliveryOptionRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/payment-summary', paymentSummaryRoutes);

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Error handling middleware
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
/* eslint-enable no-unused-vars */

CartItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

CartItem.belongsTo(DeliveryOption, { foreignKey: 'deliveryOptionId' });
DeliveryOption.hasMany(CartItem, { foreignKey: 'deliveryOptionId' });

Order.hasMany(OrderProduct, { foreignKey: 'orderId' });
OrderProduct.belongsTo(Order, { foreignKey: 'orderId' });

OrderProduct.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderProduct, { foreignKey: 'productId' });

Order.belongsToMany(Product, { through: OrderProduct, foreignKey: 'orderId' });
Product.belongsToMany(Order, { through: OrderProduct, foreignKey: 'productId' });

// Sync database and load default data if none exist
await sequelize.sync();

const productCount = await Product.count();
if (productCount === 0) {
  const timestamp = Date.now();

  const productsWithTimestamps = defaultProducts.map((product, index) => ({
    ...product,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const deliveryOptionsWithTimestamps = defaultDeliveryOptions.map((option, index) => ({
    ...option,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const cartItemsWithTimestamps = defaultCart.map((item, index) => ({
    ...item,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const ordersWithTimestamps = defaultOrders.map((order, index) => ({
    id: order.id,
    orderTimeMs: order.orderTimeMs,
    totalCostCents: order.totalCostCents,
    products: order.products,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));
  const orderProductsWithTimestamps = defaultOrders.flatMap((order, orderIndex) => (
    order.products.map((product, productIndex) => ({
      ...product,
      orderId: order.id,
      createdAt: new Date(timestamp + orderIndex + productIndex),
      updatedAt: new Date(timestamp + orderIndex + productIndex)
    }))
  ));

  await Product.bulkCreate(productsWithTimestamps);
  await DeliveryOption.bulkCreate(deliveryOptionsWithTimestamps);
  await CartItem.bulkCreate(cartItemsWithTimestamps);
  await Order.bulkCreate(ordersWithTimestamps);
  await OrderProduct.bulkCreate(orderProductsWithTimestamps);

  console.log('Default data added to the database.');
}

const orderProductCount = await OrderProduct.count();
if (orderProductCount === 0) {
  const orderIds = new Set((await Order.findAll()).map((order) => order.id));
  const timestamp = Date.now();
  const orderProductsWithTimestamps = defaultOrders.flatMap((order, orderIndex) => {
    if (!orderIds.has(order.id)) {
      return [];
    }

    return order.products.map((product, productIndex) => ({
      ...product,
      orderId: order.id,
      createdAt: new Date(timestamp + orderIndex + productIndex),
      updatedAt: new Date(timestamp + orderIndex + productIndex)
    }));
  });

  if (orderProductsWithTimestamps.length > 0) {
    await OrderProduct.bulkCreate(orderProductsWithTimestamps);
    console.log('Default order products added to the database.');
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
