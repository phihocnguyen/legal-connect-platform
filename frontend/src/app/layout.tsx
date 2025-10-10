import type { Metadata } from "next";
import "./globals.css"; 
import "@fontsource/alexandria"; 
import { AuthProvider } from "@/contexts/auth-context";
import { LoadingProvider } from "@/contexts/loading-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { GlobalLoadingIndicator } from "@/components/ui/global-loading-indicator";
import { Toaster } from "@/components/ui/sonner";
import WebSocketProvider from "@/components/web-socket-provider";
import ConditionalHeader from "@/components/shared/conditional-header";

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
        <LoadingProvider>
          <AuthProvider>
            <AuthGuard>
              <WebSocketProvider>
                <div className="flex min-h-screen flex-col">
                <ConditionalHeader />
                <main className="flex-1">
                  {children}
                </main>
              </div>
              </WebSocketProvider>
            </AuthGuard>
            <GlobalLoadingIndicator />
            <Toaster position="top-right" />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
