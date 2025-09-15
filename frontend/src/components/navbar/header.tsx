import Link from 'next/link';
import { Search } from '../Search';

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-700">Legal Connect</span>
          </Link>

          {/* Search */}
          <Search />

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="/questions" 
              className="text-gray-600 hover:text-gray-900"
            >
              Questions
            </Link>
            <Link 
              href="/tags" 
              className="text-gray-600 hover:text-gray-900"
            >
              Tags
            </Link>
            <Link 
              href="/users" 
              className="text-gray-600 hover:text-gray-900"
            >
              Users
            </Link>
            <Link
              href="/questions/ask"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask Question
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
