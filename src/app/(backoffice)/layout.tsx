import BackofficeSideNav from "./_components/BackofficeSideNav";

// TODO: authGuard — uncomment and implement when auth is ready
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";
//
// async function requireAuth() {
//   const session = await getServerSession(authOptions);
//   if (!session) redirect("/signin");
//   return session;
// }

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: authGuard — await requireAuth() here before rendering

  return (
    <div className="dark:bg-darkmode min-h-screen">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md p-6 !pt-34">
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
