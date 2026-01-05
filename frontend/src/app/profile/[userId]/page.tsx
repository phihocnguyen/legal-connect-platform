"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLoadingState } from "@/hooks/use-loading-state";
import { useUserProfile } from "@/hooks/use-user-cases";
import { useAuth } from "@/contexts/auth-context";
import { usePostUseCases } from "@/hooks/use-post-cases";
import { UserProfile, PostDto } from "@/domain/entities";
import { Mail, Heart, MessageSquare, Eye, Calendar, Edit2, Save, X, MessageCircle, Camera } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { getUserProfile } = useUserProfile();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<PostDto[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [profileViews, setProfileViews] = useState(0);
  const { getAllPosts } = usePostUseCases();
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [backLabel, setBackLabel] = useState<string>("Trang chủ");

  const isSelfView = currentUser?.id === profile?.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        startLoading("Đang tải profile...");

        const profileData = await getUserProfile(parseInt(userId));
        if (profileData) {
          setProfile(profileData);
          setEditForm({
            fullName: profileData.fullName || "",
            phoneNumber: profileData.phoneNumber || "",
            bio: "",
          });
        } else {
          setError("Không thể tải profile. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Không thể tải profile. Vui lòng thử lại.");
      } finally {
        stopLoading();
      }
    };

    loadProfile();
  }, [userId, startLoading, stopLoading, getUserProfile]);

  useEffect(() => {
    if (profile) {
      const key = `profile_views_${profile.id}`;
      const currentViews = parseInt(localStorage.getItem(key) || "1") + 1;
      setProfileViews(currentViews);
      localStorage.setItem(key, currentViews.toString());
    }
  }, [profile?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      if (referrer.includes("/forum/")) {
        setBackUrl(referrer);
        setBackLabel("← Quay lại bài viết");
      } else {
        setBackUrl("/");
        setBackLabel("Trang chủ");
      }
    }
  }, []);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (!userId || !profile) return;
      
      try {
        setPostsLoading(true);
        const response = await getAllPosts({
          page: 0,
          size: 1,
          sort: "createdAt,desc"
        });
        if (response && response.content) {
          const authorPosts = response.content.filter(
            (post: PostDto) => post.author.id === parseInt(userId)
          );
          setUserPosts(authorPosts);
        }
      } catch (err) {
        console.error("Error loading user posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    loadUserPosts();
  }, [userId, profile, getAllPosts]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        fullName: profile?.fullName || "",
        phoneNumber: profile?.phoneNumber || "",
        bio: "",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      toast.success("Cập nhật profile thành công!");
      setIsEditing(false);
      
      if (profile) {
        setProfile({
          ...profile,
          fullName: editForm.fullName,
          phoneNumber: editForm.phoneNumber,
          avatar: avatarPreview || profile.avatar,
        });
      }
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật profile. Vui lòng thử lại!");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getRoleDisplayName = (role: string | undefined): string => {
    const roleStr = role?.toLowerCase() || "user";
    if (roleStr === "lawyer") return "Luật sư";
    if (roleStr === "admin") return "Quản trị viên";
    return "Thành viên";
  };

  const isLawyer = profile?.role?.toLowerCase() === "lawyer";
  const verifiedStatus = isLawyer || profile?.lawyerVerified;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-gray-600">
          Không tìm thấy người dùng
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          {backUrl && (
            <>
              <Link href={backUrl} className="hover:text-[#004646]">
                {backLabel.includes("←") ? backLabel : backLabel}
              </Link>
              <span>→</span>
            </>
          )}
          <span className="text-gray-900">{profile.fullName}</span>
        </nav>
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-sm border-gray-200">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex-shrink-0 relative">
                <div className="relative w-32 h-32 group">
                  <Avatar className="w-32 h-32 border-4 border-[#004646]">
                    <AvatarImage src={avatarPreview || profile.avatar || undefined} alt={profile.fullName} />
                    <AvatarFallback className="text-3xl">{profile.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isSelfView && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* User Info & Actions */}
              <div className="flex-1">
                <div className="mb-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Họ và tên
                        </label>
                        <Input
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="text-2xl font-bold h-12"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profile.fullName}
                      </h1>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={verifiedStatus ? "default" : "secondary"} className={verifiedStatus ? "bg-[#004646]" : ""}>
                          {getRoleDisplayName(profile.role)}
                        </Badge>
                        {verifiedStatus && (
                          <Badge className="bg-green-500">✓ Đã xác minh</Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Info Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  
                  {isEditing ? (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Số điện thoại
                      </label>
                      <Input
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  ) : (
                    profile.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📱</span>
                        <span>{profile.phoneNumber}</span>
                      </div>
                    )
                  )}
                  
                  {!isEditing && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Tham gia {formatDistanceToNow(new Date(profile.joinedAt), { 
                          addSuffix: true,
                          locale: vi 
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isSelfView ? (
                    <>
                      {isEditing ? (
                        <>
                          <Button 
                            className="bg-[#004646] hover:bg-[#005555] text-white"
                            onClick={handleSaveProfile}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Lưu thay đổi
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleEditToggle}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="bg-[#004646] hover:bg-[#005555] text-white"
                          onClick={handleEditToggle}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button className="bg-[#004646] hover:bg-[#005555] text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Nhắn tin
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#004646] text-[#004646] hover:bg-[#004646]/10"
                        onClick={() => setIsFollowing(!isFollowing)}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            isFollowing ? "fill-current" : ""
                          }`}
                        />
                        {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Bài viết</p>
                  <p className="text-3xl font-bold text-[#004646]">{profile.postCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#004646]/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#004646]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Phản hồi</p>
                  <p className="text-3xl font-bold text-[#004646]">{profile.replyCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#004646]/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#004646]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Hoạt động</p>
                  <p className="text-3xl font-bold text-[#004646]">{profile.postCount + profile.replyCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#004646]/10 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#004646]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Lượt xem</p>
                  <p className="text-3xl font-bold text-[#004646]">{profileViews}</p>
                </div>
                <div className="w-12 h-12 bg-[#004646]/10 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#004646]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
            {/* About Section */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  GIỚI THIỆU
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Giới thiệu về bản thân..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {editForm.bio || (profile.lawyerVerified 
                      ? "Luật sư đã được xác minh. Sẵn sàng tư vấn các vấn đề pháp lý."
                      : "Thành viên của cộng đồng Legal Connect.")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity Section */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {profile.postCount > 0 ? `${Math.min(5, profile.postCount)} BÀI VIẾT GẦN ĐÂY` : "HOẠT ĐỘNG GẦN ĐÂY"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Đang tải bài viết...
                  </p>
                ) : userPosts.length > 0 ? (
                  <div className="divide-y">
                    {userPosts.map((post) => (
                      <div key={post.id} className="py-4 hover:bg-gray-50 px-2 rounded transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/forum/${post.category.slug}/${post.slug}`}
                              className="text-sm font-semibold text-gray-900 hover:text-[#004646] line-clamp-2 block"
                            >
                              {post.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 text-xs"
                              >
                                {post.category.name}
                              </Badge>
                              <span className="text-gray-500">
                                {formatDate(post.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right shrink-0 whitespace-nowrap">
                            <div className="mb-1">{post.replyCount} phản hồi</div>
                            <div>{post.views} lượt xem</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Chưa có bài viết nào
                  </p>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
