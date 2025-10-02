'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useApiKey } from '@/hooks/use-user-cases';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function ApiKeyCard() {
  const { loading, error, apiKey, getMyApiKey, createApiKey } = useApiKey();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApiKey = async () => {
    await getMyApiKey();
    // Don't auto-create, let user click button to create
  };

  const copyToClipboard = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateNew = async () => {
    await createApiKey();
  };

  if (loading && !apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Key
        </CardTitle>
        <CardDescription>
          Quản lý API key của bạn để sử dụng các tính năng PDF Q/A và Chat Q/A
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {apiKey ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">API Key:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded-md break-all">
                {apiKey.key}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Tổng số lượt:</p>
                <p className="text-2xl font-bold">{apiKey.totalLimit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Đã sử dụng:</p>
                <p className="text-2xl font-bold">{apiKey.usedCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Còn lại:</p>
                <p className="text-2xl font-bold text-green-600">{apiKey.remainingCalls}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Trạng thái:</p>
                <Badge variant={apiKey.isActive && apiKey.remainingCalls > 0 ? 'default' : 'destructive'}>
                  {apiKey.isActive && apiKey.remainingCalls > 0 ? 'Hoạt động' : 'Hết lượt'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">PDF Q/A:</p>
                <p className="text-lg font-semibold">{apiKey.pdfQaCount} lượt</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Chat Q/A:</p>
                <p className="text-lg font-semibold">{apiKey.chatQaCount} lượt</p>
              </div>
            </div>

            {apiKey.remainingCalls === 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Bạn đã hết lượt sử dụng API. Vui lòng nâng cấp hoặc chờ đến kỳ làm mới tiếp theo.</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Bạn chưa có API key</p>
            <Button onClick={handleCreateNew} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Tạo API Key
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
