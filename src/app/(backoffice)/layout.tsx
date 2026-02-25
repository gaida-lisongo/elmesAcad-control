import BackofficeSideNav from "./_components/BackofficeSideNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <div className="dark:bg-darkmode min-h-screen">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md !pt-34">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 col-span-12 lg:block hidden">
            <BackofficeSideNav />
          </div>
          {/* Main content */}
          <div className="lg:col-span-9 col-span-12">{children}</div>
        </div>
      </div>
    </div>
  );
}
