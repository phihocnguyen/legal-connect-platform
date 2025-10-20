'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { usePostUseCases } from '@/hooks/use-post-cases';
import { PostDto, PostReplyDto, UserRole } from '@/domain/entities';
import { useLoadingState } from '@/hooks/use-loading-state';
import { Editor } from '@tinymce/tinymce-react';
import { Flag } from 'lucide-react';
import { ReportPostDialog } from '@/components/forum/report-post-dialog';

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

interface ThreadPageProps {
  category: string;
  threadId: string;
}

export function ThreadPageContent({ category, threadId }: ThreadPageProps) {
  const [post, setPost] = useState<PostDto | null>(null);
  const [replies, setReplies] = useState<PostReplyDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const { getPostById, getRepliesByPost, addReply } = usePostUseCases();
  const { startLoading, stopLoading } = useLoadingState();

  useEffect(() => {
    const loadPostData = async () => {
    try {
      startLoading('Đang tải...');
      setError(null);        const postId = parseInt(threadId);
        if (isNaN(postId)) {
          throw new Error('ID bài viết không hợp lệ');
        }
        const [postData, repliesData] = await Promise.all([
          getPostById(postId),
          getRepliesByPost(postId)
        ]);

        setPost(postData);
        setReplies(repliesData);
      } catch (err) {
        console.error('Error loading post data:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bài viết');
      } finally {
        stopLoading();
      }
    };

    loadPostData();
  }, [threadId, getPostById, getRepliesByPost, startLoading, stopLoading]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim() || !post) return;

    try {
      setSubmittingReply(true);
      const newReply = await addReply(post.id, {
        content: replyContent.trim()
      });

      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Không thể gửi trả lời. Vui lòng thử lại.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'LAWYER': return 'Luật sư';
      case 'ADMIN': return 'Quản trị viên';
      case 'USER': return 'Thành viên';
      default: return 'Thành viên';
    }
  };

  const getRoleBadgeStyle = (role: UserRole): string => {
    switch (role) {
      case 'LAWYER': return 'bg-[#004646] text-white';
      case 'ADMIN': return 'bg-red-600 text-white';
      case 'USER': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  if (error || !post) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài viết'}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/forum">Diễn đàn</Link>
        <span>→</span>
        <Link href={`/forum/${category}`}>{post.category.name}</Link>
        <span>→</span>
        <span className="truncate">{post.title}</span>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>{post.views} lượt xem</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span>{post.replyCount} trả lời</span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Post */}
      <div className={`bg-white rounded-lg shadow mb-6 ${
        post.author.role === 'LAWYER' 
          ? 'ring-2 ring-[#004646]/20 shadow-lg shadow-emerald-50' 
          : ''
      }`}>
        <div className="p-6">
          <div className="flex gap-6">
            {/* Author Info */}
            <div className="w-48 flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-3">
                {post.author.avatar && (
                  <Image 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    width={80}
                    height={80}
                    className="w-full h-full object-cover" 
                  />
                )}
              </Avatar>
              <div className="font-semibold text-gray-900">{post.author.name}</div>
              <Badge className={`mt-1 ${getRoleBadgeStyle(post.author.role)}`}>
                {getRoleDisplayName(post.author.role)}
              </Badge>
              <div className="mt-3 text-sm text-gray-500">
                <div>ID: {post.author.id}</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Tác giả bài viết</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setReportDialogOpen(true)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Báo cáo
                  </Button>
                </div>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">
                    {post.views} lượt xem • {post.replyCount} trả lời
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-6">
          {replies.map((reply) => (
            <div key={reply.id} className={`bg-white rounded-lg shadow ${
              reply.author.role === 'LAWYER' 
                ? 'ring-2 ring-[#004646]/20 shadow-lg shadow-emerald-50' 
                : ''
            }`}>
              <div className="p-6">
                <div className="flex gap-6">
                  <div className="w-48 flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-3">
                      {reply.author.avatar && (
                        <Image 
                          src={reply.author.avatar} 
                          alt={reply.author.name} 
                          width={80}
                          height={80}
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </Avatar>
                    <div className="font-semibold text-gray-900">{reply.author.name}</div>
                    <Badge className={`mt-1 ${getRoleBadgeStyle(reply.author.role)}`}>
                      {getRoleDisplayName(reply.author.role)}
                    </Badge>
                    <div className="mt-3 text-sm text-gray-500">
                      <div>ID: {reply.author.id}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                    </div>
                    <div className="prose max-w-none whitespace-pre-wrap">
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: reply.content }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div id="reply-form" className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Trả lời</h3>
        <form onSubmit={handleSubmitReply}>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={replyContent}
            onEditorChange={(content: string) => setReplyContent(content)}
            init={{
              menubar: false,
              height: 200,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview', 'anchor',
                'searchreplace', 'visualblocks', 'code', 'insertdatetime', 'table', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | formatselect | bold italic underline | bullist numlist | link | code',
              placeholder: 'Viết câu trả lời của bạn...'
            }}
            disabled={submittingReply}
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Hỗ trợ định dạng văn bản
            </div>
            <Button type="submit" disabled={!replyContent.trim() || submittingReply}>
              {submittingReply ? 'Đang gửi...' : 'Gửi trả lời'}
            </Button>
          </div>
        </form>
      </div>

      {/* Report Dialog */}
      {post && (
        <ReportPostDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          postId={post.id}
        />
      )}
    </div>
  );
}
