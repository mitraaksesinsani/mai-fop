'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  Crown,
  Briefcase,
  HardHat,
  RefreshCw,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  getUsersAction,
  saveUserAction,
  deleteUserAction,
  batchAddUsersAction,
} from '@/app/actions/masterData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ExcelImportExport } from '@/components/ExcelImportExport';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  exportToExcel,
  downloadExcelTemplate,
  parseImportFile,
  ColumnDefinition,
} from '@/lib/masterDataExportImport';

export type UserRole = 'ADMIN' | 'OWNER' | 'SITE MANAGER' | 'MANAGEMENT';

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const STORAGE_KEY = 'foplp_master_users_v2';

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'ec0a5b9c-1e1c-4c32-854d-6884336e58a7',
    username: 'admin',
    fullName: 'Admin Proper (Super Administrator)',
    password: 'admin123',
    role: 'ADMIN',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE',
  },
  {
    id: '7acef50a-f9df-4ab2-bc6b-d5f9ceda7d02',
    username: 'owner',
    fullName: 'Direktur Utama (Owner)',
    password: 'owner123',
    role: 'OWNER',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE',
  },
  {
    id: 'f2ae8c76-1065-41af-b892-4a7e76f6a990',
    username: 'sitemanager',
    fullName: 'Budi Santoso, S.T.',
    password: 'sm12345',
    role: 'SITE MANAGER',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE',
  },
  {
    id: '711a15ba-aec0-462b-a994-0c3c7384dad1',
    username: 'management',
    fullName: 'Dewi Lestari, S.E.',
    password: 'mgmt12345',
    role: 'MANAGEMENT',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE',
  },
];

const EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: 'username', label: 'Username (Login)', required: true },
  { key: 'fullName', label: 'Nama Lengkap', required: true },
  { key: 'password', label: 'Password', required: true },
  { key: 'role', label: 'Role (ADMIN/OWNER/SITE MANAGER/MANAGEMENT)', required: true },
  { key: 'status', label: 'Status (ACTIVE/INACTIVE)' },
];

