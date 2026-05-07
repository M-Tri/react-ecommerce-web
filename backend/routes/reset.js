import express from 'express';
import { sequelize } from '../models/index.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { Order } from '../models/Order.js';
import { OrderProduct } from '../models/OrderProduct.js';
import { defaultProducts } from '../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../defaultData/defaultDeliveryOptions.js';
import { defaultCart } from '../defaultData/defaultCart.js';
import { defaultOrders } from '../defaultData/defaultOrders.js';

const router = express.Router();

const requireResetAccess = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(500).json({ error: 'ADMIN_SECRET is not configured' });
  }

  if (req.headers['x-admin-secret'] !== adminSecret) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  next();
};

router.post('/', requireResetAccess, async (req, res) => {
  await sequelize.sync({ force: true });

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

  res.status(204).send();
});

export default router;
