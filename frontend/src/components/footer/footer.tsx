import { Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-8 h-8 text-teal-400" />
              <span className="text-xl font-bold">Legal Connect</span>
            </div>
            <p className="text-gray-400 text-sm">
              Nền tảng tư vấn pháp luật hàng đầu Việt Nam, kết nối bạn với luật sư chuyên nghiệp.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Tư vấn pháp luật</a></li>
              <li><a href="#" className="hover:text-white">Tra cứu văn bản</a></li>
              <li><a href="#" className="hover:text-white">Hỏi đáp cộng đồng</a></li>
              <li><a href="#" className="hover:text-white">AI Lawyer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Lĩnh vực</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Luật Doanh nghiệp</a></li>
              <li><a href="#" className="hover:text-white">Luật Lao động</a></li>
              <li><a href="#" className="hover:text-white">Luật Đất đai</a></li>
              <li><a href="#" className="hover:text-white">Luật Thuế</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Liên hệ</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📍 123 Đường ABC, Q.1, TP.HCM</p>
              <p>📞 (028) 3xxx-xxxx</p>
              <p>✉️ contact@legalconnect.vn</p>
              <div className="flex gap-4 mt-4">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700">
                  <span className="text-xs">in</span>
                </div>
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700">
                  <span className="text-xs">yt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2024 Legal Connect. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white">Điều khoản sử dụng</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Chính sách bảo mật</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}