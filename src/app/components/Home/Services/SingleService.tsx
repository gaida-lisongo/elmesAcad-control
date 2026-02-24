import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

type ServiceType = {
  imageUrl?: string;
  title: string;
  slug: string;
  description: string;
};

const SingleService = ({ service }: { service: ServiceType }) => {
  const { imageUrl, title, description, slug } = service;
  const displayImage = imageUrl || "/images/ServiceDetail/EdTechAppImage.png";
  return (
    <div className="xl:col-span-4 md:col-span-6 col-span-12">
      <Link href={`/services/${slug}`} className="group block h-full">
        <div className="relative h-full min-h-[320px] rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5">
          <Image
            src={displayImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="text-sm text-white/85 mt-2">
              {description}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
              Voir plus
              <Icon
                icon="solar:alt-arrow-right-linear"
                width="18"
                height="18"
                className="font-semibold"
              />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SingleService;
