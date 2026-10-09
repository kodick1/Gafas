"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { useLocaleText } from "@/hooks/use-locale-text";

const message = "Hola Lumiere_Optique, quiero asesoria sobre unas gafas";

export function WhatsAppFloat() {
  const t = useLocaleText("common");
  return (
    <Link
      href={`https://wa.me/573013761312?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <span className="relative flex items-center justify-center" aria-hidden="true">
        <MessageCircle size={29} />
        <Phone size={13} className="absolute -rotate-12" />
      </span>
    </Link>
  );
}
