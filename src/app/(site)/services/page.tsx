import ServicesCard from "@/app/components/Services/ServiceCard";
import HeroSub from "@/app/components/SharedComponent/HeroSub";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Services | SassCandy",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Accueil" },
    { href: "/services", text: "Services" },
  ];
  return (
    <>
      <HeroSub
        title="Nos services"
        description="Decouvrez des services concus pour accelerer vos projets avec des solutions modernes et sur mesure."
        breadcrumbLinks={breadcrumbLinks}
      />
      <ServicesCard />
    </>
  );
};

export default page;
