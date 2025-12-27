"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLogin } from "@/components/auth/social-login";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiClient } from "@/lib/axiosInstance";
import axios from "axios";
import {
  registerSchema,
  type RegisterFormData,
} from "@/domain/validations/auth";
import { toast } from "sonner";

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
      };

      const res = await apiClient.post("/auth/register", payload);
      // backend uses ApiResponse wrapper { success, message, data }
      const apiResponse = res.data as ApiResponse<unknown>;
      if (!apiResponse?.success) {
        setError("root", {
          message: apiResponse?.message || "Đăng ký thất bại",
        });
        toast.error(apiResponse?.message || "Đăng ký thất bại");
        return;
      }

      // success - redirect to login with success message
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push(`/login?registered=true`);
    } catch (err: unknown) {
      // axios errors contain response data with message; try to extract
      let errMsg = "Lỗi mạng";
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data as { message?: string } | undefined;
        errMsg = respData?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      } else {
        errMsg = String(err);
      }
      setError("root", { message: errMsg });
      toast.error(errMsg);
    }
  };
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
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      type="text"
                      {...register("fullName")}
                      aria-required
                      aria-invalid={!!errors.fullName}
                      className={`pl-10 h-12 transition-all duration-200 ${
                        errors.fullName
                          ? "border-red-500 focus:ring-red-500"
                          : "focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      {...register("email")}
                      aria-required
                      aria-invalid={!!errors.email}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className={`pl-10 h-12 transition-all duration-200 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      aria-required
                      aria-invalid={!!errors.password}
                      autoComplete="new-password"
                      className={`pl-10 h-12 transition-all duration-200 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                      aria-required
                      aria-invalid={!!errors.confirmPassword}
                      autoComplete="new-password"
                      className={`pl-10 h-12 transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "focus:ring-2 focus:ring-[#004646]/20 focus:border-[#004646]"
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    {...register("terms")}
                    aria-required
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-[#004646] focus:ring-[#004646] focus:ring-2 cursor-pointer transition-all"
                  />
                  <div>
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors cursor-pointer"
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
                    {errors.terms && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>

                {errors.root && (
                  <p className="text-sm text-red-500">{errors.root.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-[#004646] to-[#006666] hover:from-[#005555] hover:to-[#007777] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-60"
                >
                  <span className="flex items-center gap-2 justify-center">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang đăng ký...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Đăng ký
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
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
