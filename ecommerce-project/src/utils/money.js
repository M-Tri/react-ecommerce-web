export function formatMoney(amountCents) {
  return `$${(amountCents.priceCents / 100).toFixed(2)}`;
}


