'use client';

import * as React from "react";
import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export function MobileNav() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đã đăng xuất thành công!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem asChild>
          <Link href="/forum" className="w-full cursor-pointer">
            Diễn đàn
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/chat" className="w-full cursor-pointer">
            Trợ lý AI
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pdf-qa" className="w-full cursor-pointer">
            Hỏi đáp văn bản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tu-van-luat-su" className="w-full cursor-pointer">
            Tư vấn luật sư
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isAuthenticated ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                {user?.fullName || 'Hồ sơ'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="w-full cursor-pointer">
                Đăng nhập
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="w-full cursor-pointer">
                Đăng ký
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
