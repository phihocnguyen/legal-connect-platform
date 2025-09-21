'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  ArrowRight, 
  BookText, 
  Bot, 
  ChevronRight, 
  Clock,
  Eye,
  Flame, 
  MessageCircle, 
  Scale, 
  Star,
  TrendingUp,
  Users,
  FileText,
  Gavel,
  Building,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import Image from "next/image";
import LegalDocumentsSection from "@/components/legal-documents-section";
const BREAKING_NEWS = [
  {
    id: 1,
    title: "Bộ Tư pháp ban hành Thông tư 04/2024 về quy định mới trong đăng ký kinh doanh",
    excerpt: "Thông tư có hiệu lực từ ngày 15/10/2024, đơn giản hóa thủ tục và rút ngắn thời gian xử lý hồ sơ đăng ký kinh doanh xuống còn 3 ngày làm việc...",
    category: "Doanh nghiệp",
    publishTime: "2 giờ trước",
    readTime: "5 phút đọc",
    views: 2847,
    isBreaking: true,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=300&fit=crop"
  }
];

const FEATURED_ARTICLES = [
  {
    id: 2,
    title: "Luật Đất đai 2024: Những thay đổi quan trọng người dân cần biết",
    excerpt: "Luật Đất đai 2024 chính thức có hiệu lực từ 1/8/2024 với nhiều điểm mới về quyền sử dụng đất, chuyển nhượng và thừa kế...",
    category: "Đất đai",
    publishTime: "4 giờ trước",
    readTime: "8 phút đọc",
    views: 5432,
    author: "Luật sư Nguyễn Minh Hạnh",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop",
    tags: ["luật-đất-đai", "2024", "quyền-sử-dụng"]
  },
  {
    id: 3,
    title: "Hướng dẫn thực hiện Nghị định về thuế thu nhập cá nhân từ chuyển nhượng bất động sản",
    excerpt: "Cục Thuế TP.HCM vừa ban hành văn bản hướng dẫn chi tiết về cách tính và nộp thuế TNCN từ việc chuyển nhượng BĐS theo quy định mới...",
    category: "Thuế",
    publishTime: "6 giờ trước",
    readTime: "6 phút đọc",
    views: 3241,
    author: "Luật sư Trần Văn Đức",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop",
    tags: ["thuế", "bất-động-sản", "TNCN"]
  },
  {
    id: 4,
    title: "Quyền lợi của người lao động khi doanh nghiệp phá sản",
    excerpt: "Trong bối cảnh nhiều doanh nghiệp gặp khó khăn, người lao động cần hiểu rõ các quyền lợi được pháp luật bảo vệ khi DN phá sản...",
    category: "Lao động",
    publishTime: "8 giờ trước",
    readTime: "7 phút đọc",
    views: 4156,
    author: "Luật sư Lê Thị Hương",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop",
    tags: ["lao-động", "phá-sản", "quyền-lợi"]
  }
];

const LATEST_NEWS = [
  {
    id: 5,
    title: "Tòa án Nhân dân Tối cao ban hành Nghị quyết về xử lý tranh chấp hợp đồng thương mại điện tử",
    excerpt: "Nghị quyết 02/2024/NQ-HĐTP hướng dẫn các tòa án xử lý tranh chấp phát sinh từ giao dịch TMĐT...",
    category: "TMĐT",
    publishTime: "10 giờ trước",
    readTime: "4 phút đọc",
    views: 1823,
    author: "Thẩm phán Nguyễn Văn Tâm"
  },
  {
    id: 6,
    title: "Quy định mới về bảo vệ dữ liệu cá nhân trong lĩnh vực ngân hàng",
    excerpt: "Ngân hàng Nhà nước vừa ban hành thông tư quy định chi tiết về việc thu thập, xử lý dữ liệu KH...",
    category: "Ngân hàng",
    publishTime: "12 giờ trước",
    readTime: "5 phút đọc",
    views: 2156,
    author: "Luật sư Phạm Thị Lan"
  },
  {
    id: 7,
    title: "Hướng dẫn thủ tục cấp phép đầu tư cho dự án FDI trong lĩnh vực công nghệ",
    excerpt: "Bộ Kế hoạch & Đầu tư công bố danh mục ngành nghề ưu tiên đầu tư nước ngoài 2024-2026...",
    category: "Đầu tư",
    publishTime: "1 ngày trước",
    readTime: "6 phút đọc",
    views: 1745,
    author: "Luật sư Hoàng Minh Tuấn"
  },
  {
    id: 8,
    title: "Quy định về trách nhiệm pháp lý của doanh nghiệp trong việc bảo vệ môi trường",
    excerpt: "Luật Bảo vệ môi trường 2020 quy định rõ các nghĩa vụ và chế tài với DN vi phạm quy định...",
    category: "Môi trường",
    publishTime: "1 ngày trước",
    readTime: "7 phút đọc",
    views: 2341,
    author: "Luật sư Bùi Văn Hùng"
  }
];

