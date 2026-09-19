'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Users, Phone, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExcelImportExport } from '@/components/ExcelImportExport';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  exportToExcel,
  downloadExcelTemplate,
  parseImportFile,
  ColumnDefinition,
} from '@/lib/masterDataExportImport';
import {
  getMandorsAction,
  addMandorAction,
  updateMandorAction,
  deleteMandorAction,
  batchDeleteMandorsAction,
  batchAddMandorsAction,
} from '@/app/actions/masterData';
import { ServerMandor } from '@/lib/serverDb';

export const SPESIALISASI_MANDOR = [
  'Galian & Boring',
  'Penarikan Kabel (FO)',
  'Splicing & Terminasi',
  'Pemasangan Tiang & Aksesoris',
  'Civil Work & Pemulihan (Restorasi)',
  'General OSP',
];

const EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: 'code', label: 'Kode Mandor', required: true },
  { key: 'name', label: 'Nama Mandor', required: true },
  { key: 'phone', label: 'No. Telepon / HP' },
  { key: 'specialization', label: 'Spesialisasi / Keahlian' },
  { key: 'teamSize', label: 'Jumlah Tim (Orang)' },
  { key: 'status', label: 'Status (ACTIVE/INACTIVE)' },
  { key: 'notes', label: 'Catatan' },
];

