import { Search } from "lucide-react";

export function EmptyState({ title = "No hay resultados", description = "Prueba cambiando los filtros o la búsqueda." }: { title?: string; description?: string }) {
  return <div className="flex flex-col items-center justify-center py-16 text-center"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-muted"><Search size={19} /></span><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 max-w-xs text-sm text-muted">{description}</p></div>;
}
