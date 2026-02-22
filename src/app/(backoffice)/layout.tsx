export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Backoffice</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="#" className="hover:underline">
                Dashboard
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">
                Users
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
