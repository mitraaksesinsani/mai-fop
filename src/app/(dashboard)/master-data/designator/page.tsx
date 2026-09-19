'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
  getDesignatorsAction,
  addDesignatorAction,
  updateDesignatorAction,
  deleteDesignatorAction,
  batchDeleteDesignatorsAction,
  batchAddDesignatorsAction,
} from '@/app/actions/masterData';

export const MASTER_DESIGNATOR_DATA = [
  { id: 'dsg-1', code: 'GL-OPEN-TRENCH-1M', description: 'Galian Tanah Manual Kedalaman 1 Meter', type: 'Galian', unit: 'Meter' },
  { id: 'dsg-2', code: 'AC-OF-SM-ADSS-24D', description: 'Penarikan Kabel Fiber Optik ADSS 24 Core', type: 'Kabel', unit: 'Meter' },
  { id: 'dsg-3', code: 'PU-S7.0-140', description: 'Pendirian Tiang Besi 7 Meter 140 daN', type: 'Tiang', unit: 'batang' },
  { id: 'dsg-4', code: 'JB-SPAN-TRAYS-FO', description: 'Konstruksi Jembatan Kabel & Trays FO', type: 'Jembatan', unit: 'Meter' },
  { id: 'dsg-5', code: 'HH-PRECAST-TYPE-B', description: 'Pemasangan Precast Handhole Type B', type: 'Handhole', unit: 'unit' },
  { id: 'dsg-6', code: 'TM-ODC-144C', description: 'Terminasi ODC 144 Core', type: 'Terminasi', unit: 'core' },
  { id: 'dsg-7', code: 'UT-OTDR-OPM-TEST', description: 'Uji Terima (UT) Pengukuran OTDR & OPM End-to-End', type: 'Uji Terima (UT)', unit: 'link' },
  { id: 'dsg-8', code: 'CT-COMM-BER-TEST', description: 'Commisioning Test (CT) & Bit Error Rate Test', type: 'Commisioning Test (CT)', unit: 'link' },
  { id: 'dsg-9', code: 'BA-REKON-ASBUILT', description: 'Penyusunan Dokumen BA Rekon & As-Built Drawing', type: 'BA Rekon', unit: 'dokumen' },
];

export const JENIS_PEKERJAAN = [
  'Galian',
  'Kabel',
  'Tiang',
  'Jembatan',
  'Handhole',
  'Terminasi',
  'Uji Terima (UT)',
  'Commisioning Test (CT)',
  'BA Rekon',
];

export const SATUAN = [
  'Meter',
  'pcs',
  'core',
  'set',
  'unit',
  'node',
  'track',
  'm3',
  'titik',
  'lumpsum',
  'batang',
  'link',
  'dokumen',
];

const EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: 'code', label: 'Kode Designator', required: true },
  { key: 'description', label: 'Deskripsi Pekerjaan', required: true },
  { key: 'type', label: 'Jenis Pekerjaan', required: true },
  { key: 'unit', label: 'Satuan', required: true },
];

