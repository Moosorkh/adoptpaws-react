import { CartItem } from '../types';

/**
 * Calculate the total price of all items in the cart
 */
export const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Scroll to a section by ID with smooth behavior
 */
export const scrollToSection = (id: string): void => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Scroll to the top of the page with smooth behavior
 */
export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};