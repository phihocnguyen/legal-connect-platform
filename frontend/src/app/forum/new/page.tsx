'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Editor } from '@tinymce/tinymce-react';

import { usePostUseCases } from '@/hooks/use-post-cases';
import { PostCategoryDto, PostCreateDto } from '@/domain/entities';

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

export default function NewThreadPage() {
  const router = useRouter();
  const { getAllCategories, createPostNew } = usePostUseCases();
  const searchParams = useSearchParams();
  console.log(searchParams)
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // UI states
  const [categories, setCategories] = useState<PostCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        const categorySlug = searchParams.get('category');
        if (categorySlug) {
          const foundCategory = categoriesData.find(cat => cat.slug === categorySlug);
          if (foundCategory) {
            setSelectedCategoryId(foundCategory.id);
          }
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Không thể tải danh sách chuyên mục');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [getAllCategories, searchParams]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 5 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const stripHtmlTags = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId) {
      setError('Vui lòng chọn chuyên mục');
      return;
    }

    if (title.trim().length < 10) {
      setError('Tiêu đề phải có ít nhất 10 ký tự');
      return;
    }

    // Validate content length (strip HTML tags for validation)
    const plainTextContent = stripHtmlTags(content);
    if (plainTextContent.trim().length < 30) {
      setError('Nội dung phải có ít nhất 30 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData: PostCreateDto = {
        title: title.trim(),
        content: content.trim(),
        categoryId: selectedCategoryId,
      };

      const newPost = await createPostNew(postData);
      
      // Navigate to the new post
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category && newPost) {
        router.push(`/forum/${category.slug}/${newPost.id}`);
      } else {
        router.push('/forum');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Không thể tạo bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/forum">Diễn đàn</Link>
        <span>→</span>
        <span>Tạo chủ đề mới</span>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Tạo chủ đề mới
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Chuyên mục</Label>
              {searchParams.get('category') ? (
                // Read-only display when category is pre-selected from URL
                <div className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-700">
                  {categories.find(cat => cat.id === selectedCategoryId)?.name || 'Đang tải...'}
                  <input type="hidden" value={selectedCategoryId || ''} />
                </div>
              ) : (
                // Normal dropdown when no category specified
                <select
                  id="category"
                  value={selectedCategoryId || ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                  disabled={loading}
                >
                  <option value="">Chọn chuyên mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề chủ đề..."
                required
                disabled={loading}
                minLength={10}
              />
              <p className="text-sm text-gray-500">
                Tiêu đề ngắn gọn, súc tích và mô tả chính xác vấn đề (tối thiểu 10 ký tự)
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Thẻ</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Nhập thẻ và nhấn Enter (tối đa 5 thẻ)"
                disabled={tags.length >= 5 || loading}
              />
              <p className="text-sm text-gray-500">
                Thêm các thẻ liên quan để dễ dàng tìm kiếm
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <Editor
                apiKey={TINYMCE_API_KEY}
                value={content}
                onEditorChange={(content: string) => setContent(content)}
                init={{
                  menubar: false,
                  height: 400,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview', 'anchor',
                    'searchreplace', 'visualblocks', 'code', 'insertdatetime', 'table', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | code | help',
                  placeholder: 'Nhập nội dung chi tiết của chủ đề...',
                  content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }'
                }}
                disabled={loading}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Hỗ trợ định dạng văn bản phong phú</span>
                <span>Tối thiểu 30 ký tự</span>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Hướng dẫn đăng bài</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Viết tiếng Việt có dấu, rõ ràng, dễ hiểu</li>
                <li>Không đăng nội dung vi phạm pháp luật, đạo đức, thuần phong mỹ tục</li>
                <li>Không spam, quảng cáo</li>
                <li>Tôn trọng các thành viên khác</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild disabled={loading}>
                <Link href="/forum">Hủy</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang đăng...
                  </div>
                ) : (
                  'Đăng bài'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
