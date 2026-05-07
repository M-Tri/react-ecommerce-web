import express from 'express';
import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const expand = req.query.expand;
    let cartItems = await CartItem.findAll();

    if (expand === 'product') {
      cartItems = await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        return {
          ...item.toJSON(),
          product
        };
      }));
    }

    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;
  const deliveryOptionId = req.body.deliveryOptionId ?? req.body.deliveryOption ?? '1';

  if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Invalid productId or quantity' });
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
  if (!deliveryOption) {
    return res.status(400).json({ error: 'Invalid delivery option' });
  }

  let cartItem = await CartItem.findOne({ where: { productId } });
  if (cartItem) {
    cartItem.quantity = Math.min(cartItem.quantity + quantity, 10);
    cartItem.deliveryOptionId = deliveryOptionId;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({ productId, quantity, deliveryOptionId });
  }

  res.status(201).json(cartItem);
});

router.put('/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity, deliveryOptionId } = req.body;

  if (quantity === undefined && deliveryOptionId === undefined) {
    return res.status(400).json({ error: 'At least one field must be provided' });
  }

  const cartItem = await CartItem.findOne({ where: { productId } });
  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  if (quantity !== undefined) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }
    cartItem.quantity = quantity;
  }

  if (deliveryOptionId !== undefined) {
    const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
    if (!deliveryOption) {
      return res.status(400).json({ error: 'Invalid delivery option' });
    }
    cartItem.deliveryOptionId = deliveryOptionId;
  }

  await cartItem.save();
  res.json(cartItem);
});

router.get('/:productId', async (req, res) => {
  const { productId } = req.params;

  const cartItem = await CartItem.findOne({ where: { productId } });
  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json(cartItem);
});

router.delete('/:productId', async (req, res) => {
  const { productId } = req.params;

  const cartItem = await CartItem.findOne({ where: { productId } });
  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  await cartItem.destroy();
  res.status(204).send();
});

export default router;
