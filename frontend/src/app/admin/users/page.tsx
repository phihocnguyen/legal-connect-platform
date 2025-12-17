"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Shield,
  User as UserIcon,
  Scale,
} from "lucide-react";
import { useAdminCases } from "@/hooks/use-admin-cases";
import { AdminUser } from "@/domain/entities";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminTableFilters } from "@/components/admin/admin-table-filters";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Local state for filters before applying
  const [localSearch, setLocalSearch] = useState("");
  const [localRoleFilter, setLocalRoleFilter] = useState("ALL");

  const { loading, getUsers, updateUserStatus } = useAdminCases();

  const fetchUsers = useCallback(async () => {
    const params = {
      page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      sortDir: "desc" as const,
      ...(search.trim() && { search: search.trim() }),
      ...(roleFilter && roleFilter !== "ALL" && { role: roleFilter }),
    };

    const result = await getUsers(params);
    if (result) {
      setUsers(result.content || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
    }
  }, [page, search, roleFilter, getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApplyFilters = () => {
    // Update actual filter state from local state
    setSearch(localSearch);
    setRoleFilter(localRoleFilter);
    setPage(0); // Reset to first page when filters change
  };

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    const success = await updateUserStatus(userId, !currentStatus);
    if (success) {
      fetchUsers(); // Refresh the list
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "lawyer":
        return <Scale className="h-4 w-4 text-blue-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "lawyer":
        return <Badge variant="default">Luật sư</Badge>;
      default:
        return <Badge variant="secondary">Người dùng</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalElements || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Người dùng hoạt động
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.isEnabled).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Luật sư</CardTitle>
              <Scale className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "lawyer").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bị vô hiệu hóa
              </CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => !u.isEnabled).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <AdminTableFilters
          searchValue={localSearch}
          onSearchChange={setLocalSearch}
          searchPlaceholder="Tìm kiếm theo tên hoặc email..."
          filterRows={[
            {
              fields: [
                {
                  id: "role",
                  label: "Vai trò",
                  value: localRoleFilter,
                  onChange: setLocalRoleFilter,
                  options: [
                    { value: "ALL", label: "Tất cả vai trò" },
                    { value: "USER", label: "Người dùng" },
                    { value: "LAWYER", label: "Luật sư" },
                    { value: "ADMIN", label: "Admin" },
                  ],
                },
              ],
            },
          ]}
          onApplyFilters={handleApplyFilters}
          isLoading={loading}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFilterCount={
            (search.trim() ? 1 : 0) + (roleFilter !== "ALL" ? 1 : 0)
          }
        />

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={user.avatar}
                                alt={user.fullName}
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          {getRoleBadge(user.role)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isEnabled ? "default" : "secondary"}
                        >
                          {user.isEnabled ? "Hoạt động" : "Vô hiệu hóa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleUserStatus(user.id, user.isEnabled)
                              }
                            >
                              {user.isEnabled ? "Vô hiệu hóa" : "Kích hoạt"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="border-t">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalElements={totalElements}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
