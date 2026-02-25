import HeroSub from "@/app/components/SharedComponent/HeroSub";
import ContactForm from "@/app/components/Contact/Form";
import ContactInfo from "@/app/components/Contact/ContactInfo/ContactInfo";
import PhoneNumbers from "@/app/components/Contact/PhoneNumbers";
import React from "react";
import { Metadata } from "next";
import { getContact } from "@/lib/actions/contact-actions";

export const metadata: Metadata = {
  title: "Contact | SaasCandy",
};

const page = async () => {
  // Fetch contact UNE SEULE FOIS côté serveur
  const contact = await getContact();

  const breadcrumbLinks = [
    { href: "/", text: "Accueil" },
    { href: "/contact", text: "Contact" },
  ];

  return (
    <>
      <HeroSub
        title="Contactez-nous"
        description="Découvrez une richesse de matériaux perspicaces méticuleusement conçus pour vous fournir une compréhension complète des dernières tendances."
        breadcrumbLinks={breadcrumbLinks}
      />
      <ContactInfo data={contact} />
      <PhoneNumbers data={contact} />
      <ContactForm data={contact} />
    </>
  );
};

export default page;
