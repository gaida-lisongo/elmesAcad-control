import FAQ from "@/app/components/Home/FAQ";
import Info from "@/app/components/Home/Info";
import ProductDoc from "@/app/components/Home/ProductDoc";
import Partners from "@/app/components/Home/Partner";

export default function OffreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <ProductDoc />
      <FAQ />
      <Info />
      <Partners />
    </div>
  );
}
