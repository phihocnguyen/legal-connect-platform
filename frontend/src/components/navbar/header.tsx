"use client";

import Link from "next/link";
// search removed from header because home page has the primary search
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#004646]">
              Legal Connect
            </span>
          </Link>

          {/* Search removed */}

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/forum"
              className="text-gray-600 hover:text-[#004646] font-medium"
            >
              Diễn đàn
            </Link>
            <Link
              href="/messages"
              className="text-gray-600 hover:text-[#004646] font-medium"
            >
              Tin nhắn
            </Link>
            <Link
              href="/chat"
              className="text-gray-600 hover:text-[#004646] font-medium"
            >
              Trợ lý AI
            </Link>
            <Link
              href="/pdf-qa"
              className="text-gray-600 hover:text-[#004646] font-medium"
            >
              Hỏi đáp văn bản
            </Link>
            <Link
              href="/tu-van-luat-su"
              className="text-gray-600 hover:text-[#004646] font-medium"
            >
              Tư vấn luật sư
            </Link>
          </nav>

          {/* Auth/User Menu and Mobile Menu */}
          <div className="flex items-center space-x-4 ml-4">
            <div className="hidden sm:block">
              <UserMenu />
            </div>
            <MobileNav />
          </div>
        </div>

        {/* Mobile Search removed */}
      </div>
    </header>
  );
}
