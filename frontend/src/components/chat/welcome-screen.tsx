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
    <div className="py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-4 bg-teal-100 rounded-full">
            <Bot className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Chào mừng đến với Legal Assistant
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Tôi là trợ lý AI được đào tạo để tư vấn về các vấn đề pháp lý tại Việt Nam.
          Tôi có thể giúp bạn tìm hiểu về luật pháp, thủ tục hành chính, và giải đáp các thắc mắc của bạn.
        </p>
      </div>

      {/* Capabilities */}
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
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
          <Card key={i} className="p-4 hover:bg-stone-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-teal-50 rounded-lg">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Example Prompts */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
          Hãy thử hỏi tôi
        </h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {examplePrompts.map((prompt, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start gap-2 py-6 text-left hover:bg-stone-50"
              onClick={() => onPromptClick(prompt.prompt)}
            >
              {prompt.icon}
              <span>{prompt.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
