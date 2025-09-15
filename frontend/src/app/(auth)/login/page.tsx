'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLogin } from "@/components/auth/social-login";

export default function LoginPage() {
  return (
    <div className="bg-white w-[80%] max-w-6xl h-[650px] mx-auto rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="grid grid-cols-12 gap-0 h-full">
        <div className="col-span-5 px-8 flex items-center">
          <div className="space-y-6 w-full">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Đăng nhập
              </h1>
              <p className="text-sm text-gray-500">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="text-[#004646] hover:text-[#005c5c] font-medium">
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-[#004646]" />
                  <span className="text-sm text-gray-500">Ghi nhớ</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#004646] hover:text-[#005c5c]">
                  Quên mật khẩu?
                </Link>
              </div>
              <Button type="submit" className="w-full" variant="default">
                Đăng nhập
              </Button>
            </form>
            
            <div className="mt-4">
              <SocialLogin />
            </div>
          </div>
        </div>

        <div className="col-span-7 bg-[#004646]/5 flex items-center justify-center">
          <div className="relative h-full w-full">
            <Image
              src="/thumbnail.jpg"
              alt="Legal Connect Illustration"
              fill
              className="object-fill rounded-r-md"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
