"use client";

import { useState } from "react";

interface CategoryFilterProps {
  onFilterChange?: (filter: string) => void;
}

export function CategoryFilter({ onFilterChange }: CategoryFilterProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "Tất cả danh mục", icon: "" },
    { id: "newest", label: "Mới nhất", icon: "" },
    { id: "hot", label: "🔥 Hot", icon: "🔥" },
    { id: "answered", label: "👤 Luật sư trả lời", icon: "👤" },
  ];

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange?.(filterId);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Bài viết mới nhất
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === filter.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Quick filter tags */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Lọc nhanh:</span>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-full hover:bg-red-50">
            🔴 Chim
          </button>
          <button className="px-3 py-1 text-sm border border-orange-300 text-orange-600 rounded-full hover:bg-orange-50">
            🔥 Hot
          </button>
          <button className="px-3 py-1 text-sm border border-green-300 text-green-600 rounded-full hover:bg-green-50">
            👤 Luật sư trả lời
          </button>
        </div>
      </div>

      {/* Display options */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <label htmlFor="display-count" className="text-sm text-gray-600">
            Hiển thị:
          </label>
          <select
            id="display-count"
            defaultValue="5"
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  );
}
