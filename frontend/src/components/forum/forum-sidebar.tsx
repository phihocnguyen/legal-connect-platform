import { Card } from "@/components/ui/card";

export function ForumSidebar() {
  const popularTopics = [
    "Thủ tục ly hôn thuận tình",
    "Tranh chấp đất đai",
    "Quyền thừa kế",
    "Bảo vệ quyền lợi người lao động",
    "Thành lập doanh nghiệp"
  ];

  const activeCategories = [
    { name: "Luật Dân sự", posts: 156 },
    { name: "Luật Đất đai", posts: 134 },
    { name: "Luật Lao động", posts: 98 },
    { name: "Luật Hình sự", posts: 87 },
    { name: "Luật Kinh doanh", posts: 76 }
  ];

  return (
    <div className="space-y-6">
      {/* Chủ đề phổ biến */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chủ đề phổ biến</h3>
        <ul className="space-y-2">
          {popularTopics.map((topic, index) => (
            <li key={index} className="text-sm">
              <a href="#" className="text-[#004646] hover:underline">
                {topic}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      {/* Chuyên mục sôi nổi */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chuyên mục sôi nổi</h3>
        <ul className="space-y-2">
          {activeCategories.map((category, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <a href="#" className="text-[#004646] hover:underline">
                {category.name}
              </a>
              <span className="text-gray-500">{category.posts}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Thống kê nhanh */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Thống kê nhanh</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Chủ đề mới hôm nay:</span>
            <span className="font-medium">45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bài viết mới hôm nay:</span>
            <span className="font-medium">234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Thành viên mới hôm nay:</span>
            <span className="font-medium">12</span>
          </div>
        </div>
      </Card>

      {/* Luật sư trực tuyến */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Luật sư đang trực tuyến</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#004646]">LS. Nguyễn Văn A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#004646]">LS. Trần Thị B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#004646]">LS. Phạm Văn C</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          3 luật sư đang sẵn sàng tư vấn
        </div>
      </Card>

      {/* Tags phổ biến */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Tags phổ biến</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">ly hôn</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">thừa kế</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">đất đai</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">hợp đồng</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">lao động</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">tranh chấp</span>
        </div>
      </Card>
    </div>
  );
}
