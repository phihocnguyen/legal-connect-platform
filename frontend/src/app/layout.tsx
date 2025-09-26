import type { Metadata } from "next";
import "./globals.css"; 
import "@fontsource/alexandria"; 
import { Header } from "@/components/navbar/header";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Toaster } from "@/components/ui/sonner";
import WebSocketProvider from "@/components/web-socket-provider";

export const metadata: Metadata = {
  title: "Legal Connect - Nền tảng tư vấn pháp lý",
  description: "Kết nối bạn với cộng đồng pháp lý và công cụ thông minh để giải đáp mọi thắc mắc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="font-alex antialiased">
        <AuthProvider>
          <AuthGuard>
            <WebSocketProvider>
              <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
            </WebSocketProvider>
          </AuthGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