export default function MasterMandorPage() {
  const [data, setData] = useState<ServerMandor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('code-asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    specialization: 'Galian & Boring',
    teamSize: 8,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMandorsAction();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat master data mandor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort
  const filteredAndSortedData = useMemo(() => {
    let result = data.filter((item) => {
      const query = search.toLowerCase();
      const matchSearch =
        item.code?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.specialization?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query);

      const matchSpec = specFilter === 'ALL' || item.specialization === specFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchSpec && matchStatus;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a: any, b: any) => {
      let valA = a[field] ?? '';
      let valB = b[field] ?? '';

      if (field === 'teamSize') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return order === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [data, search, specFilter, statusFilter, sortBy]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

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

  // CRUD Handlers
  const openCreateDialog = () => {
    setEditId(null);
    const nextNum = data.length + 1;
    const autoCode = `MDR-${String(nextNum).padStart(3, '0')}`;
    setFormData({
      code: autoCode,
      name: '',
      phone: '',
      specialization: 'Galian & Boring',
      teamSize: 8,
      status: 'ACTIVE',
      notes: '',
    });
    setIsOpen(true);
  };

  const openEditDialog = (item: ServerMandor) => {
    setEditId(item.id);
    setFormData({
      code: item.code,
      name: item.name,
      phone: item.phone || '',
      specialization: item.specialization || 'Galian & Boring',
      teamSize: item.teamSize || 8,
      status: item.status || 'ACTIVE',
      notes: item.notes || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama mandor wajib diisi');
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase() || `MDR-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      specialization: formData.specialization,
      teamSize: Number(formData.teamSize) || 8,
      status: formData.status,
      notes: formData.notes.trim(),
    };

    if (editId) {
      setData((prev) => prev.map((item) => (item.id === editId ? { ...item, ...payload } : item)));
      const res = await updateMandorAction(editId, payload);
      if (res.success) {
        toast.success('Data mandor berhasil diperbarui');
      } else {
        toast.error(res.error || 'Gagal memperbarui data mandor');
        loadData();
      }
    } else {
      const res = await addMandorAction(payload);
      if (res.success && res.data) {
        setData((prev) => [res.data!, ...prev]);
        toast.success('Mandor baru berhasil ditambahkan');
      } else {
        toast.error(res.error || 'Gagal menambahkan mandor');
      }
    }
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mandor ini?')) {
      const prevData = [...data];
      setData((prev) => prev.filter((item) => item.id !== id));
      const res = await deleteMandorAction(id);
      if (res.success) {
        toast.success('Data mandor berhasil dihapus');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        setData(prevData);
        toast.error(res.error || 'Gagal menghapus data mandor');
      }
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    const prevData = [...data];
    setData((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    try {
      const res = await batchDeleteMandorsAction(idsToDelete);
      if (res.success) {
        toast.success(`${idsToDelete.length} Data mandor berhasil dihapus`);
        setSelectedIds(new Set());
        setIsBulkDeleteOpen(false);
      } else {
        setData(prevData);
        toast.error(res.error || 'Gagal menghapus mandor terpilih');
      }
    } catch {
      setData(prevData);
      toast.error('Terjadi kesalahan saat menghapus data terpilih');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Excel Handlers
  const handleExport = async () => {
    exportToExcel(filteredAndSortedData, 'Master_Data_Mandor_Tenaga_Kerja', EXCEL_COLUMNS);
    toast.success('File Excel master data mandor berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        code: 'MDR-001',
        name: 'Budi Santoso',
        phone: '0812-3456-7890',
        specialization: 'Galian & Boring',
        teamSize: 8,
        status: 'ACTIVE',
        notes: 'Mandor regu galian tanah',
      },
      {
        code: 'MDR-002',
        name: 'Agus Supriyadi',
        phone: '0813-9876-5432',
        specialization: 'Penarikan Kabel (FO)',
        teamSize: 6,
        status: 'ACTIVE',
        notes: 'Mandor regu penarikan kabel duct',
      },
    ];
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Mandor', sampleRows);
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
          code: String(row.code || '').trim(),
          name: String(row.name || '').trim(),
          phone: String(row.phone || '').trim(),
          specialization: String(row.specialization || 'General OSP').trim(),
          teamSize: Number(row.teamSize) || 8,
          status: (String(row.status || '').toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
          notes: String(row.notes || '').trim(),
        }))
        .filter((r) => r.name);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Nama Mandor yang ditemukan.');
        return;
      }

      const res = await batchAddMandorsAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} data mandor.`);
        await loadData();
      } else {
        toast.error(res.error || 'Gagal mengimpor data');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses file');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Master Data Mandor & Tenaga Kerja</h1>
            <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal">
              {data.length} Terdaftar
            </Badge>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            Kelola data mandor regu lapangan, spesialisasi keahlian pekerjaan, kapasitas tim, dan kontak operasional.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={loading}
          />
          <Button onClick={openCreateDialog} size="sm" className="h-[34px] gap-1.5 text-[13px] font-medium">
            <Plus className="h-4 w-4" /> Tambah Mandor
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="h-[34px] gap-1.5 text-[13px] bg-red-600 hover:bg-red-700 text-white animate-in fade-in"
            >
              <Trash2 className="h-4 w-4" /> Hapus ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode, nama, kontak..."
              className="pl-9 h-[34px] text-[13px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Spesialisasi Filter */}
          <div className="w-full sm:w-56">
            <Select
              value={specFilter}
              onValueChange={(val) => {
                setSpecFilter(val || 'ALL');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-[34px] text-[13px]">
                <SelectValue placeholder="Spesialisasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Spesialisasi</SelectItem>
                {SPESIALISASI_MANDOR.map((s) => (
                  <SelectItem key={s} value={s} className="text-[13px]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val || 'ALL');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-[34px] text-[13px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Status</SelectItem>
                <SelectItem value="ACTIVE" className="text-[13px]">Aktif</SelectItem>
                <SelectItem value="INACTIVE" className="text-[13px]">Non-Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Total Terfilter */}
        <div className="text-[13px] text-muted-foreground ml-auto">
          Menampilkan <span className="font-semibold text-foreground">{filteredAndSortedData.length}</span> mandor
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[48px] text-center">
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Pilih semua baris"
                />
              </TableHead>
              <TableHead
                className="w-[120px] cursor-pointer select-none text-[13px]"
                onClick={() => handleSortToggle('code')}
              >
                Kode {renderSortIcon('code')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-[13px]"
                onClick={() => handleSortToggle('name')}
              >
                Nama Mandor {renderSortIcon('name')}
              </TableHead>
              <TableHead className="w-[160px] text-[13px]">Kontak / HP</TableHead>
              <TableHead className="text-[13px]">Spesialisasi</TableHead>
              <TableHead
                className="w-[140px] cursor-pointer select-none text-[13px]"
                onClick={() => handleSortToggle('teamSize')}
              >
                Regu / Tim {renderSortIcon('teamSize')}
              </TableHead>
              <TableHead className="w-[110px] text-center text-[13px]">Status</TableHead>
              <TableHead className="w-[100px] text-right text-[13px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-[13px]">
                  Memuat data mandor...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-[13px]">
                  Tidak ada data mandor yang sesuai.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <TableRow
                    key={item.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(item.id)}
                        aria-label={`Pilih ${item.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {item.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[13px] text-foreground flex items-center gap-1.5">
                          <HardHat className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {item.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          {item.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal bg-muted text-foreground border">
                        {item.specialization || 'General OSP'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        {item.teamSize || 8} Orang
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[11px]">
                          Non-Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(item)}
                          title="Edit Mandor"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                          title="Hapus Mandor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Pagination Controls */}
      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredAndSortedData.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />

      {/* Dialog Form Create / Edit */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Data Mandor' : 'Tambah Mandor Baru'}</DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi formulir di bawah ini untuk menyimpan master data mandor lapangan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-medium">
                  Kode Mandor <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="MDR-001"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">
                  No. HP / Telepon
                </Label>
                <Input
                  id="phone"
                  placeholder="0812-3456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nama Lengkap Mandor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="specialization" className="text-xs font-medium">
                  Spesialisasi Pekerjaan
                </Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(val) => setFormData((p) => ({ ...p, specialization: val || 'Galian & Boring' }))}
                >
                  <SelectTrigger id="specialization" className="h-9 text-xs">
                    <SelectValue placeholder="Pilih Spesialisasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPESIALISASI_MANDOR.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="teamSize" className="text-xs font-medium">
                  Kapasitas Tim (Orang)
                </Label>
                <Input
                  id="teamSize"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="8"
                  value={formData.teamSize}
                  onChange={(e) => setFormData((p) => ({ ...p, teamSize: parseInt(e.target.value, 10) || 1 }))}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium">
                Status Operasional
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) => setFormData((p) => ({ ...p, status: val }))}
              >
                <SelectTrigger id="status" className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="text-xs">Aktif (Siap Tugas)</SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs">Non-Aktif (Istirahat / Off)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">
                Catatan / Keterangan
              </Label>
              <Input
                id="notes"
                placeholder="Pengalaman kerja, sertifikasi K3, dsb."
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                {editId ? 'Simpan Perubahan' : 'Tambah Mandor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Massal */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Data Mandor Terpilih?</DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus {selectedIds.size} data mandor yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(false)}
              disabled={isBulkDeleting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmBulkDelete}
              disabled={isBulkDeleting}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {isBulkDeleting ? 'Menghapus...' : `Hapus ${selectedIds.size} Mandor`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
