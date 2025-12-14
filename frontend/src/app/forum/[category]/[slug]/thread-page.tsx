"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { usePostUseCases } from "@/hooks/use-post-cases";
import { PostDto, PostReplyDto, UserRole } from "@/domain/entities";
import { useLoadingState } from "@/hooks/use-loading-state";
import { Editor } from "@tinymce/tinymce-react";
import { Flag, Reply, X } from "lucide-react";
import { ReportPostDialog } from "@/components/forum/report-post-dialog";

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";

interface ThreadPageProps {
  category: string;
  slug: string;
}

export function ThreadPageContent({ category, slug }: ThreadPageProps) {
  const [post, setPost] = useState<PostDto | null>(null);
  const [replies, setReplies] = useState<PostReplyDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [quotedReply, setQuotedReply] = useState<PostReplyDto | null>(null);

  const {
    getPostBySlug,
    getRepliesByPost,
    addReply,
    getPostsByCategory,
    incrementPostViews,
  } = usePostUseCases();
  const { startLoading, stopLoading } = useLoadingState();
  const [relatedPosts, setRelatedPosts] = useState<PostDto[]>([]);

  useEffect(() => {
    const loadPostData = async () => {
      try {
        startLoading("Đang tải...");
        setError(null);

        const postData = await getPostBySlug(category, slug);

        const [repliesData, relatedData] = await Promise.all([
          getRepliesByPost(postData.id),
          getPostsByCategory(category, {
            page: 0,
            size: 10,
            sort: "lastReplyAt,desc",
          }).catch(() => ({ content: [] })),
        ]);

        setPost(postData);
        setReplies(repliesData);

        const items: PostDto[] = relatedData?.content || relatedData || [];
        setRelatedPosts((items as PostDto[]).filter((p) => p.slug !== slug));
      } catch (err) {
        console.error("Error loading post data:", err);
        setError(
          err instanceof Error ? err.message : "Không thể tải dữ liệu bài viết"
        );
      } finally {
        stopLoading();
      }
    };

    loadPostData();
  }, [
    slug,
    category,
    getPostBySlug,
    getRepliesByPost,
    getPostsByCategory,
    startLoading,
    stopLoading,
  ]);

  useEffect(() => {
    if (!post) return;

    const timer = setTimeout(() => {
      incrementPostViews(category, slug).catch((err) => {
        console.error("Error incrementing views:", err);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [post, category, slug, incrementPostViews]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim() || !post) return;

    try {
      setSubmittingReply(true);
      const newReply = await addReply(post.id, {
        content: replyContent.trim(),
        parentId: quotedReply?.id,
      });

      setReplies((prev) => [...prev, newReply]);
      setReplyContent("");
      setQuotedReply(null);
    } catch (err) {
      console.error("Error submitting reply:", err);
      alert("Không thể gửi trả lời. Vui lòng thử lại.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleQuoteReply = (reply: PostReplyDto) => {
    setQuotedReply(reply);

    // Strip HTML tags for the quote preview
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = reply.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    const quoteHtml = `
      <blockquote style="border-left: 4px solid #004646; padding-left: 12px; margin: 12px 0; color: #666; background: #f5f5f5; padding: 8px 12px; border-radius: 4px;">
        <strong>${reply.author.name} said:</strong><br/>
        ${textContent.substring(0, 200)}${textContent.length > 200 ? "..." : ""}
      </blockquote>
      <p><br/></p>
    `;

    setReplyContent(quoteHtml);

    // Scroll to reply form
    setTimeout(() => {
      document
        .getElementById("reply-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelQuote = useCallback(() => {
    setQuotedReply(null);
    setReplyContent("");
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Smart related posts sorting: prioritize same labels/tags
  const sortedRelatedPosts = useMemo(() => {
    if (!post || relatedPosts.length === 0) return [];

    const currentLabels = new Set(post.labels?.map((l) => l.id) || []);
    const currentTags = new Set(post.tags || []);

    return relatedPosts
      .map((p) => {
        // Calculate relevance score
        let score = 0;

        // Same label bonus (high priority)
        const matchingLabels = (p.labels || []).filter((l) =>
          currentLabels.has(l.id)
        ).length;
        score += matchingLabels * 10;

        // Same tag bonus
        const matchingTags = (p.tags || []).filter((t) =>
          currentTags.has(t)
        ).length;
        score += matchingTags * 5;

        // Recent activity bonus
        if (p.lastReplyAt) {
          const hoursSinceReply =
            (Date.now() - new Date(p.lastReplyAt).getTime()) / (1000 * 60 * 60);
          score += Math.max(0, 24 - hoursSinceReply) / 24; // Bonus for recent replies
        }

        return { post: p, score, hasSharedLabel: matchingLabels > 0 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [post, relatedPosts]);

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case "lawyer":
        return "luật sư";
      case "admin":
        return "quản trị viên";
      case "user":
        return "thành viên";
      default:
        return "thành viên";
    }
  };

  const getRoleBadgeStyle = (role: UserRole): string => {
    switch (role) {
      case "lawyer":
        return "bg-[#004646] text-white";
      case "admin":
        return "bg-red-600 text-white";
      case "user":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  if (error || !post) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Không tìm thấy bài viết"}
          </p>
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
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Post */}
      <div
        className={`bg-white rounded-lg shadow mb-6 ${
          post.author.role === "lawyer"
            ? "ring-2 ring-[#004646]/20 shadow-lg shadow-emerald-50"
            : ""
        }`}
      >
        <div className="p-6">
          <div className="flex gap-6">
            {/* Author Info */}
            <div className="w-48 flex flex-col items-center text-center bg-gray-100 p-4 rounded-lg">
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
              <div className="font-semibold text-gray-900">
                {post.author.name}
              </div>
              <Badge className={`mt-1 ${getRoleBadgeStyle(post.author.role)}`}>
                {getRoleDisplayName(post.author.role)}
              </Badge>
              <div className="mt-3 text-sm text-gray-500">
                <div>ID: {post.author.id}</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-gray-500">
                  {formatDate(post.createdAt)}
                </span>
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
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
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
            <div
              key={reply.id}
              className={`bg-white rounded-lg shadow ${
                reply.author.role === "lawyer"
                  ? "ring-2 ring-[#004646]/20 shadow-lg shadow-emerald-50"
                  : ""
              }`}
            >
              <div className="p-6">
                <div className="flex gap-6">
                  <div className="w-48 flex flex-col items-center text-center bg-gray-100 p-4 rounded-lg">
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
                    <div className="font-semibold text-gray-900">
                      {reply.author.name}
                    </div>
                    <Badge
                      className={`mt-1 ${getRoleBadgeStyle(reply.author.role)}`}
                    >
                      {getRoleDisplayName(reply.author.role)}
                    </Badge>
                    <div className="mt-3 text-sm text-gray-500">
                      <div>ID: {reply.author.id}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(reply.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuoteReply(reply)}
                        className="text-gray-500 hover:text-[#004646]"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Trả lời
                      </Button>
                    </div>
                    <div className="prose max-w-none whitespace-pre-wrap">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />
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

        {/* Quote Preview */}
        {quotedReply && (
          <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-medium text-orange-700">
                Đang trả lời:{" "}
                <span className="font-semibold">{quotedReply.author.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelQuote}
                className="text-orange-600 hover:text-orange-800 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    quotedReply.content.substring(0, 150) +
                    (quotedReply.content.length > 150 ? "..." : ""),
                }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitReply}>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={replyContent}
            onEditorChange={(content: string) => setReplyContent(content)}
            init={{
              menubar: false,
              height: 200,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "insertdatetime",
                "table",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic underline | bullist numlist | link | code",
              placeholder: quotedReply
                ? `Trả lời ${quotedReply.author.name}...`
                : "Viết câu trả lời của bạn...",
            }}
            disabled={submittingReply}
          />
          <div className="mt-4 flex justify-end gap-2">
            {quotedReply && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelQuote}
                disabled={submittingReply}
              >
                Hủy
              </Button>
            )}
            <Button
              type="submit"
              disabled={!replyContent.trim() || submittingReply}
            >
              {submittingReply ? "Đang gửi..." : "Gửi trả lời"}
            </Button>
          </div>
        </form>
      </div>

      {/* Report Dialog */}
      {/* Related posts (shown below reply form) */}
      {sortedRelatedPosts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>Bài viết liên quan</span>
            <Badge variant="secondary" className="text-sm">
              {sortedRelatedPosts.length}
            </Badge>
          </h3>
          <div className="space-y-4">
            {sortedRelatedPosts.map(({ post: p, hasSharedLabel }) => (
              <Link
                key={p.id}
                href={`/forum/${category}/${p.slug}`}
                className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-semibold text-gray-900 line-clamp-2">
                        {p.title}
                      </h4>
                      {hasSharedLabel && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0"
                        >
                          Cùng chủ đề
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="text-[#004646] font-medium">
                        {p.author?.name}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      {p.labels && p.labels.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1 flex-wrap">
                            {p.labels.slice(0, 2).map((label) => (
                              <span
                                key={label.id}
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${label.color}20`,
                                  color: label.color,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Last reply info */}
                    {p.lastReplyAt && p.replies && p.replies.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Avatar className="w-5 h-5">
                          {p.replies[p.replies.length - 1]?.author?.avatar && (
                            <Image
                              src={
                                p.replies[p.replies.length - 1].author.avatar
                              }
                              alt={p.replies[p.replies.length - 1].author.name}
                              width={20}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </Avatar>
                        <span className="text-xs">
                          Trả lời cuối bởi{" "}
                          <span className="font-medium text-gray-700">
                            {p.replies[p.replies.length - 1]?.author?.name}
                          </span>
                          {" • "}
                          {new Date(p.lastReplyAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-semibold text-base text-gray-800">
                        {p.replyCount}
                      </div>
                      <div className="text-xs">trả lời</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-base text-gray-800">
                        {p.views}
                      </div>
                      <div className="text-xs">lượt xem</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
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
