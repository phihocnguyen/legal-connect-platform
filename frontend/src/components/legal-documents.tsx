'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  User, 
  Building, 
  Eye, 
  Download,
  ExternalLink,
  Search
} from "lucide-react";
import { useState } from "react";
import { LegalDocument } from "@/lib/csv-parser";

interface LegalDocumentsProps {
  documents?: LegalDocument[];
  loading?: boolean;
  error?: string | null;
}

export default function LegalDocuments({ 
  documents = [], 
  loading = false, 
  error = null 
}: LegalDocumentsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const documentsPerPage = 10;

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === "all" || doc.loai_van_ban.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.so_hieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.noi_ban_hanh.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, startIndex + documentsPerPage);

  const getStatusColor = (status: string) => {
    return status === "Có hiệu lực" ? "bg-green-100 text-green-800" : 
           status === "Đã biết" ? "bg-blue-100 text-blue-800" : 
           "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Luật": "bg-red-100 text-red-800",
      "Bộ luật": "bg-purple-100 text-purple-800",
      "Nghị định": "bg-blue-100 text-blue-800",
      "Nghị quyết": "bg-green-100 text-green-800",
      "Thông tư": "bg-yellow-100 text-yellow-800",
      "Quyết định": "bg-indigo-100 text-indigo-800",
      "Chỉ thị": "bg-pink-100 text-pink-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-teal-600" />
          Văn bản pháp luật mới nhất
        </h2>
        <span className="text-sm text-gray-500">
          {filteredDocuments.length} văn bản
        </span>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm văn bản theo tiêu đề, số hiệu, cơ quan ban hành..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Tất cả loại</option>
            <option value="luật">Luật</option>
            <option value="nghị định">Nghị định</option>
            <option value="nghị quyết">Nghị quyết</option>
            <option value="thông tư">Thông tư</option>
            <option value="quyết định">Quyết định</option>
            <option value="chỉ thị">Chỉ thị</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDocuments.map((doc) => (
            <Card key={doc._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={getTypeColor(doc.loai_van_ban)}>
                      {doc.loai_van_ban}
                    </Badge>
                    <Badge className={getStatusColor(doc.tinh_trang)}>
                      {doc.tinh_trang}
                    </Badge>
                    <span className="text-sm font-medium text-teal-600">
                      {doc.so_hieu}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-teal-600 cursor-pointer transition-colors line-clamp-2">
                    {doc.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{doc.noi_ban_hanh}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{doc.nguoi_ky}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{doc.ngay_ban_hanh}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {doc.cleaned_content.substring(0, 200)}...
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 lg:w-auto">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="whitespace-nowrap"
                    onClick={() => window.open(doc.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Nguồn gốc
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum <= totalPages) {
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  {pageNum}
                </Button>
              );
            }
            return null;
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </section>
  );
}