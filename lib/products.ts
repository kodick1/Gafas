export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  description?: string;
  images?: string[];
  category?: "sol" | "recetada" | "deportiva";
  stock?: number;
  status?: "active" | "inactive" | "out_of_stock";
  source?: "INVENTORY" | "CREATOR_APPROVED";
  creatorName?: string;
  createdAt?: string;
  color: string;
  colorName: string;
  material: string;
  shape: string;
  lens: string;
  faceShapes: string[];
  bestseller?: boolean;
  prescription?: boolean;
  maxSphere?: number;
};

export const products: Product[] = [
  { id: "sol-01", name: "Sierra", subtitle: "Una silueta para todos los días", description: "Una silueta para todos los días", price: 289000, color: "olive", colorName: "Verde oliva", material: "Acetato", shape: "Redonda", lens: "Polarizado", faceShapes: ["ovalado", "cuadrado"], bestseller: true, category: "sol", stock: 24, status: "active", source: "INVENTORY", images: [] },
  { id: "sol-02", name: "Bruma", subtitle: "Ligera como una mañana lenta", description: "Ligera como una mañana lenta", price: 319000, color: "honey", colorName: "Miel", material: "Acetato", shape: "Cat eye", lens: "Fotocromático", faceShapes: ["ovalado", "corazón"], maxSphere: 4, category: "sol", stock: 6, status: "active", source: "INVENTORY", images: [] },
  { id: "sol-03", name: "Río", subtitle: "Un clásico que encuentra su rumbo", description: "Un clásico que encuentra su rumbo", price: 259000, color: "black", colorName: "Negro mate", material: "Titanio", shape: "Rectangular", lens: "Filtro azul", faceShapes: ["redondo", "ovalado"], bestseller: true, prescription: true, category: "recetada", stock: 18, status: "active", source: "INVENTORY", images: [] },
  { id: "sol-04", name: "Cielo", subtitle: "Hechas para mirar un poco más lejos", description: "Hechas para mirar un poco más lejos", price: 349000, color: "burgundy", colorName: "Vino", material: "Metal", shape: "Aviador", lens: "Progresivo", faceShapes: ["cuadrado", "redondo"], prescription: true, category: "recetada", stock: 3, status: "active", source: "INVENTORY", images: [] },
  { id: "sol-05", name: "Monte", subtitle: "El lado más natural de lo esencial", description: "El lado más natural de lo esencial", price: 299000, color: "olive", colorName: "Oliva oscuro", material: "Madera", shape: "Cuadrada", lens: "Polarizado", faceShapes: ["redondo", "ovalado"], category: "sol", stock: 12, status: "active", source: "INVENTORY", images: [] },
  { id: "sol-06", name: "Luna", subtitle: "Un pequeño cambio de perspectiva", description: "Un pequeño cambio de perspectiva", price: 279000, color: "honey", colorName: "Ámbar", material: "Acetato", shape: "Ovalada", lens: "Fotocromático", faceShapes: ["cuadrado", "corazón"], prescription: true, category: "recetada", stock: 0, status: "out_of_stock", source: "INVENTORY", images: [] },
];
