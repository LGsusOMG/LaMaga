// src/utils/productUtils.js
export const calculateFinalPrice = (price, discount) => {
  if (discount > 0) {
    return (price * (1 - discount / 100)).toFixed(2);
  }
  return price.toFixed(2);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const hasDiscount = (discount) => {
  return discount > 0;
};