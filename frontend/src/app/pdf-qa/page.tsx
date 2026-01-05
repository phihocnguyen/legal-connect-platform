"use client";

import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { NotebookChat } from "@/components/pdf/notebook-chat";
import { DocumentUpload } from "@/components/pdf/document-upload";
import { ConversationSidebar } from "@/components/pdf/conversation-sidebar";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ApiKeyInput } from "@/components/shared/api-key-input";
import { ApiLimitModal } from "@/components/shared/api-limit-modal";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePdfCases } from "@/hooks/use-pdf-cases";
import { usePdfQACases } from "@/hooks/use-pdf-qa-cases";
import { useApiKey } from "@/hooks/use-user-cases";
import { PdfConversation, PdfMessage } from "@/domain/entities";
import { toast } from "sonner";

interface PdfFile {
  url: string;
  name: string;
  conversationId?: number;
  fileId?: string;
  summary?: string;
  messages?: PdfMessage[];
}

export default function PdfQAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [conversations, setConversations] = useState<PdfConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const isUpdatingUrlRef = useRef(false);

  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);
  const { apiKey, getMyApiKey } = useApiKey();

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
    uploadPdfToPython,
    getPdfSummary,
  } = usePdfCases();

  const { askPdfQuestion } = usePdfQACases();

  const handleSendMessage = async (conversationId: number, content: string) => {
    let userMessageId: number | undefined;
    try {
      if (conversationId) {
        const userMsg = await sendMessage(conversationId, content);
        userMessageId = userMsg.id;
      }
    } catch (err) {
      console.error("Failed to persist user message:", err);
    }

    try {
      if (pdfFile?.fileId) {
        const qaResult = await askPdfQuestion(pdfFile.fileId, content, 3);

        const answerText =
          qaResult?.answer ||
          qaResult?.answers?.[0] ||
          qaResult?.text ||
          JSON.stringify(qaResult);

        if (conversationId) {
          try {
            const assistantMsg = await sendMessage( conversationId, answerText, "ASSISTANT" );
            return assistantMsg;
          } catch (err) {
            console.error("Failed to persist assistant message:", err);
            const assistantMessage: PdfMessage = {
              id: Date.now(),
              conversationId: conversationId,
              content: answerText,
              role: "ASSISTANT",
              createdAt: new Date(),
            };
            return assistantMessage;
          }
        } else {
          const assistantMessage: PdfMessage = {
            id: Date.now(),
            conversationId: -1,
            content: answerText,
            role: "ASSISTANT",
            createdAt: new Date(),
          };
          return assistantMessage;
        }
      }
    } catch (err) {
      console.error("PDF QA error:", err);
      throw err;
    }

    if (conversationId && userMessageId) {
      const errorMessage: PdfMessage = {
        id: Date.now(),
        conversationId: conversationId,
        content:
          "Sorry, I cannot answer questions about this PDF. The file reference is missing.",
        role: "ASSISTANT",
        createdAt: new Date(),
      };
      return errorMessage;
    }

    throw new Error("Unable to send message: no fileId and no conversationId");
  };

  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const convs = await getConversations();
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [getConversations]);

  const handleSelectConversation = useCallback(
    async (conversationId: number, skipUrlUpdate = false) => {
      try {
        setIsLoadingMessages(true);
        const conversation = await getConversationWithDetails(conversationId);
        setActiveConversationId(conversationId);

        if (!skipUrlUpdate) {
          isUpdatingUrlRef.current = true;
          router.push(`/pdf-qa?id=${conversationId}`, { scroll: false });
          setTimeout(() => {
            isUpdatingUrlRef.current = false;
          }, 100);
        }

        if (conversation.pdfDocument) {
          setPdfFile({
            url: getPdfViewUrl(conversationId),
            name: conversation.pdfDocument.originalFileName,
            conversationId: conversationId,
            summary: conversation.summary, // Get summary from DB
            fileId: conversation.pythonFileId, // Get pythonFileId from DB to enable QA
            messages: conversation.messages, // Pass messages to render in chat
          });
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [getConversationWithDetails, getPdfViewUrl, router]
  );

  useEffect(() => {
    const initializePage = async () => {
      const storedKey = localStorage.getItem("user_api_key");
      if (storedKey) {
        setIsApiKeyValid(true);
      }

      await getMyApiKey();

      await loadConversations();

      const conversationIdFromUrl = searchParams.get("id");
      if (conversationIdFromUrl) {
        const conversationId = parseInt(conversationIdFromUrl, 10);
        if (!isNaN(conversationId)) {
          await handleSelectConversation(conversationId);
          return;
        }
      }

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
  }, []); // Only run once on mount

  useEffect(() => {
    if (isUpdatingUrlRef.current) {
      return;
    }

    const conversationIdFromUrl = searchParams.get("id");
    const urlId = conversationIdFromUrl
      ? parseInt(conversationIdFromUrl, 10)
      : undefined;

    if (urlId && !isNaN(urlId) && urlId !== activeConversationId) {
      handleSelectConversation(urlId, true); // Skip URL update since we're responding to URL change
    }
  }, [searchParams, activeConversationId, handleSelectConversation]);

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

      console.log(
        "Creating conversation in Spring Boot with summary and fileId..."
      );
      const result = await uploadPdf(
        file,
        file.name.replace(".pdf", ""),
        summaryResult.summary,
        pythonResult.file_id // Pass pythonFileId to backend
      );

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

      toast.success("Conversation deleted successfully");

      await loadConversations();

      if (activeConversationId === conversationToDelete) {
        setPdfFile(null);
        setActiveConversationId(undefined);
        router.push("/pdf-qa");
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
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden min-w-0">
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
        ) : isLoadingConversations ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <LoadingSpinner size="lg" text="Đang tải cuộc trò chuyện..." />
          </div>
        ) : !pdfFile ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Phân Tích Văn Bản Pháp Luật
                </h1>
                <p className="text-gray-600">
                  Tải lên văn bản pháp luật của bạn và nhận được phân tích thông
                  minh từ AI
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
          <div className="flex-1 flex flex-col p-4 lg:p-8 mx-auto w-full max-w-full min-w-0">
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Phân Tích Tài Liệu
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Đặt câu hỏi về tài liệu của bạn và nhận được phân tích thông
                  minh từ AI
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
              <div className="flex-1 flex flex-col divide-y divide-gray-200 min-w-0 overflow-hidden">
                <NotebookChat
                  conversationId={activeConversationId}
                  onSendMessage={handleSendMessage}
                  initialMessages={pdfFile.messages}
                  isLoadingMessages={isLoadingMessages}
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
        title="Xóa cuộc trò chuyện"
        message="Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác và tất cả tin nhắn sẽ bị xóa vĩnh viễn."
        confirmText="Xóa"
        cancelText="Hủy"
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
