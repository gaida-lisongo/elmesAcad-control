import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "ElmesAcad",
    template: "%s | ElmesAcad",
  },
  icons: {
    icon: "/images/logo/logo.png",
  },
  description:
    "Digitalisez votre etablissement simplement avec ElmesAcad : des solutions SaaS sur mesure pour propulser votre croissance et optimiser vos opérations. Découvrez nos modules innovants et nos packages flexibles conçus pour répondre à vos besoins spécifiques. Rejoignez-nous dès aujourd'hui et transformez votre entreprise avec ElmesAcad.",
};
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
