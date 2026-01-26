import { Product, ProductCategory } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Manix Skyn Original (10 Pack)',
    description: 'The closest thing to wearing nothing. Revolutionary non-latex material (Polyisoprene) that feels soft and natural. Ideal for those with latex allergies.',
    price: 110,
    category: ProductCategory.CONDOM,
    imageUrl: 'https://m.media-amazon.com/images/I/71u-fD1CqSL._AC_SL1500_.jpg',
    stock: 50,
    features: ['Non-Latex', 'Ultra Soft', 'Natural Feel']
  },
  {
    id: '2',
    name: 'Durex Invisible Extra Thin (10 Pack)',
    description: 'The thinnest condom ever developed by Durex, designed to maximize sensitivity while providing a high level of security and protection.',
    price: 95,
    category: ProductCategory.CONDOM,
    imageUrl: 'https://m.media-amazon.com/images/I/61S+0+s-mXL._AC_SL1000_.jpg',
    stock: 120,
    features: ['Extra Thin', 'Maximum Sensitivity', 'Straight Walled']
  },
  {
    id: '3',
    name: 'Manix Endurance Delay Gel (50ml)',
    description: 'A high-performance delaying gel aimed at prolonging pleasure. Its formula helps retard ejaculation for longer-lasting intimacy.',
    price: 180,
    category: ProductCategory.DELAY,
    imageUrl: 'https://www.manix.net/wp-content/uploads/2021/04/packshot-endurance-gel.png',
    stock: 30,
    features: ['Delay Effect', 'Paraben Free', 'Long Lasting']
  },
  {
    id: '4',
    name: 'Durex Play Cherry Lube (50ml)',
    description: 'Juicy cherry flavored lubricant. Sugar-free and non-sticky, it adds a delicious taste and aroma to your intimate moments.',
    price: 75,
    category: ProductCategory.LUBRICANT,
    imageUrl: 'https://m.media-amazon.com/images/I/61N+p+yKq+L._AC_SL1500_.jpg',
    stock: 45,
    features: ['Cherry Flavor', 'Water-based', 'Sugar Free']
  },
  {
    id: '5',
    name: 'Durex Mutual Climax (10 Pack)',
    description: 'Designed to speed her up and slow him down. Ribbed and dotted texture for her, and Performa lubricant with 5% benzocaine for him.',
    price: 120,
    category: ProductCategory.CONDOM,
    imageUrl: 'https://m.media-amazon.com/images/I/81xU+E-yK+L._AC_SL1500_.jpg',
    stock: 80,
    features: ['Ribbed & Dotted', 'Delay Lubricant', 'Dual Action']
  },
  {
    id: '6',
    name: 'Manix Strawberry Lubricant (80ml)',
    description: 'A gourmet lubricant with a sweet strawberry scent. Its high-quality water-based formula is non-sticky and compatible with all condoms.',
    price: 90,
    category: ProductCategory.LUBRICANT,
    imageUrl: 'https://www.manix.net/wp-content/uploads/2021/04/packshot-fraise-gourmande.png',
    stock: 60,
    features: ['Strawberry Scent', 'Edible', 'Smooth Texture']
  },
  {
    id: '7',
    name: 'Durex Pleasure Me (10 Pack)',
    description: 'Ensures stimulation for you and your partner. The specially designed shape has uniquely positioned ribs and raised dots.',
    price: 85,
    category: ProductCategory.CONDOM,
    imageUrl: 'https://m.media-amazon.com/images/I/81A+S+yKq+L._AC_SL1500_.jpg',
    stock: 90,
    features: ['Ribbed', 'Dotted', 'Easy-On Shape']
  },
  {
    id: '8',
    name: 'Manix Infini (12 Pack)',
    description: 'Ultra-thin condoms for optimal sensitivity. Manix Infini is so thin you might forget you are wearing it.',
    price: 100,
    category: ProductCategory.CONDOM,
    imageUrl: 'https://www.manix.net/wp-content/uploads/2021/04/packshot-infini-x14.png',
    stock: 40,
    features: ['Ultra Thin', 'Lubricated', 'Reservoir Tip']
  }
];