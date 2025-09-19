export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-101px)] flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
