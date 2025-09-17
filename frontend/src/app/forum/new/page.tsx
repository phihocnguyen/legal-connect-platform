'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const categories = [
  { id: 'dan-su', name: 'Luật Dân sự' },
  { id: 'hinh-su', name: 'Luật Hình sự' },
  { id: 'dat-dai', name: 'Luật Đất đai' },
  { id: 'lao-dong', name: 'Luật Lao động' },
  { id: 'kinh-doanh', name: 'Luật Kinh doanh' },
  { id: 'thue', name: 'Luật Thuế' },
];

export default function NewThreadPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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

          <form className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Chuyên mục</Label>
              <select
                id="category"
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="">Chọn chuyên mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề chủ đề..."
                required
              />
              <p className="text-sm text-gray-500">
                Tiêu đề ngắn gọn, súc tích và mô tả chính xác vấn đề
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
                disabled={tags.length >= 5}
              />
              <p className="text-sm text-gray-500">
                Thêm các thẻ liên quan để dễ dàng tìm kiếm
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <textarea
                id="content"
                className="w-full min-h-[400px] p-4 rounded-md border border-gray-300 resize-y"
                placeholder="Nhập nội dung chi tiết của chủ đề..."
                required
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Hỗ trợ định dạng Markdown</span>
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
              <Button variant="outline" type="button" asChild>
                <Link href="/forum">Hủy</Link>
              </Button>
              <Button type="submit">
                Đăng bài
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
