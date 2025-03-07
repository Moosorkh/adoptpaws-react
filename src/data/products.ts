import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'The Three Musketeers',
    price: 50.00,
    description: "Playful and energetic trio of puppies looking for a loving home. They're well-socialized and get along great with children and other pets.",
    imageUrl: 'https://cdn.pixabay.com/photo/2018/09/23/11/04/dog-3697190_1280.jpg',
    category: 'dogs'
  },
  {
    id: '2',
    name: 'PeaceMaker',
    price: 100.00,
    description: 'PeaceMaker is a gentle soul who brings calm wherever she goes. This sweet dog is house-trained and knows basic commands. Great with families!',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'dogs'
  },
  {
    id: '3',
    name: 'Smiley',
    price: 150.00,
    description: 'Smiley is always happy and ready for adventure! This energetic dog needs an active family who can provide plenty of exercise and outdoor activities.',
    imageUrl: 'https://cdn.pixabay.com/photo/2023/02/05/19/54/dog-7770426_1280.jpg',
    category: 'dogs'
  },
  {
    id: '4',
    name: 'Whiskers',
    price: 75.00,
    description: "Whiskers is a beautiful tabby cat with stunning green eyes. She's calm, independent, and loves to curl up in sunny spots for afternoon naps.",
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    category: 'cats'
  },
  {
    id: '5',
    name: 'Shadow',
    price: 85.00,
    description: "Shadow is a sleek black cat with a playful personality. He's curious and loves interactive toys. Would do well in a home with older children.",
    imageUrl: 'https://images.unsplash.com/photo-1570018144715-43110363d70a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80',
    category: 'cats'
  },
  {
    id: '6',
    name: 'Lucky',
    price: 120.00,
    description: "Lucky is a special dog who was born with only three legs, but it doesn't slow him down one bit! He's full of life and loves everyone he meets.",
    imageUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    category: 'special-needs'
  }
] as Product[];