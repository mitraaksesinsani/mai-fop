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
  KeyRound,
  ShieldCheck,
  UserCheck,
  Crown,
  Briefcase,
  HardHat,
  Filter,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export type UserRole = 'ADMIN' | 'OWNER' | 'SITE MANAGER' | 'MANAGEMENT';

export interface SystemUser {
  id: string;
  username: string; // untuk login
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
    status: 'ACTIVE'
  },
  {
    id: '7acef50a-f9df-4ab2-bc6b-d5f9ceda7d02',
    username: 'owner',
    fullName: 'Direktur Utama (Owner)',
    password: 'owner123',
    role: 'OWNER',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE'
  },
  {
    id: 'f2ae8c76-1065-41af-b892-4a7e76f6a990',
    username: 'sitemanager',
    fullName: 'Budi Santoso, S.T.',
    password: 'sm12345',
    role: 'SITE MANAGER',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE'
  },
  {
    id: '711a15ba-aec0-462b-a994-0c3c7384dad1',
    username: 'management',
    fullName: 'Dewi Lestari, S.E.',
    password: 'mgmt12345',
    role: 'MANAGEMENT',
    createdAt: '2026-09-14T09:30:56.549Z',
    status: 'ACTIVE'
  }
];

export default function MasterDataUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
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
    role: 'ADMIN'
  });
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  // Load users from Supabase or localStorage
  const loadUsers = async () => {
    // 1. Coba ambil dari Supabase jika tersambung
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: SystemUser[] = data.map((u: any) => ({
            id: u.id,
            username: u.username,
            fullName: u.name || u.fullName,
            password: u.password,
            role: (u.role as UserRole) || 'ADMIN',
            createdAt: u.created_at || new Date().toISOString(),
            status: (u.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE'
          }));
          setUsers(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch notice, falling back to local:', err);
      }
    }

    // 2. Fallback ke localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          return;
        }
      }
      setUsers(INITIAL_USERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    } catch (e) {
      setUsers(INITIAL_USERS);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Save to localStorage helper
  const saveUsers = (updated: SystemUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Metric counts
  const roleStats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
      owner: users.filter((u) => u.role === 'OWNER').length,
      siteManager: users.filter((u) => u.role === 'SITE MANAGER').length,
      management: users.filter((u) => u.role === 'MANAGEMENT').length
    };
  }, [users]);

  // Toggle password visibility in table
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy password to clipboard
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
      role: 'ADMIN'
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
      role: user.role
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
  const handleSubmit = (e: React.FormEvent) => {
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

    // Check duplicate username
    const isDuplicate = users.some(
      (u) => u.username.toLowerCase() === trimmedUsername && u.id !== editId
    );
    if (isDuplicate) {
      toast.error(`Username "${trimmedUsername}" sudah digunakan oleh user lain!`);
      setIsSubmitting(false);
      return;
    }

    if (editId) {
      // Update
      const updated = users.map((u) =>
        u.id === editId
          ? {
              ...u,
              username: trimmedUsername,
              fullName: trimmedFullName,
              password: trimmedPassword,
              role: formData.role
            }
          : u
      );
      saveUsers(updated);

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('users')
          .update({
            username: trimmedUsername,
            name: trimmedFullName,
            password: trimmedPassword,
            role: formData.role
          })
          .eq('id', editId)
          .then(({ error }) => {
            if (error) console.warn('Supabase update user notice:', error.message);
          });
      }

      toast.success('Data pengguna berhasil diperbarui!');
    } else {
      // Create
      const newUser: SystemUser = {
        id: `usr-${Date.now()}`,
        username: trimmedUsername,
        fullName: trimmedFullName,
        password: trimmedPassword,
        role: formData.role,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE'
      };
      saveUsers([newUser, ...users]);

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('users')
          .insert([
            {
              username: trimmedUsername,
              name: trimmedFullName,
              password: trimmedPassword,
              role: formData.role,
              status: 'ACTIVE'
            }
          ])
          .then(({ error }) => {
            if (error) console.warn('Supabase insert user notice:', error.message);
          });
      }

      toast.success('Pengguna baru berhasil ditambahkan!');
    }

    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const updated = users.filter((u) => u.id !== userToDelete.id);
    saveUsers(updated);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase delete user notice:', error.message);
        });
    }

    toast.success(`Pengguna "${userToDelete.fullName}" berhasil dihapus.`);
    setDeleteOpen(false);
    setUserToDelete(null);
  };

  // Reset to default seeds
  const handleResetData = () => {
    saveUsers(INITIAL_USERS);
    toast.info('Data pengguna berhasil dikembalikan ke data awal.');
  };

  // Render Role Badge
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900/50 hover:bg-red-500/20 font-semibold px-2.5 py-0.5 gap-1.5 shadow-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN
          </Badge>
        );
      case 'OWNER':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50 hover:bg-amber-500/20 font-semibold px-2.5 py-0.5 gap-1.5 shadow-none">
            <Crown className="w-3.5 h-3.5" />
            OWNER
          </Badge>
        );
      case 'SITE MANAGER':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-900/50 hover:bg-blue-500/20 font-semibold px-2.5 py-0.5 gap-1.5 shadow-none">
            <HardHat className="w-3.5 h-3.5" />
            SITE MANAGER
          </Badge>
        );
      case 'MANAGEMENT':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/50 hover:bg-emerald-500/20 font-semibold px-2.5 py-0.5 gap-1.5 shadow-none">
            <Briefcase className="w-3.5 h-3.5" />
            MANAGEMENT
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // User initial avatar
  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
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
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data otentikasi login, username, nama lengkap, kata sandi, dan peranan pengguna sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            title="Kembalikan data contoh awal"
            className="text-muted-foreground hover:text-foreground h-10 px-3 gap-1.5 text-xs rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Data
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="h-10 px-4 gap-2 font-medium shadow-sm rounded-lg flex-1 sm:flex-initial"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Akun</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{roleStats.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Admin & Owner</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {roleStats.admin + roleStats.owner}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <Crown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Site Manager</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{roleStats.siteManager}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <HardHat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Management</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{roleStats.management}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 sm:p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari nama lengkap atau username login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background rounded-lg border-input text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-[200px]">
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v || 'ALL')}>
              <SelectTrigger className="h-10 rounded-lg border-input bg-background text-sm">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Semua Peran (Role)" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Peran (Role)</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="OWNER">OWNER</SelectItem>
                <SelectItem value="SITE MANAGER">SITE MANAGER</SelectItem>
                <SelectItem value="MANAGEMENT">MANAGEMENT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile Card List View (Tampil pada layar kecil / <= 640px, khususnya 390px) */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-xl p-6">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-foreground">Tidak ada pengguna ditemukan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sesuaikan kata kunci pencarian atau tambah pengguna baru.
            </p>
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isVisible = !!visiblePasswords[u.id];
            const isCopied = copiedId === u.id;

            return (
              <Card key={u.id} className="border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-4 space-y-3.5">
                  {/* Top: Avatar, Name & Role */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 shrink-0">
                        {getAvatarInitials(u.fullName)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground leading-snug">
                          {u.fullName}
                        </h3>
                        <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                      </div>
                    </div>
                    <div>{renderRoleBadge(u.role)}</div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-2 text-xs">
                    {/* Username */}
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-muted-foreground">Username (Login):</span>
                      <span className="font-semibold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                        @{u.username}
                      </span>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-muted-foreground">Password:</span>
                      <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border border-border">
                        <span className="font-medium text-foreground">
                          {isVisible ? u.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                          title={isVisible ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyPassword(u.id, u.password)}
                          className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                          title="Salin password"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(u)}
                      className="h-8 px-3 text-xs gap-1.5 rounded-lg border-input"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(u);
                        setDeleteOpen(true);
                      }}
                      className="h-8 px-3 text-xs gap-1.5 rounded-lg border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table View (Tampil pada layar >= md / 768px) */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[60px] text-center">No.</TableHead>
              <TableHead className="w-[240px]">Nama Lengkap</TableHead>
              <TableHead className="w-[180px]">Username (Login)</TableHead>
              <TableHead className="w-[200px]">Password</TableHead>
              <TableHead className="w-[170px]">Peran (Role)</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="w-9 h-9 mb-2 opacity-40" />
                    <p className="font-medium text-sm text-foreground">
                      Tidak ada pengguna ditemukan
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gunakan kata kunci lain atau tambahkan akun pengguna baru.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u, idx) => {
                const isVisible = !!visiblePasswords[u.id];
                const isCopied = copiedId === u.id;

                return (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-xs text-muted-foreground font-medium">
                      {idx + 1}
                    </TableCell>

                    {/* Full Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 shrink-0">
                          {getAvatarInitials(u.fullName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground leading-tight">
                            {u.fullName}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            ID: {u.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Username */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border/80 text-xs font-semibold text-foreground">
                        <span className="text-muted-foreground font-normal">@</span>
                        {u.username}
                      </div>
                    </TableCell>

                    {/* Password */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded-md bg-muted/50 border border-border/80 text-xs font-medium text-foreground tracking-wider min-w-[100px]">
                          {isVisible ? u.password : '••••••••'}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title={isVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyPassword(u.id, u.password)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Salin password"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>{renderRoleBadge(u.role)}</TableCell>

                    {/* Status */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(u)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Edit Pengguna"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Dialog: Tambah / Edit Pengguna */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  {editId ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                {editId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </DialogTitle>
              <DialogDescription>
                {editId
                  ? 'Perbarui informasi username login, nama lengkap, password, atau peranan.'
                  : 'Lengkapi 4 data utama pengguna untuk hak akses login sistem.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Field 1: Username */}
              <div className="grid gap-1.5">
                <Label htmlFor="input-username" className="text-xs font-semibold">
                  1. Username (Untuk Login) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
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
                    className="pl-7 h-10 rounded-lg text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Digunakan untuk otentikasi login masuk sistem. Huruf kecil tanpa spasi.
                </p>
              </div>

              {/* Field 2: Full Name */}
              <div className="grid gap-1.5">
                <Label htmlFor="input-fullname" className="text-xs font-semibold">
                  2. Full Name (Nama Lengkap) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="input-fullname"
                  type="text"
                  placeholder="misal: Budi Santoso, S.T."
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Field 3: Password */}
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="input-password" className="text-xs font-semibold">
                    3. Password (Kata Sandi) <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-primary hover:underline font-medium"
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
                    className="pr-10 h-10 rounded-lg text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showModalPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showModalPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Field 4: Role */}
              <div className="grid gap-1.5">
                <Label htmlFor="select-role" className="text-xs font-semibold">
                  4. Role (Hak Akses Peran) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => {
                    if (val) setFormData({ ...formData, role: val as UserRole });
                  }}
                >
                  <SelectTrigger id="select-role" className="h-10 rounded-lg text-sm bg-background">
                    <SelectValue placeholder="Pilih Role Pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span className="font-medium">ADMIN</span>
                        <span className="text-xs text-muted-foreground">- Hak akses penuh sistem</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OWNER">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-600" />
                        <span className="font-medium">OWNER</span>
                        <span className="text-xs text-muted-foreground">- Pemilik proyek / eksekutif</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SITE MANAGER">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">SITE MANAGER</span>
                        <span className="text-xs text-muted-foreground">- Manajer lapangan & progress harian</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MANAGEMENT">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">MANAGEMENT</span>
                        <span className="text-xs text-muted-foreground">- Pengawasan finansial & operasional</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="h-10 rounded-lg text-sm"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-10 rounded-lg text-sm gap-2">
                {editId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Konfirmasi Hapus */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5" />
            </div>
            <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun pengguna{' '}
              <strong className="text-foreground">{userToDelete?.fullName}</strong> (
              <span className="text-muted-foreground">@{userToDelete?.username}</span>)?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="h-10 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="h-10 rounded-lg"
            >
              Ya, Hapus Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
