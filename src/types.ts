export interface Product {
    category: string;
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    // Returned by the pets API; surfaced as hover tags on the card.
    breed?: string;
    age?: string;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }