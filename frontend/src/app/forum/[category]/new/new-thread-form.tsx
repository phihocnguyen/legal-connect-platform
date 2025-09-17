'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

const threadSchema = z.object({
  title: z.string()
    .min(10, 'Tiêu đề phải có ít nhất 10 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  content: z.string()
    .min(30, 'Nội dung phải có ít nhất 30 ký tự')
    .max(10000, 'Nội dung không được vượt quá 10000 ký tự'),
  tags: z.string()
    .min(1, 'Vui lòng nhập ít nhất một thẻ')
    .refine(
      (val) => {
        const tags = val.split(',').map(tag => tag.trim()).filter(Boolean);
        return tags.length <= 5;
      },
      'Không được thêm quá 5 thẻ'
    )
    .refine(
      (val) => {
        const tags = val.split(',').map(tag => tag.trim()).filter(Boolean);
        return tags.every(tag => tag.length <= 20);
      },
      'Mỗi thẻ không được vượt quá 20 ký tự'
    )
});

interface NewThreadFormProps {
  category: string;
}

export function NewThreadForm({ category }: NewThreadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const form = useForm<z.infer<typeof threadSchema>>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
        title: '',
        content: '',
        tags: '',
    },
  });

  async function onSubmit(data: z.infer<typeof threadSchema>) {
    try {
      setIsSubmitting(true);
      
      const processedTags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      const threadData = {
        ...data,
        tags: processedTags,
        category
      };
      
      // TODO: Implement API call to create thread
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      console.log('Creating thread:', threadData);
      
      // After successful creation, redirect to the thread
      router.push(`/forum/${category}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập tiêu đề chủ đề của bạn..." 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Nhập nội dung chi tiết..." 
                  className="min-h-[300px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thẻ</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập các thẻ, phân cách bằng dấu phẩy..." 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo chủ đề'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
