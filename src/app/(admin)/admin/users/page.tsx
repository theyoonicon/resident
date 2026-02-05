"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  department: string | null;
  year: string | null;
  verificationStatus: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(page));

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setTotalPages(data.pages);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`역할을 ${newRole}(으)로 변경하시겠습니까?`)) return;
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    fetchUsers();
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      USER: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-amber-100 text-amber-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || ""}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">사용자 관리</h2>
      </div>

      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 이메일, 과 검색..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-sm text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-sm text-sm bg-background"
        >
          <option value="">전체 역할</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
          <option value="PENDING">PENDING</option>
        </select>
      </div>

      <div className="bg-card rounded-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">이름</th>
              <th className="text-left px-4 py-3 font-medium">이메일</th>
              <th className="text-left px-4 py-3 font-medium">과/연차</th>
              <th className="text-left px-4 py-3 font-medium">역할</th>
              <th className="text-left px-4 py-3 font-medium">가입일</th>
              <th className="text-right px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">{user.name || "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  {user.department && user.year
                    ? `${user.department} ${user.year}`
                    : "-"}
                </td>
                <td className="px-4 py-3">{roleBadge(user.role)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() =>
                        handleRoleChange(
                          user.id,
                          user.role === "ADMIN" ? "USER" : "ADMIN"
                        )
                      }
                      className="p-1.5 rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground"
                      title={user.role === "ADMIN" ? "관리자 해제" : "관리자 지정"}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-sm hover:bg-red-50 text-muted-foreground hover:text-red-600"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-sm hover:bg-accent disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-sm hover:bg-accent disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
