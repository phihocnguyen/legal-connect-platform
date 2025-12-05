'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { apiKeyRepository } from '@/infrastructure/repositories/user-repository';
import Link from 'next/link';

interface ApiKeyInputProps {
  onValidKey: (key: string) => void;
  featureName?: string;
}

export function ApiKeyInput({ onValidKey, featureName = 'tính năng này' }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setValidationStatus('invalid');
      setErrorMessage('Vui lòng nhập API key');
      return;
    }

    setIsValidating(true);
    setErrorMessage('');

    try {
      const isValid = await apiKeyRepository.validateApiKey(apiKey);
      
      if (isValid) {
        setValidationStatus('valid');
        // Store API key in localStorage
        localStorage.setItem('user_api_key', apiKey);
        onValidKey(apiKey);
      } else {
        setValidationStatus('invalid');
        setErrorMessage('API key không hợp lệ hoặc đã hết hạn');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setValidationStatus('invalid');
      setErrorMessage('Có lỗi xảy ra khi xác thực API key');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Key className="w-5 h-5" />
          Xác thực API Key
        </CardTitle>
        <CardDescription>
          Để sử dụng {featureName}, vui lòng nhập API key của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nhập API key của bạn (vd: lc_xxxxx)"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationStatus('idle');
                setErrorMessage('');
              }}
              className={`flex-1 ${
                validationStatus === 'valid' ? 'border-green-500' : 
                validationStatus === 'invalid' ? 'border-red-500' : ''
              }`}
            />
            <Button 
              onClick={handleValidate}
              disabled={isValidating || validationStatus === 'valid'}
              className={validationStatus === 'valid' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isValidating ? (
                <>Đang kiểm tra...</>
              ) : validationStatus === 'valid' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đã xác thực
                </>
              ) : (
                'Xác thực'
              )}
            </Button>
          </div>

          {validationStatus === 'invalid' && errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {validationStatus === 'valid' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>API key hợp lệ! Bạn có thể sử dụng tính năng này.</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600 mb-2">
            Chưa có API key?
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/profile/settings">
              <ExternalLink className="w-4 h-4 mr-2" />
              Tạo API Key
            </Link>
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-800">
            <strong>Lưu ý:</strong> API key của bạn được sử dụng để xác thực và giới hạn số lần sử dụng các tính năng AI. 
            Mỗi API key có giới hạn 5 lượt gọi (cho cả PDF Q/A và Chat Q/A).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
