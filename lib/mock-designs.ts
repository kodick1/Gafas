export type DesignRequest = {
  id: string;
  title: string;
  name: string;
  email: string;
  description: string;
  filename: string;
  image?: string;
  material?: string;
  color?: string;
  lensTint?: string;
  engravingText?: string;
  price?: number;
  status: "Pendiente" | "Aprobado" | "Rechazado";
  createdAt: string;
};

const storage = globalThis as typeof globalThis & { lumiereDesigns?: DesignRequest[] };
storage.lumiereDesigns ??= [
  { id: "des-001", title: "Montura orgánica", name: "Laura Gómez", email: "laura@email.com", description: "Montura inspirada en formas orgánicas y tonos tierra.", filename: "organica.glb", status: "Pendiente", createdAt: "2025-02-12" },
  { id: "des-002", title: "Patillas clásicas", name: "Simón Parra", email: "simon@email.com", description: "Un diseño clásico con detalles en las patillas.", filename: "detalle_patilla.svg", status: "Pendiente", createdAt: "2025-02-11" },
];
export function getDesigns() { return storage.lumiereDesigns!; }
export function setDesigns(designs: DesignRequest[]) { storage.lumiereDesigns = designs; }
