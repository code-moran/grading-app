// Tax configuration
export const TAX_RATE = 0.10; // 10% tax rate - adjust as needed

/**
 * Calculate price inclusive of tax from base price
 * @param basePrice - The base price (before tax)
 * @returns The price inclusive of tax
 */
export function calculatePriceWithTax(basePrice: number): number {
  return basePrice * (1 + TAX_RATE);
}

/**
 * Calculate base price from price inclusive of tax
 * @param priceWithTax - The price inclusive of tax
 * @returns The base price (before tax)
 */
export function calculateBasePrice(priceWithTax: number): number {
  return priceWithTax / (1 + TAX_RATE);
}

/**
 * Get tax amount from base price
 * @param basePrice - The base price (before tax)
 * @returns The tax amount
 */
export function getTaxAmount(basePrice: number): number {
  return basePrice * TAX_RATE;
}

