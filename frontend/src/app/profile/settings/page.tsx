'use client';

import { ApiKeyCard } from '@/components/shared/api-key-card';

export default function ProfileSettingsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
          <p className="text-gray-600 mt-2">
            Quản lý API key và các cài đặt tài khoản của bạn
          </p>
        </div>

        <ApiKeyCard />
      </div>
    </div>
  );
}
