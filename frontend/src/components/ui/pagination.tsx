import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalElements: number;
  pageSize: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
}) => {
  const safeTotalElements = Math.max(0, totalElements);
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.max(
    0,
    Math.min(currentPage, safeTotalPages - 1)
  );

  const startItem = safeTotalElements > 0 ? safeCurrentPage * pageSize + 1 : 0;
  const endItem =
    safeTotalElements > 0
      ? Math.min((safeCurrentPage + 1) * pageSize, safeTotalElements)
      : 0;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(0, safeCurrentPage - delta);
      i <= Math.min(safeTotalPages - 1, safeCurrentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, "...");
      } else {
        rangeWithDots.push(0);
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < safeTotalPages - 1) {
      if (range[range.length - 1] < safeTotalPages - 2) {
        rangeWithDots.push("...", safeTotalPages - 1);
      } else {
        rangeWithDots.push(safeTotalPages - 1);
      }
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 0}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages - 1}
        >
          Sau
        </Button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
            <span className="font-medium">{endItem}</span> trong{" "}
            <span className="font-medium">{safeTotalElements}</span> kết quả
          </p>
        </div>

        <div className="flex justify-center">
          <nav
            className="inline-flex items-center gap-1"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 0}
              className="px-3 py-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {safeTotalPages > 1 ? (
              getVisiblePages().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-2 py-2">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </span>
                  ) : (
                    <Button
                      variant={page === safeCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page as number)}
                      className="px-3 py-2 min-w-[40px]"
                    >
                      {(page as number) + 1}
                    </Button>
                  )}
                </React.Fragment>
              ))
            ) : (
              <Button
                variant="default"
                size="sm"
                className="px-3 py-2 min-w-[40px]"
                disabled
              >
                1
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === safeTotalPages - 1}
              className="px-3 py-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
