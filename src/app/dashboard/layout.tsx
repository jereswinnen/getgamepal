export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We're relying on the middleware to handle authentication
  // This prevents a redirect cycle when cookies aren't properly detected server-side

  return (
    <div className="col-span-full">
      <main className="flex-1">{children}</main>
    </div>
  );
}
