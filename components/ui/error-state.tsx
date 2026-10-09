import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex flex-col items-center justify-center py-16 text-center"><AlertCircle className="mb-3 text-red-500" size={24} /><h3 className="font-semibold">No pudimos cargar la información</h3><p className="mt-1 text-sm text-muted">Revisa tu conexión e inténtalo de nuevo.</p><Button className="mt-4" variant="secondary" size="sm" onClick={onRetry}>Reintentar</Button></div>;
}
