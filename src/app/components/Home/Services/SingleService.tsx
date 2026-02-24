import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

type ServiceType = {
  imageUrl?: string;
  title: string;
  slug: string;
  description: string;
};

const SingleService = ({
  service,
  withGrid = true,
}: {
  service: ServiceType;
  withGrid?: boolean;
}) => {
  const { imageUrl, title, description, slug } = service;
  const displayImage = imageUrl || "/images/ServiceDetail/EdTechAppImage.png";
  return (
    <div className={withGrid ? "xl:col-span-4 md:col-span-6 col-span-12" : ""}>
      <div className="h-full rounded-3xl bg-white dark:bg-darklight shadow-card-shadow flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
            <Image
              src={displayImage}
              alt={title}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <h3 className="text-22 font-semibold text-black dark:text-white">
            {title}
          </h3>
        </div>
        <div className="h-px w-full bg-black/10 dark:bg-white/10" />
        <div className="p-6 flex flex-col gap-4 h-full">
          <p className="text-base font-medium text-black/60 dark:text-white/60">
            {description}
          </p>
          <Link
            href={`/services/${slug}`}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-orange-600"
          >
            Voir plus
            <Icon
              icon="solar:alt-arrow-right-linear"
              width="18"
              height="18"
              className="font-semibold"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleService;
