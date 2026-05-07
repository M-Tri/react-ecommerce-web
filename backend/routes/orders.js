import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { OrderProduct } from '../models/OrderProduct.js';

const router = express.Router();

const getProductsForOrder = async (orderId) => {
  const orderProducts = await OrderProduct.findAll({ where: { orderId } });

  return Promise.all(orderProducts.map(async (orderProduct) => {
    const product = await Product.findByPk(orderProduct.productId);

    return {
      productId: orderProduct.productId,
      quantity: orderProduct.quantity,
      estimatedDeliveryTimeMs: Number(orderProduct.estimatedDeliveryTimeMs),
      product
    };
  }));
};

router.get('/', async (req, res) => {
  try {
    const expand = req.query.expand;
    let orders = await Order.unscoped().findAll({ order: [['orderTimeMs', 'DESC']] });

    if (expand === 'products') {
      orders = await Promise.all(orders.map(async (order) => ({
        ...order.toJSON(),
        orderTimeMs: Number(order.orderTimeMs),
        products: await getProductsForOrder(order.id)
      })));
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cartItems = await CartItem.findAll();

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let productCostCents = 0;
    let shippingCostCents = 0;

    const orderProducts = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findByPk(item.productId);
      const deliveryOption = await DeliveryOption.findByPk(item.deliveryOptionId);

      if (!product || !deliveryOption) {
        throw new Error('Invalid product or delivery option in cart');
      }

      productCostCents += product.priceCents * item.quantity;
      shippingCostCents += deliveryOption.priceCents;

      return {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs: Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000
      };
    }));

    const taxCents = Math.round((productCostCents + shippingCostCents) * 0.1);
    const totalCostCents = productCostCents + shippingCostCents + taxCents;

    const order = await Order.create({
      orderTimeMs: Date.now(),
      totalCostCents,
      products: orderProducts
    });

    await OrderProduct.bulkCreate(orderProducts.map((product) => ({
      ...product,
      orderId: order.id
    })));

    await CartItem.destroy({ where: {} });

    res.status(201).json({
      ...order.toJSON(),
      orderTimeMs: Number(order.orderTimeMs),
      products: orderProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const expand = req.query.expand;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (expand === 'products') {
      return res.json({
        ...order.toJSON(),
        orderTimeMs: Number(order.orderTimeMs),
        products: await getProductsForOrder(order.id)
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
