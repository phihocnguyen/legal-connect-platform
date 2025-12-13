"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLogin } from "@/components/auth/social-login";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function RegisterPage() {
  // ...existing code...
  const isLoading = false; // Replace with your actual loading state if available
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white h-screen min-h-[100vh]">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-2 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "700ms" }}
        ></div>
      </div>

      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-md overflow-hidden relative z-10 animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-0 h-full">
          <div className="p-8 lg:p-12 flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#004646] to-[#006666] mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Đăng ký tài khoản
                </h1>
                <p className="text-base text-gray-600">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="text-[#004646] hover:text-[#006666] font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    Đăng nhập
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Form */}
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Họ và tên
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="name"
                      placeholder="Nguyễn Văn A"
                      type="text"
                      disabled={false}
                      className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={false}
                      className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      disabled={false}
                      className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      disabled={false}
                      className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 rounded border-gray-300 text-[#004646] focus:ring-[#004646] focus:ring-2 cursor-pointer transition-all"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors"
                  >
                    Tôi đồng ý với các{" "}
                    <Link
                      href="/terms"
                      className="text-[#004646] hover:text-[#005c5c]"
                    >
                      điều khoản
                    </Link>{" "}
                    và{" "}
                    <Link
                      href="/privacy"
                      className="text-[#004646] hover:text-[#005c5c]"
                    >
                      chính sách bảo mật
                    </Link>
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#004646] to-[#006666] hover:from-[#005555] hover:to-[#007777] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <span className="flex items-center gap-2">
                    Đăng ký
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>

              <div className="mt-6">
                <SocialLogin />
              </div>
            </div>
          </div>

          {/* Right side - Image/Branding */}
          <div className="hidden lg:block relative bg-gradient-to-br from-[#004646] to-[#006666] overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative h-full w-full flex items-center justify-center p-12">
              <div className="space-y-6 text-white z-10">
                <h2 className="text-4xl font-bold leading-tight">
                  Kết nối pháp lý
                  <br />
                  <span className="text-white/90">dễ dàng hơn</span>
                </h2>
                <p className="text-lg text-white/80 leading-relaxed">
                  Nền tảng kết nối luật sư và khách hàng hàng đầu Việt Nam
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="w-12 h-1 bg-white rounded-full"></div>
                  <div className="w-8 h-1 bg-white/50 rounded-full"></div>
                  <div className="w-4 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
              <div className="absolute inset-0 opacity-10">
                <Image
                  src="/thumbnail.jpg"
                  alt="Legal Connect"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
