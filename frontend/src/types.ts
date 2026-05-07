export type Product = {
  id: string;
  image: string;
  name: string;
  rating: {
    stars: number;
    count: number;
  };
  priceCents: number;
  keywords: string[];
};

export type DeliveryOption = {
  id: string;
  deliveryDays: number;
  estimatedDeliveryTimeMs: number;
  priceCents: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
  deliveryOptionId: string;
  product: Product;
};

export type OrderProduct = {
  productId: string;
  quantity: number;
  estimatedDeliveryTimeMs?: number;
  product: Product;
};

export type Order = {
  id: string;
  orderTimeMs: number;
  totalCostCents: number;
  products: OrderProduct[];
};

export type LoadCart = () => Promise<void>;
