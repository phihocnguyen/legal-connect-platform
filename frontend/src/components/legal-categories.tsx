"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, TrendingUp, ChevronRight, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  LegalCategory,
  analyzeCategoriesFromDocuments,
  getTopCategories,
} from "@/lib/category-utils";

interface LegalCategoriesProps {
  documents?: Array<{ link: string }>;
  showTopOnly?: boolean;
  limit?: number;
}

export default function LegalCategories({
  documents = [],
  showTopOnly = true,
  limit = 8,
}: LegalCategoriesProps) {
  const [categories, setCategories] = useState<LegalCategory[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (documents.length > 0) {
      const analyzedCategories = analyzeCategoriesFromDocuments(documents);
      setCategories(analyzedCategories);
    }
  }, [documents]);

  const displayCategories =
    showTopOnly && !showAll ? getTopCategories(categories, limit) : categories;

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FolderOpen className="text-teal-600" />
          Lĩnh vực pháp luật
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            {categories.length} lĩnh vực
          </span>
          {showTopOnly && categories.length > limit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-teal-600 border-teal-600 hover:bg-teal-50"
            >
              {showAll ? "Thu gọn" : `Xem tất cả (${categories.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayCategories.map((category) => (
          <Card
            key={category.id}
            className="hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className={`${category.color} text-xs`}>
                  {category.slug}
                </Badge>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
              </div>

              <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                {category.name}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {category.count} văn bản
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {documents.length
                      ? ((category.count / documents.length) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(() => {
                      const maxCount = Math.max(
                        ...categories.map((c) => c.count),
                        1
                      );
                      return Math.min(100, (category.count / maxCount) * 100);
                    })()}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Summary */}
      {!showTopOnly && (
        <Card className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Tổng lĩnh vực</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {Math.max(...categories.map((c) => c.count))}
                </div>
                <div className="text-sm text-gray-600">Lĩnh vực nhiều nhất</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(
                    categories.reduce((sum, c) => sum + c.count, 0) /
                      categories.length
                  )}
                </div>
                <div className="text-sm text-gray-600">Trung bình/lĩnh vực</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {categories.filter((c) => c.count >= 10).length}
                </div>
                <div className="text-sm text-gray-600">Lĩnh vực phổ biến</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
