import { use } from 'react';
import Link from 'next/link';
import { NewThreadForm } from './new-thread-form';

const categoryNames: { [key: string]: string } = {
  'dan-su': 'Luật Dân sự',
  'hinh-su': 'Luật Hình sự',
  'dat-dai': 'Luật Đất đai',
  'lao-dong': 'Luật Lao động',
  'kinh-doanh': 'Luật Kinh doanh',
  'thue': 'Luật Thuế'
};

export default function NewThreadPage({ params }: { params: Promise<{ category: string }> }) {
  const routeParams = use(params);
  const categoryName = categoryNames[routeParams.category] || routeParams.category;

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/forum" className="hover:text-[#004646]">
            Diễn đàn
          </Link>
          <span>→</span>
          <Link 
            href={`/forum/${routeParams.category}`}
            className="hover:text-[#004646]"
          >
            {categoryName}
          </Link>
          <span>→</span>
          <span className="text-gray-900">Tạo chủ đề mới</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tạo chủ đề mới</h1>
          <p className="text-gray-600 mt-2">
            Tạo một chủ đề mới trong chuyên mục {categoryName}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <NewThreadForm category={routeParams.category} />
        </div>
      </div>
    </div>
  );
}
