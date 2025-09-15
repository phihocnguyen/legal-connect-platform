import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function RealCases() {
  const cases = [
    {
      title: "Thủ tục đăng ký thường trú cho trẻ em mới sinh",
      category: "Hộ tịch",
      link: "/tinh-huong/thu-tuc-dang-ky-thuong-tru"
    },
    {
      title: "Quyền thừa kế của con riêng khi bố mẹ kết hôn",
      category: "Thừa kế",
      link: "/tinh-huong/quyen-thua-ke-con-rieng"
    },
    {
      title: "Thủ tục ly hôn đơn phương khi vợ/chồng bỏ đi biệt tích",
      category: "Hôn nhân",
      link: "/tinh-huong/ly-hon-don-phuong"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Tình huống thực tế
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cases.map((item, i) => (
            <div key={i} className="space-y-1">
              <a
                href={item.link}
                className="block text-sm font-medium text-[#004646] hover:text-[#005c5c]"
              >
                {item.title}
              </a>
              <div className="text-xs text-gray-500">{item.category}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
