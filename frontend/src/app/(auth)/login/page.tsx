"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SocialLogin } from "@/components/auth/social-login";
import { useAuth } from "@/contexts/auth-context";
import { useLoadingState } from "@/hooks/use-loading-state";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoadingState();

  useEffect(() => {
    // Only redirect if authLoading is complete and user is authenticated
    // This prevents redirect loop during auth initialization
    console.log(
      "[LOGIN PAGE] authLoading:",
      authLoading,
      "isAuthenticated:",
      isAuthenticated
    );
    if (authLoading === false && isAuthenticated === true) {
      console.log(
        "[LOGIN PAGE] Redirecting to / because user is authenticated"
      );
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      startLoading("Đang tải...");

      await login(data.email, data.password);

      toast.success("Đăng nhập thành công!");
      const returnUrl = new URLSearchParams(window.location.search).get(
        "returnUrl"
      );
      router.push(returnUrl || "/");
    } catch (error) {
      console.error("Login error:", error);

      const axiosError = error as {
        response?: { status: number; data?: unknown };
      };

      if (axiosError.response?.status === 401) {
        setError("email", { message: "Email hoặc mật khẩu không đúng" });
        setError("password", { message: "Email hoặc mật khẩu không đúng" });
        toast.error("Email hoặc mật khẩu không đúng");
      } else if (axiosError.response?.status === 400) {
        toast.error("Thông tin đăng nhập không hợp lệ");
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      stopLoading();
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white h-screen min-h-[100vh]">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "700ms" }}
        ></div>
      </div>

      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-md overflow-hidden relative z-10 animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[650px]">
          {/* Left side - Form */}
          <div className="p-8 lg:p-12 flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#004646] to-[#006666] mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Chào mừng trở lại
                </h1>
                <p className="text-base text-gray-600">
                  Chưa có tài khoản?{" "}
                  <Link
                    href="/register"
                    className="text-[#004646] hover:text-[#006666] font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    Đăng ký ngay
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Form */}
              <div onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                      disabled={isLoading}
                      {...register("email", {
                        required: "Email là bắt buộc",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email không hợp lệ",
                        },
                      })}
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
                    Mật khẩu
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004646] transition-colors pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...register("password", {
                        required: "Mật khẩu là bắt buộc",
                        minLength: {
                          value: 6,
                          message: "Mật khẩu phải có ít nhất 6 ký tự",
                        },
                      })}
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

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#004646] focus:ring-[#004646] focus:ring-2 cursor-pointer transition-all"
                      {...register("remember")}
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#004646] hover:text-[#006666] font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="w-full h-12 bg-gradient-to-r from-[#004646] to-[#006666] hover:from-[#005555] hover:to-[#007777] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang đăng nhập...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Đăng nhập
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Hoặc tiếp tục với
                  </span>
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
