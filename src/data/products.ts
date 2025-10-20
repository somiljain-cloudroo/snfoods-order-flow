// Sample product data based on Cloudroo Food Supplies actual inventory
export const products = [
  {
    id: "1",
    name: "Luncheon Meat Original",
    brand: "Pure Foods",
    image: "/placeholder.svg",
    price: 8.50,
    unit: "can",
    category: "Filipino",
    inStock: true,
    minOrder: 12
  },
  {
    id: "2", 
    name: "Corned Beef Classic",
    brand: "Pure Foods",
    image: "/placeholder.svg",
    price: 7.25,
    unit: "can",
    category: "Filipino",
    inStock: true,
    minOrder: 24
  },
  {
    id: "3",
    name: "Sardines in Tomato Sauce",
    brand: "Ligo",
    image: "/placeholder.svg", 
    price: 3.75,
    unit: "can",
    category: "Filipino",
    inStock: true,
    minOrder: 48
  },
  {
    id: "4",
    name: "Spanish Style Sardines",
    brand: "Ligo",
    image: "/placeholder.svg",
    price: 4.25,
    unit: "can", 
    category: "Filipino",
    inStock: true,
    minOrder: 48
  },
  {
    id: "5",
    name: "Tuna Flakes in Oil",
    brand: "Century",
    image: "/placeholder.svg",
    price: 5.50,
    unit: "can",
    category: "Filipino",
    inStock: true,
    minOrder: 24
  },
  {
    id: "6",
    name: "Corned Beef Premium",
    brand: "555",
    image: "/placeholder.svg",
    price: 9.75,
    unit: "can",
    category: "Filipino",
    inStock: false,
    minOrder: 12
  },
  {
    id: "7",
    name: "Argentine Beef Classic",
    brand: "Argentina",
    image: "/placeholder.svg",
    price: 12.50,
    unit: "can",
    category: "International",
    inStock: true,
    minOrder: 12
  },
  {
    id: "8",
    name: "Basil Seed Drink Original",
    brand: "SN",
    image: "/placeholder.svg",
    price: 2.25,
    unit: "bottle",
    category: "Beverages",
    inStock: true,
    minOrder: 24
  },
  {
    id: "9",
    name: "Falooda Drink Rose",
    brand: "SN",
    image: "/placeholder.svg",
    price: 2.75,
    unit: "bottle",
    category: "Beverages",
    inStock: true,
    minOrder: 24
  },
  {
    id: "10",
    name: "Instant Noodles Beef",
    brand: "Lucky Me",
    image: "/placeholder.svg",
    price: 1.25,
    unit: "pack",
    category: "Noodles",
    inStock: true,
    minOrder: 60
  },
  {
    id: "11",
    name: "Soy Sauce Premium",
    brand: "Datu Puti",
    image: "/placeholder.svg",
    price: 4.50,
    unit: "bottle",
    category: "Condiments",
    inStock: true,
    minOrder: 12
  },
  {
    id: "12",
    name: "Fish Sauce Original",
    brand: "Rufina",
    image: "/placeholder.svg",
    price: 3.25,
    unit: "bottle", 
    category: "Condiments",
    inStock: true,
    minOrder: 12
  }
];

export const categories = ["Filipino", "International", "Beverages", "Noodles", "Condiments", "Frozen", "Snacks"];

export type Product = typeof products[0];