import { ShopHeader } from "@/components/shop-header";
import { Footer } from "@/components/layout/Footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <><ShopHeader />{children}<Footer /></>;
}
