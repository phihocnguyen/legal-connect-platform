import { Scale, BookText, MessageSquare, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  disabled?: boolean;
}

export function WelcomeScreen({ onPromptClick, disabled }: WelcomeScreenProps) {
  const prompts = [
    {
      title: "Tư vấn luật lao động",
      prompt: "Quyền lợi của người lao động khi nghỉ việc theo luật hiện hành là gì?",
      icon: <Briefcase className="w-4 h-4 text-orange-500" />,
    },
    {
      title: "Thủ tục doanh nghiệp",
      prompt: "Hướng dẫn thủ tục đăng ký kinh doanh cho công ty startup công nghệ.",
      icon: <BookText className="w-4 h-4 text-blue-500" />,
    },
    {
      title: "Tranh chấp hợp đồng",
      prompt: "Tôi cần làm gì khi đối tác vi phạm hợp đồng kinh tế? Cần chuẩn bị hồ sơ gì?",
      icon: <Scale className="w-4 h-4 text-purple-500" />,
    },
    {
      title: "Soạn thảo văn bản",
      prompt: "Giúp tôi soạn thảo một mẫu hợp đồng lao động không xác định thời hạn.",
      icon: <MessageSquare className="w-4 h-4 text-green-500" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full flex flex-col items-center space-y-8"
      >
        {/* Logo Branding */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
            <Scale className="w-6 h-6 text-gray-800" />
          </div>
          <h2 className="text-2xl font-medium text-gray-900">
            Tôi có thể giúp gì cho bạn hôm nay?
          </h2>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {prompts.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => !disabled && onPromptClick(item.prompt)}
              disabled={disabled}
              className={`flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl transition-all duration-200 text-left group
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50/80 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                {item.icon}
                <span className="font-medium text-gray-900 text-sm">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {item.prompt}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
