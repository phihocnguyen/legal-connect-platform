import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, Eye, Trophy } from "lucide-react";
// import { UserProfile } from "@/domain/entities";

// interface ProfileStatsProps {
//   user?: UserProfile;
// }

export function ProfileStats() {
  // Mock stats - in real app, these would come from API
  // TODO: Use user prop when implementing real stats from API
  const stats = {
    posts: 295,
    replies: 1250,
    views: 25000,
    likes: 850,
    reputation: 1850,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Bài viết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#004646]">{stats.posts}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Phản hồi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#004646]">
            {stats.replies}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Lượt xem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#004646]">
            {stats.views.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Reaction score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#004646]">{stats.likes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Điểm thành tích
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#004646]">
            {stats.reputation}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