export default function DesignatorPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
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
    description: '',
    type: '',
    unit: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDesignatorsAction();
      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data designator');
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
      const matchSearch =
        item.code?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || item.type === typeFilter;
      return matchSearch && matchType;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [data, search, typeFilter, sortBy]);

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

  // Sort Toggle from Table Header
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

  // CRUD Operations
  const openCreateDialog = () => {
    setEditId(null);
    setFormData({ code: '', description: '', type: '', unit: '' });
    setIsOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditId(item.id);
    setFormData({
      code: item.code,
      description: item.description,
      type: item.type,
      unit: item.unit,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.description) {
      toast.error('Kode dan deskripsi wajib diisi');
      return;
    }

    if (editId) {
      setData((prev) => prev.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
      const res = await updateDesignatorAction(editId, formData);
      if (res.success) {
        toast.success('Designator berhasil diubah');
      } else {
        toast.error(res.error || 'Gagal mengubah designator');
        loadData();
      }
    } else {
      const res = await addDesignatorAction(formData);
      if (res.success && res.data) {
        setData((prev) => [res.data!, ...prev]);
        toast.success('Designator berhasil ditambahkan');
      } else {
        toast.error(res.error || 'Gagal menambahkan designator');
      }
    }
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus designator ini?')) {
      const prevData = [...data];
      setData((prev) => prev.filter((item) => item.id !== id));
      try {
        const res = await deleteDesignatorAction(id);
        if (res.success) {
          toast.success('Designator berhasil dihapus');
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else {
          setData(prevData);
          toast.error(res.error || 'Gagal menghapus designator');
        }
      } catch (err) {
        setData(prevData);
        toast.error('Terjadi kesalahan saat menghapus');
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
      const res = await batchDeleteDesignatorsAction(idsToDelete);
      if (res.success) {
        toast.success(`${idsToDelete.length} Designator berhasil dihapus`);
        setSelectedIds(new Set());
        setIsBulkDeleteOpen(false);
      } else {
        setData(prevData);
        toast.error(res.error || 'Gagal menghapus designator terpilih');
      }
    } catch (err: any) {
      setData(prevData);
      toast.error('Terjadi kesalahan saat menghapus data terpilih');
    } finally {
      setIsBulkDeleting(false);
    }
  };


  // Excel Import / Export / Template
  const handleExport = async () => {
    exportToExcel(filteredAndSortedData, 'Master_Data_Designator', EXCEL_COLUMNS);
    toast.success('File Excel berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Designator', MASTER_DESIGNATOR_DATA.slice(0, 3));
    toast.success('Template Excel berhasil diunduh');
  };

  const handleImport = async (file: File) => {
    try {
      const parsed = await parseImportFile(file, EXCEL_COLUMNS);
      if (parsed.length === 0) {
        toast.error('File kosong atau format kolom tidak sesuai.');
        return;
      }
      const validRows = parsed.map((row) => ({
        code: String(row.code || '').trim(),
        description: String(row.description || '').trim(),
        type: String(row.type || 'Galian').trim(),
        unit: String(row.unit || 'Meter').trim(),
      })).filter((r) => r.code && r.description);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Kode dan Deskripsi yang ditemukan.');
        return;
      }

      const res = await batchAddDesignatorsAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} designator.`);
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
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Master Data Designator</h1>
          <p className="text-[13px] text-muted-foreground">Kelola daftar item pekerjaan fisik, deskripsi, jenis, dan satuannya.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={loading}
          />
          <Button onClick={openCreateDialog} size="sm" className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px]">
            <Plus className="h-4 w-4" /> Tambah Designator
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px] bg-red-600 hover:bg-red-700 text-white animate-in fade-in"
            >
              <Trash2 className="h-4 w-4" /> Hapus ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode atau deskripsi..."
              className="pl-8 h-[32px] my-[6px] mx-[8px] text-[13px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={typeFilter}
              onValueChange={(val) => {
                setTypeFilter(val || 'ALL');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px]">
                <SelectValue placeholder="Filter Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Jenis</SelectItem>
                {JENIS_PEKERJAAN.map((j) => (
                  <SelectItem key={j} value={j} className="text-[13px]">{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
          <span className="text-[13px] text-muted-foreground whitespace-nowrap mx-[8px] my-[6px]">Urutkan:</span>
          <Select
            value={sortBy}
            onValueChange={(val) => {
              setSortBy(val || 'code-asc');
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-[32px] my-[6px] mx-[8px] w-48 text-[13px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code-asc" className="text-[13px]">ID/Kode (A-Z)</SelectItem>
              <SelectItem value="code-desc" className="text-[13px]">ID/Kode (Z-A)</SelectItem>
              <SelectItem value="description-asc" className="text-[13px]">Deskripsi (A-Z)</SelectItem>
              <SelectItem value="description-desc" className="text-[13px]">Deskripsi (Z-A)</SelectItem>
              <SelectItem value="type-asc" className="text-[13px]">Jenis (A-Z)</SelectItem>
              <SelectItem value="type-desc" className="text-[13px]">Jenis (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Selection Notification Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-[13px] animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="font-medium text-red-900 dark:text-red-300">
              {selectedIds.size} Designator dipilih
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-[28px] text-[12px] text-muted-foreground hover:text-foreground"
            >
              Batal Pilih
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="h-[28px] text-[12px] gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus {selectedIds.size} Designator Terpilih
            </Button>
          </div>
        </div>
      )}

      {/* Table Container Single Border */}
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
                className="cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('code')}
              >
                Kode Designator {renderSortIcon('code')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('description')}
              >
                Deskripsi Pekerjaan {renderSortIcon('description')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('type')}
              >
                Jenis Pekerjaan {renderSortIcon('type')}
              </TableHead>
              <TableHead className="text-[13px] font-semibold">Satuan</TableHead>
              <TableHead className="text-right text-[13px] font-semibold pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-[13px] text-muted-foreground">
                  Memuat data designator...
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <TableRow
                    key={item.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(item.id)}
                        aria-label={`Pilih ${item.code}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-[13px] font-medium">{item.code}</TableCell>
                    <TableCell className="text-[13px]">{item.description}</TableCell>
                    <TableCell className="text-[13px]">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[13px] font-medium">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-right space-x-1 pr-4">
                      <Button variant="ghost" size="icon" className="h-[32px] w-[32px]" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-[32px] w-[32px]" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-[13px] text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Tidak ada data designator yang sesuai.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        totalItems={filteredAndSortedData.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedCount={selectedIds.size}
      />

      {/* Dialog Tambah / Edit */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">{editId ? 'Edit Designator' : 'Tambah Designator Baru'}</DialogTitle>
            <DialogDescription className="text-[13px]">
              Isi detail pekerjaan fisik. Form ini digunakan dalam DRM Plan dan Progress.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid gap-1.5">
              <Label className="text-[13px]">Kode Designator</Label>
              <Input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Contoh: AC-OF-SM-ADSS-24D"
                className="h-[32px] text-[13px]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px]">Deskripsi Pekerjaan</Label>
              <Input
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Penarikan Kabel Fiber Optik..."
                className="h-[32px] text-[13px]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px]">Jenis Pekerjaan</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val || '' })}
                required
              >
                <SelectTrigger className="h-[32px] text-[13px]">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_PEKERJAAN.map((j) => (
                    <SelectItem key={j} value={j} className="text-[13px]">
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px]">Satuan</Label>
              <Select
                value={formData.unit}
                onValueChange={(val) => setFormData({ ...formData, unit: val || '' })}
                required
              >
                <SelectTrigger className="h-[32px] text-[13px]">
                  <SelectValue placeholder="Pilih Satuan" />
                </SelectTrigger>
                <SelectContent>
                  {SATUAN.map((s) => (
                    <SelectItem key={s} value={s} className="text-[13px]">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-[32px] text-[13px]">
                Batal
              </Button>
              <Button type="submit" size="sm" className="h-[32px] text-[13px]">
                {editId ? 'Simpan Perubahan' : 'Tambah Designator'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Konfirmasi Hapus Massal */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] text-destructive flex items-center gap-2 font-semibold">
              <Trash2 className="w-4 h-4" />
              Konfirmasi Hapus Massal
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-2">
              Apakah Anda yakin ingin menghapus <span className="font-semibold text-foreground">{selectedIds.size} Designator terpilih</span>?
              Tindakan ini akan menghapus data secara permanen dari basis data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkDeleting}
              onClick={() => setIsBulkDeleteOpen(false)}
              className="h-[32px] text-[13px]"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isBulkDeleting}
              onClick={handleConfirmBulkDelete}
              className="h-[32px] text-[13px]"
            >
              {isBulkDeleting ? 'Menghapus...' : `Ya, Hapus (${selectedIds.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
