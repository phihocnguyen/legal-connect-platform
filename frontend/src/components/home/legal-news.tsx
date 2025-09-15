import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function LegalNews() {
  const news = [
    {
      title: "Nghị quyết 103/2023/QH15 về dự toán ngân sách nhà nước năm 2024",
      date: "12/01/2024",
      link: "/tin-tuc/nghi-quyet-103-2023"
    },
    {
      title: "Thông tư 23/2023/TT-NHNN sửa đổi lãi suất tái cấp vốn",
      date: "10/01/2024", 
      link: "/tin-tuc/thong-tu-23-2023"
    },
    {
      title: "Nghị định 116/2023/NĐ-CP về hóa đơn điện tử",
      date: "09/01/2024",
      link: "/tin-tuc/nghi-dinh-116-2023"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Tin tức pháp luật</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item, i) => (
            <div key={i} className="space-y-1">
              <a 
                href={item.link}
                className="block text-sm font-medium text-[#004646] hover:text-[#005c5c]"
              >
                {item.title}
              </a>
              <div className="text-xs text-gray-500">{item.date}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
