import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from './components/Header';
import { MainNavigation } from "@/components/home/main-navigation";
import { LegalNews } from "@/components/home/legal-news";
import { RealCases } from "@/components/home/real-cases";
import Link from 'next/link';



interface Question {
  title: string;
  excerpt: string;
  tags: string[];
  stats: {
    votes: number;
    answers: number;
    views: number;
  };
  author?: {
    name: string;
    avatar: string;
  };
  timeAgo?: string;
}

const FEATURED_QUESTIONS: Question[] = [
  {
    title: "Quyền lợi người lao động khi đơn phương chấm dứt hợp đồng",
    excerpt: "Tôi muốn tìm hiểu về các quyền lợi và thủ tục khi người lao động muốn đơn phương chấm dứt hợp đồng lao động trước thời hạn...",
    tags: ["luật-lao-động", "hợp-đồng", "quyền-lợi"],
    stats: {
      votes: 45,
      answers: 8,
      views: 1500
    }
  },
  {
    title: "Thủ tục đăng ký kinh doanh cho công ty khởi nghiệp",
    excerpt: "Là một startup công nghệ, chúng tôi muốn tìm hiểu về quy trình và yêu cầu pháp lý để đăng ký kinh doanh chính thức...",
    tags: ["đăng-ký-kinh-doanh", "startup", "thủ-tục-hành-chính"],
    stats: {
      votes: 38,
      answers: 5,
      views: 1200
    }
  },
  {
    title: "Quy định về bảo vệ dữ liệu cá nhân trong thương mại điện tử",
    excerpt: "Công ty chúng tôi đang xây dựng platform TMĐT và cần tư vấn về các quy định pháp lý liên quan đến bảo vệ dữ liệu người dùng...",
    tags: ["TMĐT", "bảo-vệ-dữ-liệu", "quyền-riêng-tư"],
    stats: {
      votes: 52,
      answers: 7,
      views: 1800
    }
  },
  {
    title: "Tính hợp pháp của giao dịch hợp đồng quốc tế",
    excerpt: "Công ty chúng tôi đang thực hiện giao dịch quốc tế và cần hiểu rõ các yếu tố cần thiết để hợp đồng có hiệu lực pháp lý...",
    author: {
      name: "Nguyễn Văn Minh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minh"
    },
    stats: {
      votes: 42,
      answers: 5,
      views: 1200
    },
    tags: ["luật-quốc-tế", "hợp-đồng", "thương-mại"],
    timeAgo: "2 giờ trước"
  },
  {
    title: "Quyền sở hữu trí tuệ trong phát triển phần mềm",
    excerpt: "Là một lập trình viên làm việc với dự án mã nguồn mở, tôi cần tư vấn về quyền sở hữu trí tuệ khi đóng góp code...",
    author: {
      name: "Trần Văn Hùng",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hung"
    },
    stats: {
      votes: 38,
      answers: 3,
      views: 950
    },
    tags: ["sở-hữu-trí-tuệ", "phần-mềm", "mã-nguồn-mở"],
    timeAgo: "5 giờ trước"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Top Banner */}
      <div className="bg-[#004646] text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <span>Hotline: 1900 6192</span>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="hover:text-emerald-200">Đăng nhập</Link>
              <Link href="/register" className="hover:text-emerald-200">Đăng ký</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <MainNavigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Tra cứu nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder="Tìm văn bản, tiêu đề..."
                  className="w-full px-3 py-2 border rounded-md"
                />
                <Button className="w-full" variant="default">
                  Tìm kiếm
                </Button>
                <div className="text-sm text-gray-600">
                  <p>Ví dụ:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Luật Doanh nghiệp 2024</li>
                    <li>Nghị định về BHXH</li>
                    <li>Thông tư về thuế TNCN</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Lĩnh vực pháp luật</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/doanh-nghiep" className="text-gray-700 hover:text-[#004646] flex items-center">
                      <span className="w-6 text-gray-400">→</span>
                      Doanh nghiệp
                    </Link>
                  </li>
                  <li>
                    <Link href="/lao-dong" className="text-gray-700 hover:text-[#004646] flex items-center">
                      <span className="w-6 text-gray-400">→</span>
                      Lao động - Tiền lương
                    </Link>
                  </li>
                  <li>
                    <Link href="/thue" className="text-gray-700 hover:text-[#004646] flex items-center">
                      <span className="w-6 text-gray-400">→</span>
                      Thuế - Kế toán
                    </Link>
                  </li>
                  <li>
                    <Link href="/dat-dai" className="text-gray-700 hover:text-[#004646] flex items-center">
                      <span className="w-6 text-gray-400">→</span>
                      Đất đai - Xây dựng
                    </Link>
                  </li>
                  <li>
                    <Link href="/hon-nhan" className="text-gray-700 hover:text-[#004646] flex items-center">
                      <span className="w-6 text-gray-400">→</span>
                      Hôn nhân & Gia đình
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <LegalNews />
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            {/* Featured Topics */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Chủ đề được quan tâm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-2">Quyền lợi người lao động</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Tính BHXH một lần</li>
                      <li>• Trợ cấp thất nghiệp</li>
                      <li>• Chế độ thai sản</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-2">Thành lập doanh nghiệp</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Thủ tục đăng ký</li>
                      <li>• Giấy phép con</li>
                      <li>• Thuế ban đầu</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Questions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Hỏi đáp pháp luật mới</CardTitle>
                <Button variant="link" className="text-[#004646] hover:text-[#005c5c]">
                  Xem tất cả →
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {FEATURED_QUESTIONS.map((question, idx) => (
                    <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                      <Link href={`/questions/${idx + 1}`} className="font-medium hover:text-[#004646] block mb-2">
                        {question.title}
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{question.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {question.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {question.stats.answers} câu trả lời • {question.stats.views} lượt xem
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-3">
            <RealCases />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Luật sư tiêu biểu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">Ls. Nguyễn Văn A</p>
                      <p className="text-sm text-gray-600">Công ty Luật ABC</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">Ls. Trần Thị B</p>
                      <p className="text-sm text-gray-600">Văn phòng Luật XYZ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
