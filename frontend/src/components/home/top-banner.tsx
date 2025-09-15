import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function TopBanner() {
  return (
    <div className="bg-blue-700 text-white py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between text-sm">
          <span>Hotline: 1900 6192</span>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-blue-200">Đăng nhập</Link>
            <Link href="/register" className="hover:text-blue-200">Đăng ký</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
