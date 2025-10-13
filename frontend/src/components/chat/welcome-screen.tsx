import { Bot, BookText, Scale, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

export function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
  const examplePrompts = [
    {
      icon: <Scale className="w-5 h-5" />,
      text: "Giải thích về quyền lợi người lao động khi nghỉ việc",
      prompt: "Theo luật lao động hiện hành, quyền lợi của người lao động khi nghỉ việc bao gồm những gì?"
    },
    {
      icon: <BookText className="w-5 h-5" />,
      text: "Thủ tục đăng ký kinh doanh cho startup",
      prompt: "Tôi muốn thành lập một công ty startup về công nghệ, cần những thủ tục gì?"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      text: "Tư vấn về tranh chấp hợp đồng",
      prompt: "Trong trường hợp đối tác vi phạm hợp đồng kinh doanh, tôi nên làm gì để bảo vệ quyền lợi?"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-8">
      <div className="max-w-4xl w-full space-y-10">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl shadow-sm">
              <Bot className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng đến với Legal Assistant
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Tôi là trợ lý AI được đào tạo để tư vấn về các vấn đề pháp lý tại Việt Nam.
            Tôi có thể giúp bạn tìm hiểu về luật pháp, thủ tục hành chính, và giải đáp các thắc mắc của bạn.
          </p>
        </div>

        {/* Capabilities */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Scale className="w-6 h-6 text-teal-600" />,
              title: "Tư vấn pháp lý",
              desc: "Giải đáp thắc mắc về luật pháp và quy định hiện hành"
            },
            {
              icon: <BookText className="w-6 h-6 text-teal-600" />,
              title: "Hướng dẫn thủ tục",
              desc: "Cung cấp thông tin chi tiết về các thủ tục hành chính"
            },
            {
              icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
              title: "Phân tích case",
              desc: "Phân tích và đề xuất giải pháp cho các tình huống cụ thể"
            }
          ].map((item, i) => (
            <Card key={i} className="p-6 hover:shadow-md transition-all duration-200 border-gray-200">
              <div className="space-y-3">
                <div className="p-3 bg-teal-50 rounded-xl w-fit">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Example Prompts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Hãy thử hỏi tôi
          </h2>
          <div className="space-y-3">
            {examplePrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start gap-3 py-6 px-6 text-left hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 h-auto"
                onClick={() => onPromptClick(prompt.prompt)}
              >
                <div className="p-2 bg-teal-50 rounded-lg shrink-0">
                  {prompt.icon}
                </div>
                <span className="text-gray-700 font-medium">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
