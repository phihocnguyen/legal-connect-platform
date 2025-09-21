'use client';

import { PdfViewer } from '@/components/pdf/pdf-viewer';
import { NotebookChat } from '@/components/pdf/notebook-chat';
import { DocumentUpload } from '@/components/pdf/document-upload';
import { ConversationSidebar } from '@/components/pdf/conversation-sidebar';
import { useState, useCallback, useEffect } from 'react';
import { usePdfCases } from '@/hooks/use-pdf-cases';
import { PdfConversation } from '@/domain/entities';

interface PdfFile {
  url: string;
  name: string;
  conversationId?: number;
  fileId?: string; // Python API file ID
  summary?: string; // PDF summary from Python API
}

export default function PdfQAPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [conversations, setConversations] = useState<PdfConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    uploadPdf,
    getConversations,
    getConversationWithDetails,
    sendMessage,
    deleteConversation,
    getPdfViewUrl,
    // Python API methods
    uploadPdfToPython,
    getPdfSummary,
  } = usePdfCases();

  const loadConversations = useCallback(async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [getConversations]);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleFileSelect = async (url: string, file: File) => {
    setLoading(true);
    try {
      // Step 1: Upload PDF to Python API for processing
      console.log('Uploading PDF to Python API...');
      const pythonResult = await uploadPdfToPython(file);
      console.log('Python upload result:', pythonResult);
      
      // Step 2: Get PDF summary from Python API
      console.log('Getting PDF summary with fileId:', pythonResult.file_id);
      if (!pythonResult.file_id) {
        throw new Error('No file_id received from Python upload');
      }
      const summaryResult = await getPdfSummary(pythonResult.file_id, 200);
      console.log('Summary result:', summaryResult);
      
      // Step 3: Upload to Spring Boot API and create conversation
      console.log('Creating conversation in Spring Boot...');
      const result = await uploadPdf(file, file.name.replace('.pdf', ''));
      
      if (result.success && result.conversation) {
        // Set PDF file with all information
        setPdfFile({
          url: getPdfViewUrl(result.conversation.id),
          name: file.name,
          conversationId: result.conversation.id,
          fileId: pythonResult.file_id,
          summary: summaryResult.summary
        });
        
        // Refresh conversations list
        await loadConversations();
        
        // Set as active conversation
        setActiveConversationId(result.conversation.id);
        
        // Clean up the temporary URL
        URL.revokeObjectURL(url);
        
        console.log('PDF processing completed successfully');
      } else {
        console.error('Upload failed:', result.error);
        // Keep the local URL for preview but include Python API data
        setPdfFile({
          url,
          name: file.name,
          fileId: pythonResult.file_id,
          summary: summaryResult.summary
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Keep the local URL for preview
      setPdfFile({
        url,
        name: file.name
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (pdfFile?.url && !pdfFile.conversationId) {
      URL.revokeObjectURL(pdfFile.url);
    }
    setPdfFile(null);
    setActiveConversationId(undefined);
  };

  const handleSelectConversation = async (conversationId: number) => {
    try {
      const conversation = await getConversationWithDetails(conversationId);
      setActiveConversationId(conversationId);
      
      // Set PDF file from conversation
      if (conversation.pdfDocument) {
        setPdfFile({
          url: getPdfViewUrl(conversationId),
          name: conversation.pdfDocument.originalFileName,
          conversationId: conversationId
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleNewConversation = useCallback(() => {
    // Reset to upload state
    setPdfFile(null);
    setActiveConversationId(undefined);
  }, []);

  const handleDeleteConversation = useCallback(async (id: number) => {
    try {
      await deleteConversation(id);
      // Refresh conversations list
      await loadConversations();
      
      // Clear active conversation if it was deleted
      if (activeConversationId === id) {
        setPdfFile(null);
        setActiveConversationId(undefined);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [activeConversationId, deleteConversation, loadConversations]);

  // Convert PdfConversation to legacy Conversation interface for sidebar
  const legacyConversations = conversations.map(conv => ({
    id: conv.id.toString(),
    title: conv.title,
    timestamp: conv.updatedAt,
  }));

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white flex">
      {/* Conversation Sidebar - Always visible */}
      <ConversationSidebar 
        conversations={legacyConversations}
        activeId={activeConversationId?.toString()}
        onSelect={(id) => handleSelectConversation(parseInt(id))}
        onDelete={(id) => handleDeleteConversation(parseInt(id))}
        onNew={handleNewConversation}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {!pdfFile ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Legal Document Analysis
                </h1>
                <p className="text-gray-600">
                  Upload your legal document and get instant insights through AI-powered analysis
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                <DocumentUpload 
                  onFileSelect={handleFileSelect} 
                  loading={loading}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto p-4 lg:p-8 max-w-5xl">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Document Analysis
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ask questions about your document and get AI-powered insights
                </p>
              </div>

              {/* PDF Preview */}
              <div className="p-6 border-b border-gray-200">
                <PdfViewer 
                  url={pdfFile.url} 
                  fileName={pdfFile.name}
                  onDelete={handleDelete}
                />
              </div>

              {/* PDF Summary Section */}
              {pdfFile.summary && (
                <div className="p-6 border-b border-gray-200 bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    📄 Document Summary
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-700 leading-relaxed">
                      {pdfFile.summary}
                    </p>
                  </div>
                  {pdfFile.fileId && (
                    <p className="text-xs text-blue-600 mt-2">
                      File ID: {pdfFile.fileId}
                    </p>
                  )}
                </div>
              )}

              {/* Notebook-style Chat Interface */}
              <div className="divide-y divide-gray-200">
                <NotebookChat 
                  conversationId={activeConversationId}
                  onSendMessage={sendMessage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
