"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useAdminCategories } from "@/hooks/use-admin-categories";
import { useLabelUseCases } from "@/hooks/use-label-cases";
import { PostCategoryDto, PostLabelDto } from "@/domain/entities";

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  icon?: string;
}

interface LabelFormData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
}

export default function AdminCategoriesPage() {
  const { getAllCategories, createCategory, updateCategory, deleteCategory } =
    useAdminCategories();

  const { createLabel, updateLabel, deleteLabel } = useLabelUseCases();

  // State
  const [categories, setCategories] = useState<PostCategoryDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PostCategoryDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Label management states
  const [categoryLabels, setCategoryLabels] = useState<PostLabelDto[]>([]);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<PostLabelDto | null>(null);
  const [labelFormData, setLabelFormData] = useState<LabelFormData>({
    name: "",
    slug: "",
    description: "",
    color: "#3B82F6",
  });

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    slug: "",
    icon: "",
  });

  // Load categories
  const loadCategories = useCallback(
    async (page: number = 0, search?: string) => {
      try {
        setLoading(true);
        const data = await getAllCategories({
          page,
          size: pageSize,
          search,
          sortBy: "displayOrder",
          sortDir: "asc",
        });
        setCategories(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setCurrentPage(data.number);
        setError(null);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Không thể tải danh sách danh mục");
      } finally {
        setLoading(false);
      }
    },
    [getAllCategories, pageSize]
  );

  useEffect(() => {
    loadCategories(0);
  }, [loadCategories]);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle form changes
  const handleFormChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name changes
      if (field === "name") {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", description: "", slug: "", icon: "" });
    setSelectedCategory(null);
  };

  // Handle create category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }

    try {
      setSubmitting(true);
      await createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        displayOrder: 0,
        isActive: true,
      });

      setIsCreateDialogOpen(false);
      resetForm();
      await loadCategories(currentPage, searchTerm);
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Không thể tạo danh mục mới");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit category
  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }

    try {
      setSubmitting(true);
      await updateCategory(selectedCategory.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        displayOrder: selectedCategory.displayOrder,
        isActive: selectedCategory.isActive,
      });

      setIsEditDialogOpen(false);
      resetForm();
      await loadCategories(currentPage, searchTerm);
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Không thể cập nhật danh mục");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      await deleteCategory(selectedCategory.id);

      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      await loadCategories(currentPage, searchTerm);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Không thể xóa danh mục");
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (category: PostCategoryDto) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug,
      icon: category.icon || "",
    });
    setCategoryLabels(category.labels || []);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: PostCategoryDto) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Label management functions
  const generateLabelSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleAddLabel = () => {
    setEditingLabel(null);
    setLabelFormData({
      name: "",
      slug: "",
      description: "",
      color: "#3B82F6",
    });
    setIsLabelDialogOpen(true);
  };

  const handleEditLabel = (label: PostLabelDto) => {
    setEditingLabel(label);
    setLabelFormData({
      id: label.id,
      name: label.name,
      slug: label.slug,
      description: label.description || "",
      color: label.color,
    });
    setIsLabelDialogOpen(true);
  };

  const handleSaveLabel = async () => {
    if (!labelFormData.name.trim()) {
      setError("Tên nhãn không được để trống");
      return;
    }

    try {
      setSubmitting(true);

      if (editingLabel) {
        // Update existing label
        const updated = await updateLabel(editingLabel.id, {
          name: labelFormData.name,
          slug: labelFormData.slug,
          description: labelFormData.description,
          color: labelFormData.color,
          categoryId: selectedCategory?.id.toString(),
        });
        setCategoryLabels((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l))
        );
      } else {
        // Create new label
        const newLabel = await createLabel({
          name: labelFormData.name,
          slug: labelFormData.slug,
          description: labelFormData.description,
          color: labelFormData.color,
          categoryId: selectedCategory?.id.toString(),
          isActive: true,
        });
        setCategoryLabels((prev) => [...prev, newLabel]);
      }

      setIsLabelDialogOpen(false);
      setEditingLabel(null);
      setError(null);
    } catch (err) {
      console.error("Error saving label:", err);
      setError("Không thể lưu nhãn");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhãn này?")) return;

    try {
      setSubmitting(true);
      await deleteLabel(labelId);
      setCategoryLabels((prev) => prev.filter((l) => l.id !== labelId));
      setError(null);
    } catch (err) {
      console.error("Error deleting label:", err);
      setError("Không thể xóa nhãn");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLabelFormChange = (field: keyof LabelFormData, value: string) => {
    setLabelFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name changes
      if (field === "name") {
        updated.slug = generateLabelSlug(value);
      }

      return updated;
    });
  };

  // Filter categories based on search term
  const filteredCategories = categories;

  // Handle search with debouncing
  const handleSearch = useCallback(
    async (search: string) => {
      setCurrentPage(0);
      await loadCategories(0, search);
    },
    [loadCategories]
  );

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý danh mục
            </h1>
            <p className="text-muted-foreground">
              Quản lý các danh mục bài viết trong hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => loadCategories(currentPage, searchTerm)}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo danh mục mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tạo danh mục mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin cho danh mục mới
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên danh mục</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Nhập tên danh mục..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      placeholder="Nhập mô tả cho danh mục..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleCreateCategory} disabled={submitting}>
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tạo...
                      </div>
                    ) : (
                      "Tạo danh mục"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search and Stats */}
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Tổng số: {categories.length} danh mục
          </div>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách danh mục</CardTitle>
            <CardDescription>
              Quản lý tất cả danh mục bài viết trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-center">Số bài viết</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "Không tìm thấy danh mục nào"
                          : "Chưa có danh mục nào"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div
                            className="truncate"
                            title={category.description}
                          >
                            {category.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {category.postsCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(category)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(category)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin danh mục và quản lý nhãn
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên danh mục</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                  placeholder="auto-generated-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="Nhập mô tả cho danh mục..."
                  rows={3}
                />
              </div>

              {/* Labels Management Section */}
              <div className="grid gap-2 mt-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Nhãn (Labels)</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddLabel}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm nhãn
                  </Button>
                </div>

                {categoryLabels.length > 0 ? (
                  <div className="space-y-2">
                    {categoryLabels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${label.color}20`,
                              color: label.color,
                            }}
                          >
                            {label.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {label.slug}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditLabel(label)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteLabel(label.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa có nhãn nào. Nhấn &quot;Thêm nhãn&quot; để tạo nhãn
                    mới.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button onClick={handleEditCategory} disabled={submitting}>
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang cập nhật...
                  </div>
                ) : (
                  "Cập nhật"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Label Add/Edit Dialog */}
        <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLabel ? "Chỉnh sửa nhãn" : "Thêm nhãn mới"}
              </DialogTitle>
              <DialogDescription>
                {editingLabel
                  ? "Cập nhật thông tin nhãn"
                  : "Tạo nhãn mới cho danh mục này"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label-name">Tên nhãn</Label>
                <Input
                  id="label-name"
                  value={labelFormData.name}
                  onChange={(e) =>
                    handleLabelFormChange("name", e.target.value)
                  }
                  placeholder="Nhập tên nhãn..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label-slug">Slug</Label>
                <Input
                  id="label-slug"
                  value={labelFormData.slug}
                  onChange={(e) =>
                    handleLabelFormChange("slug", e.target.value)
                  }
                  placeholder="auto-generated-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label-description">Mô tả</Label>
                <Textarea
                  id="label-description"
                  value={labelFormData.description}
                  onChange={(e) =>
                    handleLabelFormChange("description", e.target.value)
                  }
                  placeholder="Nhập mô tả cho nhãn..."
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label-color">Màu sắc</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="label-color"
                    type="color"
                    value={labelFormData.color}
                    onChange={(e) =>
                      handleLabelFormChange("color", e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={labelFormData.color}
                    onChange={(e) =>
                      handleLabelFormChange("color", e.target.value)
                    }
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                  <span
                    className="px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: `${labelFormData.color}20`,
                      color: labelFormData.color,
                    }}
                  >
                    Preview
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsLabelDialogOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveLabel} disabled={submitting}>
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingLabel ? "Đang cập nhật..." : "Đang tạo..."}
                  </div>
                ) : editingLabel ? (
                  "Cập nhật"
                ) : (
                  "Tạo nhãn"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa danh mục &quot;
                {selectedCategory?.name}&quot;? Hành động này không thể hoàn
                tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedCategory(null);
                }}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCategory}
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xóa...
                  </div>
                ) : (
                  "Xóa danh mục"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
