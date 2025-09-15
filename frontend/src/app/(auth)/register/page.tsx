'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLogin } from "@/components/auth/social-login";

export default function RegisterPage() {
  return (
    <div className="bg-white w-[80%] max-w-6xl h-[650px] mx-auto rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="grid grid-cols-12 gap-0 h-full">
        <div className="col-span-5 px-8 flex items-center">
          <div className="space-y-6 w-full">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-gray-900">Đăng ký</h1>
              <p className="text-sm text-gray-500">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-[#004646] hover:text-[#005c5c] font-medium">
                  Đăng nhập
                </Link>
              </p>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  required
                />
              </div>
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
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300 text-[#004646]"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-500">
                  Tôi đồng ý với các{' '}
                  <Link href="/terms" className="text-[#004646] hover:text-[#005c5c]">
                    điều khoản
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-[#004646] hover:text-[#005c5c]">
                    chính sách bảo mật
                  </Link>
                </label>
              </div>
              <Button type="submit" className="w-full" variant="default">
                Đăng ký
              </Button>
            </form>
            
            <div className="mt-4">
              <SocialLogin />
            </div>
          </div>
        </div>
        <div className="col-span-7 bg-[#004646]/5">
          <div className="relative w-full h-full">
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
