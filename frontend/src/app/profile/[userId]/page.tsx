"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfilePosts } from "@/components/profile/profile-posts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLoadingState } from "@/hooks/use-loading-state";
import { useUserProfile } from "@/hooks/use-user-cases";
import { UserProfile, UserPost } from "@/domain/entities";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { getUserProfile, getUserPosts } = useUserProfile();

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        startLoading("Đang tải profile...");

        const profileData = await getUserProfile(parseInt(userId));
        if (profileData) {
          setProfile(profileData);

          const postsData = await getUserPosts(parseInt(userId));
          if (postsData) {
            setUserPosts(postsData.content);
          }
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
  }, [userId, startLoading, stopLoading, getUserProfile, getUserPosts]);

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
    <div className="container mx-auto py-8 space-y-8">
      <ProfileHeader user={profile} />
      <ProfileStats />
      <ProfilePosts posts={userPosts} user={profile} />
    </div>
  );
}
