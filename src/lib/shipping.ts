export const SHIPPING_CURRENCY = 'MAD' as const;
export const SHIPPING_DESTINATION_COUNTRY_CODE = 'MA' as const;
export const STANDARD_SHIPPING_RATE_MAD = 35;
export const FREE_SHIPPING_THRESHOLD_MAD = 500;

export function getShippingRateForSubtotal(subtotal: number): number {
    return subtotal >= FREE_SHIPPING_THRESHOLD_MAD ? 0 : STANDARD_SHIPPING_RATE_MAD;
}

export function getCheckoutTotal(subtotal: number): number {
    return subtotal + getShippingRateForSubtotal(subtotal);
}

export function getAmountUntilFreeShipping(subtotal: number): number {
    return Math.max(FREE_SHIPPING_THRESHOLD_MAD - subtotal, 0);
}