import Link from "next/link";

export function MainNavigation() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 space-x-8">
          <Link href="/phap-luat" className="text-gray-700 hover:text-[#004646]">
            Văn bản pháp luật
          </Link>
          <Link href="/tinh-huong" className="text-gray-700 hover:text-[#004646]">
            Tình huống pháp luật
          </Link>
          <Link href="/bieu-mau" className="text-gray-700 hover:text-[#004646]">
            Biểu mẫu
          </Link>
          <Link href="/tu-van" className="text-gray-700 hover:text-[#004646]">
            Tư vấn pháp luật
          </Link>
        </div>
      </div>
    </div>
  );
}
