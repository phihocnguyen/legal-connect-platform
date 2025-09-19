'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLogin } from "@/components/auth/social-login";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
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
      setIsLoading(true);
      
      await login(data.email, data.password);
      
      toast.success('Đăng nhập thành công!');
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      const axiosError = error as { response?: { status: number; data?: unknown } };
      
      if (axiosError.response?.status === 401) {
        setError('email', { message: 'Email hoặc mật khẩu không đúng' });
        setError('password', { message: 'Email hoặc mật khẩu không đúng' });
        toast.error('Email hoặc mật khẩu không đúng');
      } else if (axiosError.response?.status === 400) {
        toast.error('Thông tin đăng nhập không hợp lệ');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                    },
                  })}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#004646]"
                    {...register('remember')}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-500">Ghi nhớ</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#004646] hover:text-[#005c5c]">
                  Quên mật khẩu?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
