import HeroSub from "@/app/components/SharedComponent/HeroSub";
import WhyUs from "@/app/components/About/WhyUs";
import Matricule from "@/app/components/About/Matricule";
import Teams from "@/app/components/About/Teams";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | ElmesAcad",
};

const AboutPage = () => {
  const breadcrumbsLinks = [
    { text: "Accueil", href: "/" },
    { text: "À propos", href: "/about" },
  ];

  return (
    <>
      <HeroSub
        title="À propos de nous"
        description="Découvrez l'histoire, la mission et les valeurs de notre entreprise. Nous sommes dédiés à fournir des solutions innovantes pour transformer votre expérience numérique."
        breadcrumbLinks={breadcrumbsLinks}
      />
      <WhyUs />
      <Matricule />
      <Teams />
    </>
  );
};

export default AboutPage;