export default function MasterDataUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('username-asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    username: string;
    fullName: string;
    password: string;
    role: UserRole;
  }>({
    username: '',
    fullName: '',
    password: '',
    role: 'ADMIN',
  });
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadUsers = async () => {
    setIsLoadingData(true);
    try {
      const res = await getUsersAction();
      let serverUsers: SystemUser[] = [];

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        serverUsers = res.data.map((u) => ({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          password: u.password,
          role: (u.role as UserRole) || 'ADMIN',
          createdAt: u.createdAt || new Date().toISOString(),
          status: (u.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
        }));
      }

      if (serverUsers.length > 0) {
        setUsers(serverUsers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUsers));
      } else {
        setUsers(INITIAL_USERS);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
      setUsers(INITIAL_USERS);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const saveUsersState = (updated: SystemUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  };

  // Filtered and Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const valA = ((a as any)[field] || '').toString().toLowerCase();
      const valB = ((b as any)[field] || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortBy]);

  // Paginated List
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, page, pageSize]);

  // Selection Handlers
  const isAllCurrentPageSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllCurrentPageSelected) {
      paginatedData.forEach((item) => next.delete(item.id));
    } else {
      paginatedData.forEach((item) => next.add(item.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Sort Toggle
  const handleSortToggle = (field: string) => {
    if (sortBy === `${field}-asc`) {
      setSortBy(`${field}-desc`);
    } else {
      setSortBy(`${field}-asc`);
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy === `${field}-asc`) return <ArrowUp className="inline-block ml-1 h-3.5 w-3.5" />;
    if (sortBy === `${field}-desc`) return <ArrowDown className="inline-block ml-1 h-3.5 w-3.5" />;
    return <ArrowUpDown className="inline-block ml-1 h-3.5 w-3.5 opacity-40 hover:opacity-100" />;
  };

  // Metric counts
  const roleStats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
      owner: users.filter((u) => u.role === 'OWNER').length,
      siteManager: users.filter((u) => u.role === 'SITE MANAGER').length,
      management: users.filter((u) => u.role === 'MANAGEMENT').length,
    };
  }, [users]);

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy password
  const handleCopyPassword = (id: string, pass: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pass);
      setCopiedId(id);
      toast.success('Password berhasil disalin!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      username: '',
      fullName: '',
      password: '',
      role: 'ADMIN',
    });
    setShowModalPassword(false);
    setIsDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (user: SystemUser) => {
    setEditId(user.id);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: user.password,
      role: user.role,
    });
    setShowModalPassword(false);
    setIsDialogOpen(true);
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: result }));
    setShowModalPassword(true);
    toast.info('Password acak berhasil dibuat!');
  };

  // Submit Create or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const trimmedUsername = formData.username.trim().toLowerCase();
    const trimmedFullName = formData.fullName.trim();
    const trimmedPassword = formData.password.trim();

    if (!trimmedUsername || !trimmedFullName || !trimmedPassword) {
      toast.error('Semua field wajib diisi!');
      setIsSubmitting(false);
      return;
    }

    const isDuplicate = users.some(
      (u) => u.username.toLowerCase() === trimmedUsername && u.id !== editId
    );
    if (isDuplicate) {
      toast.error(`Username "${trimmedUsername}" sudah digunakan oleh user lain!`);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await saveUserAction({
        id: editId || undefined,
        username: trimmedUsername,
        fullName: trimmedFullName,
        password: trimmedPassword,
        role: formData.role,
        status: 'ACTIVE',
      });

      if (!res.success || !res.data) {
        toast.error(res.error || 'Gagal menyimpan data pengguna');
        setIsSubmitting(false);
        return;
      }

      if (editId) {
        const updated = users.map((u) => (u.id === editId ? (res.data as SystemUser) : u));
        saveUsersState(updated);
        toast.success('Data pengguna berhasil diperbarui!');
      } else {
        const updated = [res.data as SystemUser, ...users];
        saveUsersState(updated);
        toast.success('Pengguna baru berhasil ditambahkan!');
      }

      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat menyimpan data pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);

    try {
      const res = await deleteUserAction(userToDelete.id, userToDelete.username);
      if (!res.success) {
        toast.error(res.error || 'Gagal menghapus pengguna');
        setIsSubmitting(false);
        return;
      }

      const updated = users.filter((u) => u.id !== userToDelete.id);
      saveUsersState(updated);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(userToDelete.id);
        return next;
      });
      toast.success(`Pengguna "${userToDelete.fullName}" berhasil dihapus.`);
      setDeleteOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat menghapus pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Excel Handlers
  const handleExport = async () => {
    exportToExcel(filteredAndSortedUsers, 'Master_Data_Users', EXCEL_COLUMNS);
    toast.success('File Excel berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Users', INITIAL_USERS.slice(0, 3));
    toast.success('Template Excel berhasil diunduh');
  };

  const handleImport = async (file: File) => {
    try {
      const parsed = await parseImportFile(file, EXCEL_COLUMNS);
      if (parsed.length === 0) {
        toast.error('File kosong atau format kolom tidak sesuai.');
        return;
      }
      const validRows = parsed
        .map((row) => ({
          username: String(row.username || '').trim().toLowerCase(),
          fullName: String(row.fullName || '').trim(),
          password: String(row.password || 'admin123').trim(),
          role: (row.role || 'ADMIN') as UserRole,
          status: (row.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
        }))
        .filter((r) => r.username && r.fullName);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Username dan Nama Lengkap.');
        return;
      }

      const res = await batchAddUsersAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} pengguna.`);
        await loadUsers();
      } else {
        toast.error(res.error || 'Gagal mengimpor pengguna');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses file');
    }
  };

  // Render Role Badge
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900/50 hover:bg-red-500/20 font-semibold px-2 py-0.5 text-[11px] gap-1 shadow-none">
            <ShieldCheck className="w-3 h-3" /> ADMIN
          </Badge>
        );
      case 'OWNER':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50 hover:bg-amber-500/20 font-semibold px-2 py-0.5 text-[11px] gap-1 shadow-none">
            <Crown className="w-3 h-3" /> OWNER
          </Badge>
        );
      case 'SITE MANAGER':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-900/50 hover:bg-blue-500/20 font-semibold px-2 py-0.5 text-[11px] gap-1 shadow-none">
            <HardHat className="w-3 h-3" /> SITE MANAGER
          </Badge>
        );
      case 'MANAGEMENT':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/50 hover:bg-emerald-500/20 font-semibold px-2 py-0.5 text-[11px] gap-1 shadow-none">
            <Briefcase className="w-3 h-3" /> MANAGEMENT
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[11px]">{role}</Badge>;
    }
  };

  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Master Data Pengguna
            </h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            Kelola data otentikasi login, username, nama lengkap, kata sandi, dan peranan pengguna sistem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={isLoadingData}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoadingData}
            title="Muat ulang dan sinkronkan dengan database server"
            className="h-[32px] my-[6px] mx-[8px] px-2.5 gap-1.5 text-[13px]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            Sinkronkan
          </Button>


          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-[32px] my-[6px] mx-[8px] px-3 gap-1.5 text-[13px] font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-card border border-border/60 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground font-medium">Total Akun</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{roleStats.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/60 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground font-medium">Admin & Owner</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {roleStats.admin + roleStats.owner}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <Crown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/60 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground font-medium">Site Manager</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{roleStats.siteManager}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <HardHat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/60 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground font-medium">Management</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{roleStats.management}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4.5 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama lengkap atau username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-[32px] my-[6px] mx-[8px] text-[13px] bg-background"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v || 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px] bg-background">
                <SelectValue placeholder="Semua Peran (Role)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Peran (Role)</SelectItem>
                <SelectItem value="ADMIN" className="text-[13px]">ADMIN</SelectItem>
                <SelectItem value="OWNER" className="text-[13px]">OWNER</SelectItem>
                <SelectItem value="SITE MANAGER" className="text-[13px]">SITE MANAGER</SelectItem>
                <SelectItem value="MANAGEMENT" className="text-[13px]">MANAGEMENT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v || 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px] bg-background">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Status</SelectItem>
                <SelectItem value="ACTIVE" className="text-[13px]">Aktif</SelectItem>
                <SelectItem value="INACTIVE" className="text-[13px]">Non-Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
          <span className="text-[13px] text-muted-foreground whitespace-nowrap mx-[8px] my-[6px]">Urutkan:</span>
          <Select
            value={sortBy}
            onValueChange={(val) => {
              setSortBy(val || 'username-asc');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-[32px] my-[6px] mx-[8px] w-48 text-[13px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="username-asc" className="text-[13px]">Username (A-Z)</SelectItem>
              <SelectItem value="username-desc" className="text-[13px]">Username (Z-A)</SelectItem>
              <SelectItem value="fullName-asc" className="text-[13px]">Nama Lengkap (A-Z)</SelectItem>
              <SelectItem value="fullName-desc" className="text-[13px]">Nama Lengkap (Z-A)</SelectItem>
              <SelectItem value="role-asc" className="text-[13px]">Role (A-Z)</SelectItem>
              <SelectItem value="role-desc" className="text-[13px]">Role (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Single Border (No Double Outline) */}
      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-3 text-[13px]">
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Pilih semua baris"
                />
              </TableHead>
              <TableHead
                className="min-w-[200px] cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('fullName')}
              >
                Nama Lengkap {renderSortIcon('fullName')}
              </TableHead>
              <TableHead
                className="w-44 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('username')}
              >
                Username (Login) {renderSortIcon('username')}
              </TableHead>
              <TableHead className="w-48 text-[13px] font-semibold">Password</TableHead>
              <TableHead
                className="w-40 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('role')}
              >
                Peran (Role) {renderSortIcon('role')}
              </TableHead>
              <TableHead className="w-28 text-center text-[13px] font-semibold">Status</TableHead>
              <TableHead className="w-24 text-right pr-4 text-[13px] font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingData ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-[13px] text-muted-foreground">
                  Memuat data pengguna...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-[13px]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Tidak ada pengguna ditemukan dengan kriteria pencarian.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((u) => {
                const isSelected = selectedIds.has(u.id);
                const isVisible = !!visiblePasswords[u.id];
                const isCopied = copiedId === u.id;

                return (
                  <TableRow
                    key={u.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/30 transition-colors text-[13px]"
                  >
                    <TableCell className="px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(u.id)}
                        aria-label={`Pilih ${u.username}`}
                      />
                    </TableCell>

                    {/* Full Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[12px] border border-primary/20 shrink-0">
                          {getAvatarInitials(u.fullName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px] text-foreground leading-tight">
                            {u.fullName}
                          </span>
                          <span className="text-[12px] text-muted-foreground font-mono mt-0.5">
                            {u.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Username */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted/60 border border-border/80 text-[13px] font-mono font-medium text-foreground">
                        <span className="text-muted-foreground">@</span>
                        {u.username}
                      </div>
                    </TableCell>

                    {/* Password */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded bg-muted/50 border border-border/80 text-[13px] font-mono text-foreground tracking-wider min-w-[80px]">
                          {isVisible ? u.password : '••••••••'}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-foreground"
                          title={isVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyPassword(u.id, u.password)}
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-foreground"
                          title="Salin password"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>{renderRoleBadge(u.role)}</TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[12px] font-medium px-2.5 py-0.5 ${
                          u.status === 'ACTIVE'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'text-zinc-600 bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(u)}
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-primary"
                          title="Edit Pengguna"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteOpen(true);
                          }}
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-destructive"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        totalItems={filteredAndSortedUsers.length}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        selectedCount={selectedIds.size}
      />

      {/* Modal Dialog: Tambah / Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[16px] font-semibold">
                {editId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </DialogTitle>
              <DialogDescription className="text-[13px]">
                {editId
                  ? 'Perbarui informasi login, nama lengkap, password, atau peranan.'
                  : 'Lengkapi 4 data utama pengguna untuk hak akses login sistem.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3">
              <div className="grid gap-1.5">
                <Label htmlFor="input-username" className="text-[13px] font-semibold">
                  1. Username (Untuk Login) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">
                    @
                  </span>
                  <Input
                    id="input-username"
                    type="text"
                    placeholder="misal: admin, budi.sm, hendra"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '') })
                    }
                    className="pl-7 h-[32px] text-[13px] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="input-fullname" className="text-[13px] font-semibold">
                  2. Full Name (Nama Lengkap) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="input-fullname"
                  type="text"
                  placeholder="misal: Budi Santoso, S.T."
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-[32px] text-[13px]"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="input-password" className="text-[13px] font-semibold">
                    3. Password (Kata Sandi) <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[12px] text-primary hover:underline font-medium"
                  >
                    Acak Password
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="input-password"
                    type={showModalPassword ? 'text' : 'password'}
                    placeholder="Masukkan password akun..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10 h-[32px] text-[13px] font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showModalPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="select-role" className="text-[13px] font-semibold">
                  4. Role (Hak Akses Peran) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => {
                    if (val) setFormData({ ...formData, role: val as UserRole });
                  }}
                >
                  <SelectTrigger id="select-role" className="h-[32px] text-[13px] bg-background">
                    <SelectValue placeholder="Pilih Role Pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN" className="text-[13px]">
                      ADMIN - Hak akses penuh sistem
                    </SelectItem>
                    <SelectItem value="OWNER" className="text-[13px]">
                      OWNER - Pemilik proyek / eksekutif
                    </SelectItem>
                    <SelectItem value="SITE MANAGER" className="text-[13px]">
                      SITE MANAGER - Manajer lapangan & progress
                    </SelectItem>
                    <SelectItem value="MANAGEMENT" className="text-[13px]">
                      MANAGEMENT - Pengawasan finansial & operasional
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="h-[32px] text-[13px]"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-[32px] text-[13px]">
                {editId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Konfirmasi Hapus */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Hapus Pengguna
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-1">
              Apakah Anda yakin ingin menghapus akun pengguna{' '}
              <strong className="text-foreground">{userToDelete?.fullName}</strong> (
              <span className="text-muted-foreground">@{userToDelete?.username}</span>)?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              className="h-[32px] text-[13px]"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="h-[32px] text-[13px]"
            >
              Ya, Hapus Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
