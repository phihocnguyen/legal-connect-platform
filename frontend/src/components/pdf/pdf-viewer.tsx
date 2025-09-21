'use client';

import { FileText, Download, Eye, Trash } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PdfViewerProps {
  url: string;
  fileName?: string;
  onDelete?: () => void;
}

export function PdfViewer({ url, fileName = "Document.pdf", onDelete }: PdfViewerProps) {
  return (
    <TooltipProvider>
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </h3>
            <p className="text-xs text-gray-500">PDF Document</p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => window.open(url, '_blank')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open PDF in new tab</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={url}
                  download={fileName}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <Download className="w-5 h-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download PDF</p>
              </TooltipContent>
            </Tooltip>

            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onDelete}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Remove document</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
