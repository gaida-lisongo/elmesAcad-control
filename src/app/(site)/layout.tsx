import Footer from "@/app/components/Layout/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
      <ScrollToTop />
    </>
  );
}
