'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LegalDocument, loadLegalDocuments } from "@/lib/csv-parser";
import Footer from "@/components/footer/footer";
import { 
  ArrowRight, 
  BookText, 
  Bot, 
  ChevronRight, 
  MessageCircle, 
  Scale, 
  Star,
  FileText,
  Gavel,
  Building,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import LegalDocumentsSection from "@/components/legal-documents-section";
import useSockJsStomp from "@/hooks/use-websocket-cases";
import { useAuth } from "@/contexts/auth-context";
const BREAKING_NEWS = [
  {
    id: 1,
    title: "Bộ Tư pháp ban hành Thông tư 04/2024 về quy định mới trong đăng ký kinh doanh",
    excerpt: "Thông tư có hiệu lực từ ngày 15/10/2024, đơn giản hóa thủ tục và rút ngắn thời gian xử lý hồ sơ đăng ký kinh doanh xuống còn 3 ngày làm việc...",
    category: "Doanh nghiệp",
    publishTime: "2 giờ trước",
    readTime: "5 phút đọc",
    views: 2847,
    isBreaking: true
  }
];

export default function LegalNewsLayout() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth()
  const { connected, connect, disconnect, subscribe, send } = useSockJsStomp({
    url: 'http://localhost:8080/ws',
    reconnectDelay: 5000,
  });

  useEffect(() => {
    async function checkAuth() {
      if(user && !connected) connect()
    }
    checkAuth();
  }, [user, connect, connected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadLegalDocuments();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const totalDocuments = documents.length;
  const uniqueAuthorities = new Set(documents.map(doc => doc.noi_ban_hanh)).size;
  const activeDocuments = documents.filter(doc => doc.tinh_trang === 'Còn hiệu lực').length;
  const authorityStats = documents.reduce((acc, doc) => {
    const authority = doc.noi_ban_hanh || 'Khác';
    acc[authority] = (acc[authority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAuthorities = Object.entries(authorityStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const documentTypeStats = documents.reduce((acc, doc) => {
    const type = doc.loai_van_ban || 'Khác';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDocumentTypes = Object.entries(documentTypeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const QUICK_STATS = [
    { label: "Văn bản pháp luật", value: totalDocuments.toLocaleString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Cơ quan ban hành", value: uniqueAuthorities.toString(), icon: Building, color: "text-green-600", bg: "bg-green-100" },
    { label: "Văn bản hiệu lực", value: activeDocuments.toLocaleString(), icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Cập nhật thường xuyên", value: "24/7", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" }
  ];

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
          <div className="lg:col-span-8">
            <LegalDocumentsSection />
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8 sticky">

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building className={primaryColor} />
                    Cơ quan ban hành phổ biến
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">Đang tải...</div>
                  ) : (
                    <div className="space-y-3">
                      {topAuthorities.map((authority, i) => (
                        <div key={i} className="p-3 rounded-lg hover:bg-stone-50 cursor-pointer group border-l-2 border-teal-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 group-hover:text-teal-600 transition-colors text-sm mb-1">
                                {authority.name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{authority.count} văn bản</span>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[60px]">
                                  <div 
                                    className="bg-teal-600 h-1.5 rounded-full" 
                                    style={{
                                      width: `${Math.min((authority.count / Math.max(...topAuthorities.map(a => a.count))) * 100, 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Scale className={primaryColor} />
                    Loại văn bản phổ biến
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">Đang tải...</div>
                  ) : (
                    <div className="space-y-2">
                      {topDocumentTypes.map((type, i) => {
                        const getIcon = (typeName: string) => {
                          if (typeName.includes('Nghị quyết')) return Gavel;
                          if (typeName.includes('Thông tư')) return FileText;
                          if (typeName.includes('Quyết định')) return CheckCircle;
                          if (typeName.includes('Chỉ thị')) return AlertTriangle;
                          if (typeName.includes('Luật')) return Scale;
                          return Building;
                        };
                        const IconComponent = getIcon(type.name);
                        
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-5 h-5 text-gray-500 group-hover:text-teal-600" />
                              <span className="font-medium text-gray-700 group-hover:text-teal-600 transition-colors text-sm">
                                {type.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{type.count}</Badge>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
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
      <Footer />
    </div>
  );
}