'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Calendar, Building2, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LegalDocument, loadLegalDocuments } from '@/lib/csv-parser';
import { parseVietnameseDate, formatVietnameseDate } from '@/lib/utils';

interface SearchFilters {
  loai_van_ban: string;
  noi_ban_hanh: string;
  tinh_trang: string;
  date_from: string;
  date_to: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [allDocuments, setAllDocuments] = useState<LegalDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    loai_van_ban: '',
    noi_ban_hanh: '',
    tinh_trang: '',
    date_from: '',
    date_to: ''
  });
  const [tempFilters, setTempFilters] = useState<SearchFilters>({
    loai_van_ban: '',
    noi_ban_hanh: '',
    tinh_trang: '',
    date_from: '',
    date_to: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const ITEMS_PER_PAGE = 10;

  // Get unique filter options
  const [filterOptions, setFilterOptions] = useState({
    loai_van_ban: [] as string[],
    noi_ban_hanh: [] as string[],
    tinh_trang: [] as string[]
  });

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const performSearch = useCallback(() => {
    let results = allDocuments;

    // Text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      results = results.filter(doc => {
        const searchableText = `${doc.title} ${doc.cleaned_content} ${doc.so_hieu} ${doc.noi_ban_hanh}`.toLowerCase();
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.loai_van_ban) {
      results = results.filter(doc => doc.loai_van_ban === filters.loai_van_ban);
    }
    if (filters.noi_ban_hanh) {
      results = results.filter(doc => doc.noi_ban_hanh === filters.noi_ban_hanh);
    }
    if (filters.tinh_trang) {
      results = results.filter(doc => doc.tinh_trang === filters.tinh_trang);
    }

    // Date filtering
    if (filters.date_from || filters.date_to) {
      results = results.filter(doc => {
        const docDate = parseVietnameseDate(doc.ngay_ban_hanh);
        if (!docDate) return false; // Skip invalid dates
        
        if (filters.date_from) {
          const fromDate = new Date(filters.date_from);
          if (docDate < fromDate) return false;
        }
        if (filters.date_to) {
          const toDate = new Date(filters.date_to);
          if (docDate > toDate) return false;
        }
        return true;
      });
    }

    setFilteredDocuments(results);
  }, [allDocuments, query, filters]);

  // Debounced search effect
  useEffect(() => {
    if (allDocuments.length > 0) {
      setSearchLoading(true);
      
      const searchTimeout = setTimeout(() => {
        performSearch();
        setSearchLoading(false);
      }, 500); // 500ms delay

      return () => {
        clearTimeout(searchTimeout);
      };
    }
  }, [query, filters, allDocuments, performSearch]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const documents = await loadLegalDocuments();
      setAllDocuments(documents);
      
      // Extract unique filter options
      const loaiVanBan = [...new Set(documents.map(doc => doc.loai_van_ban).filter(Boolean))];
      const noiBanHanh = [...new Set(documents.map(doc => doc.noi_ban_hanh).filter(Boolean))];
      const tinhTrang = [...new Set(documents.map(doc => doc.tinh_trang).filter(Boolean))];
      
      setFilterOptions({
        loai_van_ban: loaiVanBan,
        noi_ban_hanh: noiBanHanh,
        tinh_trang: tinhTrang
      });
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      loai_van_ban: '',
      noi_ban_hanh: '',
      tinh_trang: '',
      date_from: '',
      date_to: ''
    });
    setTempFilters({
      loai_van_ban: '',
      noi_ban_hanh: '',
      tinh_trang: '',
      date_from: '',
      date_to: ''
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const hasFilterChanges = JSON.stringify(filters) !== JSON.stringify(tempFilters);

  // Pagination calculations
  const totalResults = filteredDocuments.length;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageDocuments = filteredDocuments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const highlightText = (text: string, query: string): { __html: string } => {
    if (!query.trim()) return { __html: text };
    
    const terms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    });
    
    return { __html: highlightedText };
  };

  // Check if text contains any search terms (for highlighting validation)
  const hasHighlight = (text: string, query: string): boolean => {
    if (!query.trim()) return false;
    
    const terms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const textLower = text.toLowerCase();
    
    return terms.some(term => textLower.includes(term));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tìm kiếm văn bản pháp luật
              </h1>
              <p className="text-gray-600 mt-1">
                {query ? `Kết quả tìm kiếm cho: "${query}"` : 'Tìm kiếm trong cơ sở dữ liệu văn bản pháp luật'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Bộ lọc tìm kiếm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Document Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại văn bản
                    </label>
                    <select
                      value={tempFilters.loai_van_ban}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, loai_van_ban: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.loai_van_ban.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Issuing Authority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nơi ban hành
                    </label>
                    <select
                      value={tempFilters.noi_ban_hanh}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, noi_ban_hanh: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.noi_ban_hanh.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tình trạng
                    </label>
                    <select
                      value={tempFilters.tinh_trang}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, tinh_trang: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.tinh_trang.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày ban hành
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={tempFilters.date_from}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, date_from: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Từ ngày"
                      />
                      <input
                        type="date"
                        value={tempFilters.date_to}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, date_to: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Đến ngày"
                      />
                    </div>
                  </div>

                  {/* Apply and Reset Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={applyFilters}
                      disabled={!hasFilterChanges}
                      className="flex-1"
                    >
                      Áp dụng
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetFilters}
                      className="flex-1"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-medium">{startIndex + 1}-{Math.min(endIndex, totalResults)}</span> trong số <span className="font-medium">{totalResults}</span> kết quả
                  {query && ` cho từ khóa "${query}"`}
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-500">
                    Trang {currentPage} / {totalPages}
                  </p>
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="relative">
              {searchLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <LoadingSpinner size="md" text="Đang tìm kiếm..." />
                </div>
              )}
              
              <div className="space-y-6">
              {currentPageDocuments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không tìm thấy kết quả
                    </h3>
                    <p className="text-gray-600">
                      Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc
                    </p>
                  </CardContent>
                </Card>
              ) : (
                currentPageDocuments.map((doc) => {
                  // Check if document has any visible highlights
                  const hasAnyHighlight = query.trim() && (
                    hasHighlight(doc.title, query) ||
                    hasHighlight(doc.cleaned_content || '', query) ||
                    hasHighlight(doc.so_hieu, query) ||
                    hasHighlight(doc.noi_ban_hanh, query)
                  );

                  // If searching but no highlights, skip this document
                  if (query.trim() && !hasAnyHighlight) {
                    return null;
                  }

                  return (
                    <Card key={doc._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              <span dangerouslySetInnerHTML={highlightText(doc.title, query)} />
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span dangerouslySetInnerHTML={highlightText(doc.so_hieu, query)} />
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span dangerouslySetInnerHTML={highlightText(doc.noi_ban_hanh, query)} />
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatVietnameseDate(doc.ngay_ban_hanh)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="secondary">{doc.loai_van_ban}</Badge>
                            <Badge variant={doc.tinh_trang === 'Còn hiệu lực' ? 'default' : 'outline'}>
                              {doc.tinh_trang}
                            </Badge>
                          </div>
                        </div>

                        {doc.cleaned_content && (
                          <div className="mb-4">
                            <p className="text-gray-700 line-clamp-3">
                              <span dangerouslySetInnerHTML={highlightText(
                                doc.cleaned_content.substring(0, 200) + (doc.cleaned_content.length > 200 ? '...' : ''),
                                query
                              )} />
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Người ký: <span className="font-medium">{doc.nguoi_ky}</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                              <ExternalLink className="w-4 h-4" />
                              Xem chi tiết
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }).filter(Boolean)
              )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}