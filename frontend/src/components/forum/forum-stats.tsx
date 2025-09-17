export function ForumStats() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Thống kê diễn đàn</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#004646]">1,245</div>
          <div className="text-sm text-gray-600">Thành viên</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#004646]">5,678</div>
          <div className="text-sm text-gray-600">Chủ đề</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#004646]">23,456</div>
          <div className="text-sm text-gray-600">Bài viết</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#004646]">156</div>
          <div className="text-sm text-gray-600">Đang online</div>
        </div>
      </div>
    </div>
  );
}