const TRENDING_TOPICS = [
  { name: "Luật Đất đai 2024", count: 1234, trend: "up" },
  { name: "Thuế TNCN", count: 987, trend: "up" },
  { name: "Phá sản doanh nghiệp", count: 654, trend: "up" },
  { name: "TMĐT", count: 432, trend: "stable" },
  { name: "Đầu tư nước ngoài", count: 321, trend: "down" }
];

const EXPERT_OPINIONS = [
  {
    id: 1,
    title: "Phân tích: Tác động của Luật Đất đai 2024 đến thị trường bất động sản",
    author: "TS. Luật sư Nguyễn Thành Long",
    role: "Chuyên gia luật Đất đai",
    publishTime: "1 ngày trước",
    excerpt: "Luật Đất đai 2024 mang lại nhiều thay đổi tích cực, tạo minh bạch hơn cho thị trường BĐS...",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ThanhLong"
  },
  {
    id: 2,
    title: "Góc nhìn: Xu hướng tranh chấp lao động trong thời đại số",
    author: "Luật sư Trần Minh Châu", 
    role: "Chuyên gia luật Lao động",
    publishTime: "2 ngày trước",
    excerpt: "Công nghệ đang thay đổi bản chất của quan hệ lao động, đặt ra những thách thức pháp lý mới...",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=MinhChau"
  }
];

const QUICK_STATS = [
  { label: "Văn bản pháp luật", value: "15,234", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
  { label: "Luật sư tư vấn", value: "2,456", icon: Users, color: "text-green-600", bg: "bg-green-100" },
  { label: "Câu hỏi đã giải đáp", value: "45,789", icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-100" },
  { label: "Đánh giá tích cực", value: "98.5%", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" }
];

export default function LegalNewsLayout() {
  const [activeTab, setActiveTab] = useState("all");
  const primaryColor = "text-teal-600";
  const primaryBgColor = "bg-teal-600";
  const primaryHoverBgColor = "hover:bg-teal-700";

  return (
    <div className="min-h-screen bg-stone-50">
      {BREAKING_NEWS.map(news => (
        <div key={news.id} className="bg-red-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Badge className="bg-white text-red-600 font-bold px-3 py-1">
                NÓNG
              </Badge>
              <p className="flex-1 text-sm font-medium truncate">
                {news.title}
              </p>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </div>
          </div>
        </div>
      ))}

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Legal Documents & Categories Section - NEW */}
            <LegalDocumentsSection />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="space-y-8 sticky top-24">

              {/* Trending Topics */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className={primaryColor} />
                    Xu hướng quan tâm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {TRENDING_TOPICS.map((topic, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${primaryColor}`}>#{i + 1}</span>
                          <div>
                            <div className="font-medium text-gray-800 group-hover:text-teal-600 transition-colors">
                              {topic.name}
                            </div>
                            <div className="text-xs text-gray-500">{topic.count} lượt quan tâm</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {topic.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {topic.trend === "down" && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                          {topic.trend === "stable" && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageCircle className={primaryColor} />
                    Tương tác nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className={`w-full ${primaryBgColor} ${primaryHoverBgColor} text-white justify-start`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Đặt câu hỏi pháp lý
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bot className="w-4 h-4 mr-2" />
                    Chat với AI Lawyer
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookText className="w-4 h-4 mr-2" />
                    Tra cứu văn bản
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Gavel className="w-4 h-4 mr-2" />
                    Tìm luật sư
                  </Button>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Scale className={primaryColor} />
                    Lĩnh vực pháp luật
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: "Doanh nghiệp", icon: Building, count: 1234 },
                      { name: "Lao động", icon: Users, count: 987 },
                      { name: "Đất đai", icon: FileText, count: 654 },
                      { name: "Thuế", icon: BarChart3, count: 432 },
                      { name: "Hình sự", icon: AlertTriangle, count: 321 },
                      { name: "Dân sự", icon: CheckCircle, count: 234 }
                    ].map((category, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <category.icon className="w-5 h-5 text-gray-500 group-hover:text-teal-600" />
                          <span className="font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{category.count}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className={`border-none shadow-sm bg-gradient-to-br from-teal-50 to-blue-50`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${primaryBgColor} bg-opacity-10 flex items-center justify-center`}>
                    <MessageCircle className={`w-6 h-6 ${primaryColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Nhận tin pháp luật
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Đăng ký để nhận những tin tức pháp luật mới nhất qua email
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Email của bạn" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                    <Button className={`w-full ${primaryBgColor} ${primaryHoverBgColor} text-white text-sm`}>
                      Đăng ký ngay
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
}