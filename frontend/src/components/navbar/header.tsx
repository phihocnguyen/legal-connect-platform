import Link from 'next/link';
import { Search } from './search';
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#004646]">Legal Connect</span>
          </Link>

          {/* Search */}
          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <Search />
          </div>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/van-ban" 
              className="text-gray-600 hover:text-[#004646]"
            >
              Văn bản pháp luật
            </Link>
            <Link 
              href="/questions" 
              className="text-gray-600 hover:text-[#004646]"
            >
              Hỏi đáp
            </Link>
            <Link 
              href="/tu-van" 
              className="text-gray-600 hover:text-[#004646]"
            >
              Tư vấn
            </Link>
            <Link 
              href="/bieu-mau" 
              className="text-gray-600 hover:text-[#004646]"
            >
              Biểu mẫu
            </Link>
            <Link 
              href="/luat-su" 
              className="text-gray-600 hover:text-[#004646]"
            >
              Luật sư
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4 ml-4">
            <div className="hidden sm:flex items-center space-x-3">
              <Button variant="default" asChild>
                <Link href="/login">
                  Đăng nhập
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/register">
                  Đăng ký
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden -mt-2 pb-2">
          <Search />
        </div>
      </div>
    </header>
  );
}
