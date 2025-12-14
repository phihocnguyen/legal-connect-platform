"use client";

import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { NotebookChat } from "@/components/pdf/notebook-chat";
import { DocumentUpload } from "@/components/pdf/document-upload";
import { ConversationSidebar } from "@/components/pdf/conversation-sidebar";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ApiKeyInput } from "@/components/shared/api-key-input";
import { ApiLimitModal } from "@/components/shared/api-limit-modal";
import { useState, useCallback, useEffect } from "react";
import { usePdfCases } from "@/hooks/use-pdf-cases";
import { useApiKey } from "@/hooks/use-user-cases";
import { PdfConversation } from "@/domain/entities";
import { toast } from "sonner";

interface PdfFile {
  url: string;
  name: string;
  conversationId?: number;
  fileId?: string;
  summary?: string;
}

export default function PdfQAPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [conversations, setConversations] = useState<PdfConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // API Key state
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);
  const { apiKey, getMyApiKey } = useApiKey();

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    number | null
  >(null);

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
      console.error("Error loading conversations:", error);
    }
  }, [getConversations]);

  const handleSelectConversation = useCallback(
    async (conversationId: number) => {
      try {
        const conversation = await getConversationWithDetails(conversationId);
        setActiveConversationId(conversationId);

        // Set PDF file from conversation with summary from DB
        if (conversation.pdfDocument) {
          setPdfFile({
            url: getPdfViewUrl(conversationId),
            name: conversation.pdfDocument.originalFileName,
            conversationId: conversationId,
            summary: conversation.summary, // Get summary from DB
            fileId: undefined, // fileId is not stored in DB, only used during upload
          });
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    },
    [getConversationWithDetails, getPdfViewUrl]
  );

  // Load conversations on component mount and restore last active conversation
  useEffect(() => {
    const initializePage = async () => {
      // Check API key first
      const storedKey = localStorage.getItem("user_api_key");
      if (storedKey) {
        setIsApiKeyValid(true);
      }

      // Load API key info
      await getMyApiKey();

      await loadConversations();

      // Try to restore last active conversation from localStorage
      const lastActiveConversation = localStorage.getItem(
        "lastActiveConversationId"
      );
      if (lastActiveConversation) {
        const conversationId = parseInt(lastActiveConversation, 10);
        if (!isNaN(conversationId)) {
          await handleSelectConversation(conversationId);
        }
      }
    };

    initializePage();
  }, [loadConversations, handleSelectConversation, getMyApiKey]);

  // Save active conversation to localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(
        "lastActiveConversationId",
        activeConversationId.toString()
      );
    } else {
      localStorage.removeItem("lastActiveConversationId");
    }
  }, [activeConversationId]);

  const handleFileSelect = async (url: string, file: File) => {
    // Check API key validity and limit
    if (!isApiKeyValid) {
      toast.error("Vui lòng xác thực API key trước khi upload PDF");
      return;
    }

    if (apiKey && apiKey.remainingCalls <= 0) {
      setShowApiLimitModal(true);
      return;
    }

    setLoading(true);
    try {
      console.log("Uploading PDF to Python API...");
      const pythonResult = await uploadPdfToPython(file);
      console.log("Python upload result:", pythonResult);
      console.log("Getting PDF summary with fileId:", pythonResult.file_id);
      if (!pythonResult.file_id) {
        throw new Error("No file_id received from Python upload");
      }
      const summaryResult = await getPdfSummary(pythonResult.file_id, 200);
      console.log("Summary result:", summaryResult);

      console.log("Creating conversation in Spring Boot with summary...");
      const result = await uploadPdf(file, file.name.replace(".pdf", ""));

      if (result.success && result.conversation) {
        setPdfFile({
          url: getPdfViewUrl(result.conversation.id),
          name: file.name,
          conversationId: result.conversation.id,
          fileId: pythonResult.file_id,
          summary: summaryResult.summary,
        });

        await loadConversations();

        setActiveConversationId(result.conversation.id);
        URL.revokeObjectURL(url);

        console.log("PDF processing completed successfully");
      } else {
        console.error("Upload failed:", result.error);
        setPdfFile({
          url,
          name: file.name,
          fileId: pythonResult.file_id,
          summary: summaryResult.summary,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Keep the local URL for preview
      setPdfFile({
        url,
        name: file.name,
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

  const handleNewConversation = useCallback(() => {
    // Reset to upload state
    setPdfFile(null);
    setActiveConversationId(undefined);
  }, []);

  const handleDeleteConversation = useCallback((id: number) => {
    setConversationToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteConversation = useCallback(async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation(conversationToDelete);

      // Show success toast
      toast.success("Conversation deleted successfully");

      // Refresh conversations list
      await loadConversations();

      // Clear active conversation if it was deleted
      if (activeConversationId === conversationToDelete) {
        setPdfFile(null);
        setActiveConversationId(undefined);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setConversationToDelete(null);
    }
  }, [
    conversationToDelete,
    deleteConversation,
    loadConversations,
    activeConversationId,
  ]);

  // Convert PdfConversation to legacy Conversation interface for sidebar
  const legacyConversations = conversations.map((conv) => ({
    id: conv.id.toString(),
    title: conv.title,
    timestamp: conv.updatedAt,
  }));

  return (
    <div className="h-[calc(100vh-90px)] bg-gradient-to-b from-gray-50 to-white flex overflow-hidden">
      {/* Conversation Sidebar - Always visible */}
      <ConversationSidebar
        conversations={legacyConversations}
        activeId={activeConversationId?.toString()}
        onSelect={(id) => handleSelectConversation(id as number)}
        onDelete={(conversation) =>
          handleDeleteConversation(conversation.id as number)
        }
        onNew={handleNewConversation}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-scroll">
        {!isApiKeyValid ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <ApiKeyInput
                onValidKey={() => {
                  setIsApiKeyValid(true);
                  toast.success("API key đã được xác thực thành công!");
                }}
                featureName="PDF Q/A"
              />
            </div>
          </div>
        ) : !pdfFile ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Legal Document Analysis
                </h1>
                <p className="text-gray-600">
                  Upload your legal document and get instant insights through
                  AI-powered analysis
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
          <div className="flex-1 flex flex-col p-4 lg:p-8 mx-auto w-full">
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg border border-gray-200">
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
              <div className="flex-1 flex flex-col divide-y divide-gray-200">
                <NotebookChat
                  conversationId={activeConversationId}
                  onSendMessage={sendMessage}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setConversationToDelete(null);
        }}
        onConfirm={confirmDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently lost."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* API Limit Modal */}
      <ApiLimitModal
        open={showApiLimitModal}
        onClose={() => setShowApiLimitModal(false)}
        remainingCalls={apiKey?.remainingCalls || 0}
      />
    </div>
  );
}
