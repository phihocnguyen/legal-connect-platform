'use client'
import { useState, useEffect } from "react";
import { LegalDocument, loadLegalDocuments } from "@/lib/csv-parser";
import LegalDocuments from "@/components/legal-documents";
import LegalCategories from "@/components/legal-categories";

export default function LegalDocumentsSection() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadLegalDocuments();
        console.log('Loaded documents:', data.length);
        if (data.length === 0) {
          setError('Không thể tải dữ liệu văn bản pháp luật. Vui lòng thử lại sau.');
        } else {
          setDocuments(data);
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
        setError('Lỗi khi tải dữ liệu văn bản pháp luật.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Đang tải dữ liệu văn bản pháp luật...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      {documents.length > 0 && (
        <LegalCategories 
          documents={documents} 
          showTopOnly={true} 
          limit={8} 
        />
      )}
      
      {/* Documents Section */}
      <LegalDocuments 
        documents={documents}
        loading={loading}
        error={error}
      />
    </div>
  );
}