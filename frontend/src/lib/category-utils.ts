/**
 * Utility functions for extracting and processing legal document categories
 */

export interface LegalCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
  color?: string;
}

/**
 * Trích xuất category slug từ URL thuvienphapluat.vn
 * @param url - URL của văn bản pháp luật
 * @returns category slug hoặc null nếu không tìm thấy
 */
export function extractCategoryFromUrl(url: string): string | null {
  const match = url.match(/\/van-ban\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Chuyển đổi category slug thành tên hiển thị tiếng Việt
 * @param slug - Category slug từ URL
 * @returns tên category tiếng Việt
 */
export function categorySlugToName(slug: string): string {
  const categoryMap: Record<string, string> = {
    'Bo-may-hanh-chinh': 'Bộ máy hành chính',
    'Doanh-nghiep': 'Doanh nghiệp',
    'Lao-dong-Tien-luong': 'Lao động - Tiền lương',
    'Dat-dai': 'Đất đai',
    'Thue-Phi-Le-Phi': 'Thuế - Phí - Lệ phí',
    'Tai-chinh-nha-nuoc': 'Tài chính nhà nước',
    'Xay-dung-Do-thi': 'Xây dựng - Đô thị',
    'Giao-duc': 'Giáo dục',
    'Y-te': 'Y tế',
    'Van-hoa-Xa-hoi': 'Văn hóa - Xã hội',
    'Moi-truong': 'Môi trường',
    'Giao-thong-Van-tai': 'Giao thông - Vận tải',
    'Cong-nghiep': 'Công nghiệp',
    'Nong-nghiep-Lam-nghiep': 'Nông nghiệp - Lâm nghiệp',
    'Thuong-mai': 'Thương mại',
    'Dau-tu': 'Đầu tư',
    'Ngan-hang': 'Ngân hàng',
    'Bao-hiem': 'Bảo hiểm',
    'Tien-te-Ngan-hang': 'Tiền tệ - Ngân hàng',
    'Thi-dua-Khen-thuong': 'Thi đua - Khen thưởng',
    'Dan-su': 'Dân sự',
    'Hinh-su': 'Hình sự',
    'Hanh-chinh': 'Hành chính',
    'Quoc-phong-An-ninh': 'Quốc phòng - An ninh',
    'Cong-an': 'Công an',
    'Tu-phap': 'Tư pháp',
    'Quyen-dan-su': 'Quyền dân sự',
    'Gia-dinh-Hon-nhan': 'Gia đình - Hôn nhân',
    'Tre-em': 'Trẻ em',
    'Nguoi-cao-tuoi': 'Người cao tuổi',
    'Nguoi-khuyet-tat': 'Người khuyết tật',
    'Dan-toc': 'Dân tộc',
    'Ton-giao': 'Tôn giáo',
    'Bao-chi': 'Báo chí',
    'Xuat-ban': 'Xuất bản',
    'The-thao': 'Thể thao',
    'Du-lich': 'Du lịch',
    'Cong-nghe-thong-tin': 'Công nghệ thông tin',
    'Vien-thong': 'Viễn thông',
    'Khoa-hoc-Cong-nghe': 'Khoa học - Công nghệ',
    'So-huu-tri-tue': 'Sở hữu trí tuệ'
  };
  
  return categoryMap[slug] || slug.replace(/-/g, ' ');
}

/**
 * Lấy màu sắc cho category dựa trên loại
 * @param slug - Category slug
 * @returns CSS color class
 */
export function getCategoryColor(slug: string): string {
  const colorMap: Record<string, string> = {
    'Bo-may-hanh-chinh': 'bg-blue-100 text-blue-800',
    'Doanh-nghiep': 'bg-green-100 text-green-800',
    'Lao-dong-Tien-luong': 'bg-purple-100 text-purple-800',
    'Dat-dai': 'bg-orange-100 text-orange-800',
    'Thue-Phi-Le-Phi': 'bg-red-100 text-red-800',
    'Tai-chinh-nha-nuoc': 'bg-indigo-100 text-indigo-800',
    'Xay-dung-Do-thi': 'bg-yellow-100 text-yellow-800',
    'Giao-duc': 'bg-pink-100 text-pink-800',
    'Y-te': 'bg-teal-100 text-teal-800',
    'Van-hoa-Xa-hoi': 'bg-cyan-100 text-cyan-800',
    'Moi-truong': 'bg-green-100 text-green-800',
    'Giao-thong-Van-tai': 'bg-blue-100 text-blue-800',
    'Quoc-phong-An-ninh': 'bg-red-100 text-red-800',
    'Tu-phap': 'bg-gray-100 text-gray-800'
  };
  
  return colorMap[slug] || 'bg-gray-100 text-gray-800';
}

/**
 * Phân tích danh sách văn bản để tạo thống kê categories
 * @param documents - Danh sách văn bản
 * @returns danh sách categories với thống kê
 */
export function analyzeCategoriesFromDocuments(documents: Array<{ link: string }>): LegalCategory[] {
  const categoryStats: Record<string, number> = {};
  
  documents.forEach(doc => {
    const categorySlug = extractCategoryFromUrl(doc.link);
    if (categorySlug) {
      categoryStats[categorySlug] = (categoryStats[categorySlug] || 0) + 1;
    }
  });
  
  return Object.entries(categoryStats)
    .map(([slug, count]) => ({
      id: slug,
      name: categorySlugToName(slug),
      slug,
      count,
      color: getCategoryColor(slug)
    }))
    .sort((a, b) => b.count - a.count); // Sắp xếp theo số lượng giảm dần
}

/**
 * Lấy top categories phổ biến nhất
 * @param categories - Danh sách tất cả categories
 * @param limit - Số lượng categories muốn lấy
 * @returns top categories
 */
export function getTopCategories(categories: LegalCategory[], limit: number = 10): LegalCategory[] {
  return categories.slice(0, limit);
}

/**
 * Tìm kiếm category theo tên hoặc slug
 * @param categories - Danh sách categories
 * @param query - Từ khóa tìm kiếm
 * @returns danh sách categories phù hợp
 */
export function searchCategories(categories: LegalCategory[], query: string): LegalCategory[] {
  const lowercaseQuery = query.toLowerCase();
  return categories.filter(cat => 
    cat.name.toLowerCase().includes(lowercaseQuery) ||
    cat.slug.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Tạo URL filter cho category
 * @param slug - Category slug
 * @returns URL query string
 */
export function createCategoryFilterUrl(slug: string): string {
  return `?category=${encodeURIComponent(slug)}`;
}

/**
 * Demo function để test
 */
export function testCategoryExtraction() {
  const testUrls = [
    "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Nghi-quyet-94-NQ-HDND-2017-Chuong-trinh-giam-sat-cua-Hoi-dong-tinh-Ha-Giang-356885.aspx",
    "https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Luat-So-59-2020-QH14-Doanh-nghiep-442895.aspx",
    "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Luat-So-45-2019-QH14-Lao-dong-426855.aspx"
  ];
  
  testUrls.forEach(url => {
    const category = extractCategoryFromUrl(url);
    console.log(`URL: ${url}`);
    console.log(`Category: ${category}`);
    console.log(`Name: ${category ? categorySlugToName(category) : 'N/A'}`);
    console.log(`Color: ${category ? getCategoryColor(category) : 'N/A'}`);
    console.log('---');
  });
}