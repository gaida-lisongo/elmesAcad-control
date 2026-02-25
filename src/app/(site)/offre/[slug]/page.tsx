import { getPackageById } from "@/lib/actions/home/package-actions";
import { getFAQByPackage, getClients } from "@/lib/actions/offre-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OffreHero from "@/app/components/Offre/OffreHero";
import OffreFeatures from "@/app/components/Offre/OffreFeatures";
import OffreBenefits from "@/app/components/Offre/OffreBenefits";
import OffreCTA from "@/app/components/Offre/OffreCTA";
import OffreFAQ from "@/app/components/Offre/OffreFAQ";
import OffrePartners from "@/app/components/Offre/OffrePartners";

export interface ModuleItem {
  _id: string;
  nom: string;
  icon?: any;
  imageUrl?: string;
  description: string;
  probleme: string;
  objectifs?: string;
  slug?: string;
  features: string[];
  titre?: string;
}

export interface PackageData {
  _id: string;
  titre: string;
  description: string;
  benefices: string[];
  avantages: string[];
  features: string[];
  prix: number;
  packageHeritage: {
    _id: string;
    titre: string;
    description: string;
    prix: number;
    modules: string[];
  } | null;
  modules: ModuleItem[];
}

const OffrePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  // Fetch package data
  const res = await getPackageById(slug);
  if (!res || !res.data) {
    return <div>Offre non trouvée</div>;
  }
  const offre = res.data as PackageData;

  // Fetch FAQ for this package
  const faqResult = await getFAQByPackage(slug);
  let faqItems: { question: string; answer: string }[] = [];
  if (faqResult?.success && faqResult.data) {
    faqItems = (faqResult.data as any).faqItems || [];
  }

  // Fetch clients for partners section
  const clientsResult = await getClients();
  const clients: any[] = clientsResult?.success ? clientsResult.data || [] : [];

  // Transform modules to include titre field
  const transformedModules = offre.modules.map((module) => ({
    _id: module._id,
    titre: module.nom || module.titre || "",
    description: module.description,
  }));

  return (
    <div className="">
      {/* 1. ATTENTION - Eye-catching hero */}
      <OffreHero
        titre={offre.titre}
        description={offre.description}
        prix={offre.prix}
      />

      {/* 2. INTEREST - Features/modules showcase */}
      <OffreFeatures modules={transformedModules} />

      {/* 3. DESIRE - Benefits/advantages highlight */}
      <OffreBenefits benefices={offre.benefices} avantages={offre.avantages} />

      {/* 4. ACTION - CTA to pricing */}
      <OffreCTA />

      {/* 5. OBJECTIONS - Admin-editable FAQ */}
      <OffreFAQ packageId={slug} faqItems={faqItems} isAdmin={isAdmin} />

      {/* 6. SOCIAL PROOF - Client logos */}
      <OffrePartners clients={clients} />
    </div>
  );
};

export default OffrePage;
