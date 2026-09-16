'use client';

import { useEffect, useState, useMemo } from 'react';
import { Building2, Search, Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  getVendorsAction,
  addVendorAction,
  updateVendorAction,
  deleteVendorAction,
  batchAddVendorsAction,
} from '@/app/actions/masterData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExcelImportExport } from '@/components/ExcelImportExport';
import { toast } from 'sonner';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  exportToExcel,
  downloadExcelTemplate,
  parseImportFile,
  ColumnDefinition,
} from '@/lib/masterDataExportImport';

const EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: 'code', label: 'Kode Vendor', required: true },
  { key: 'name', label: 'Nama Vendor', required: true },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telepon' },
  { key: 'address', label: 'Alamat' },
  { key: 'status', label: 'Status (ACTIVE/INACTIVE)' },
];

const SAMPLE_VENDORS = [
  { code: 'VND-001', name: 'PT Fiber Mandiri Sejahtera', contactPerson: 'Hendra Gunawan', email: 'sales@fibermandiri.com', phone: '021-58901234', address: 'Kawasan Industri Pulogadung, Jakarta Timur', status: 'ACTIVE' },
  { code: 'VND-002', name: 'CV Mitra Sukses Bersama', contactPerson: 'Budi Hartono', email: 'mitrasukses@gmail.com', phone: '081289001122', address: 'Jl. Ahmad Yani No. 88, Bekasi', status: 'ACTIVE' },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('code-asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vendorCode: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    isActive: true,
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendorsAction();
      if (res.success && res.data) {
        setVendors(res.data);
      } else {
        setVendors([]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat data vendor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filtered and Sorted Vendors
  const filteredAndSortedVendors = useMemo(() => {
    let result = vendors.filter((v) => {
      const vCode = v.code || v.vendorCode || '';
      const matchSearch =
        vCode.toLowerCase().includes(search.toLowerCase()) ||
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
        v.email?.toLowerCase().includes(search.toLowerCase());

      const isItemActive = v.status === 'ACTIVE' || v.isActive === true;
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && isItemActive) ||
        (filterStatus === 'INACTIVE' && !isItemActive);

      return matchSearch && matchStatus;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const valA = ((field === 'code' ? a.code || a.vendorCode : a[field]) || '').toString().toLowerCase();
      const valB = ((field === 'code' ? b.code || b.vendorCode : b[field]) || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [vendors, search, filterStatus, sortBy]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedVendors.slice(start, start + pageSize);
  }, [filteredAndSortedVendors, page, pageSize]);

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
    setFormData({ vendorCode: '', name: '', contactPerson: '', email: '', phone: '', address: '', isActive: true });
    setIsOpen(true);
  };

  const openEditDialog = (vendor: any) => {
    setEditId(vendor.id);
    setFormData({
      vendorCode: vendor.code || vendor.vendorCode || '',
      name: vendor.name,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      isActive: vendor.status === 'ACTIVE' || vendor.isActive === true,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorCode || !formData.name) {
      toast.error('Kode dan Nama Vendor wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editId) {
        await updateVendorAction(editId, {
          code: formData.vendorCode,
          name: formData.name,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
        });
        toast.success('Vendor berhasil diperbarui');
      } else {
        await addVendorAction({
          code: formData.vendorCode,
          name: formData.name,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
        });
        toast.success('Vendor berhasil ditambahkan');
      }
      setIsOpen(false);
      await fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Gagal menyimpan vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deleteVendorAction(deleteId);
      toast.success('Vendor berhasil dihapus');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      setDeleteOpen(false);
      await fetchVendors();
    } catch (error) {
      console.error('Failed to delete vendor', error);
      toast.error('Gagal menghapus vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel Handlers
  const handleExport = async () => {
    exportToExcel(filteredAndSortedVendors, 'Master_Data_Vendor', EXCEL_COLUMNS);
    toast.success('File Excel berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Vendor', SAMPLE_VENDORS);
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
          code: String(row.code || row.vendorCode || '').trim().toUpperCase(),
          name: String(row.name || '').trim(),
          contactPerson: String(row.contactPerson || '').trim(),
          email: String(row.email || '').trim(),
          phone: String(row.phone || '').trim(),
          address: String(row.address || '').trim(),
          status: (row.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
        }))
        .filter((r) => r.code && r.name);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Kode dan Nama Vendor.');
        return;
      }

      const res = await batchAddVendorsAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} vendor.`);
        await fetchVendors();
      } else {
        toast.error(res.error || 'Gagal mengimpor vendor');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Master Data Vendor</h1>
          <p className="text-[13px] text-muted-foreground">Kelola mitra kerja, rekanan pelaksana, dan supplier pengadaan proyek.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={loading}
          />
          <Button onClick={openCreateDialog} size="sm" className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px]">
            <Plus className="w-4 h-4" /> Tambah Vendor
          </Button>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-4.5 top-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kode, nama, atau PIC..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-[32px] my-[6px] mx-[8px] text-[13px] bg-background"
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={filterStatus}
              onValueChange={(val) => {
                setFilterStatus(val || 'ALL');
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
              setSortBy(val || 'code-asc');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-[32px] my-[6px] mx-[8px] w-48 text-[13px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code-asc" className="text-[13px]">ID/Kode (A-Z)</SelectItem>
              <SelectItem value="code-desc" className="text-[13px]">ID/Kode (Z-A)</SelectItem>
              <SelectItem value="name-asc" className="text-[13px]">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc" className="text-[13px]">Nama (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Single Border */}
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
                className="w-32 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('code')}
              >
                Kode Vendor {renderSortIcon('code')}
              </TableHead>
              <TableHead
                className="min-w-[200px] cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('name')}
              >
                Nama Vendor / Rekanan {renderSortIcon('name')}
              </TableHead>
              <TableHead className="min-w-[150px] text-[13px] font-semibold">Contact Person</TableHead>
              <TableHead className="min-w-[180px] text-[13px] font-semibold">Kontak (Email / Telp)</TableHead>
              <TableHead className="min-w-[200px] text-[13px] font-semibold">Alamat</TableHead>
              <TableHead className="w-24 text-center text-[13px] font-semibold">Status</TableHead>
              <TableHead className="w-24 text-right pr-4 text-[13px] font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-[13px] text-muted-foreground">
                  Memuat data vendor...
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((v) => {
                const isSelected = selectedIds.has(v.id);
                const isActive = v.status === 'ACTIVE' || v.isActive === true;
                return (
                  <TableRow
                    key={v.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/30 transition-colors text-[13px]"
                  >
                    <TableCell className="px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(v.id)}
                        aria-label={`Pilih ${v.code || v.vendorCode}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium text-[13px] text-primary">
                      {v.code || v.vendorCode}
                    </TableCell>
                    <TableCell className="font-medium text-[13px]">{v.name}</TableCell>
                    <TableCell className="text-[13px]">{v.contactPerson || '-'}</TableCell>
                    <TableCell className="text-[13px]">
                      <div className="flex flex-col gap-0.5">
                        {v.email && <span className="text-muted-foreground">{v.email}</span>}
                        {v.phone && <span className="text-muted-foreground">{v.phone}</span>}
                        {!v.email && !v.phone && <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground max-w-[220px] truncate">
                      {v.address || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[13px] font-medium px-2.5 py-0.5 ${
                          isActive
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'text-zinc-600 bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {isActive ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(v)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeleteId(v.id);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-[13px]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Tidak ada data vendor yang cocok dengan filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        totalItems={filteredAndSortedVendors.length}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        selectedCount={selectedIds.size}
      />

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold">{editId ? 'Edit Data Vendor' : 'Tambah Vendor Baru'}</DialogTitle>
              <DialogDescription className="text-[13px]">
                {editId ? 'Perbarui informasi rekanan atau vendor.' : 'Daftarkan vendor atau supplier baru ke master data.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="vendorCode" className="text-[13px]">Kode Vendor *</Label>
                  <Input
                    id="vendorCode"
                    placeholder="Contoh: VND-001"
                    value={formData.vendorCode}
                    onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value.toUpperCase() })}
                    required
                    className="h-[32px] text-[13px] font-mono"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-[13px]">Nama Vendor *</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: PT Fiber Mandiri"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-[32px] text-[13px]"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contactPerson" className="text-[13px]">Contact Person (PIC)</Label>
                <Input
                  id="contactPerson"
                  placeholder="Nama PIC vendor"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="h-[32px] text-[13px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-[13px]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kontak@vendor.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-[32px] text-[13px]"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="phone" className="text-[13px]">Telepon / WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="0812xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-[32px] text-[13px]"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address" className="text-[13px]">Alamat Kantor / Workshop</Label>
                <Textarea
                  id="address"
                  placeholder="Alamat lengkap vendor..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="text-[13px] resize-none"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="status" className="text-[13px]">Status</Label>
                <Select
                  value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onValueChange={(val) => setFormData({ ...formData, isActive: val === 'ACTIVE' })}
                >
                  <SelectTrigger className="h-[32px] text-[13px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-[13px]">Aktif</SelectItem>
                    <SelectItem value="INACTIVE" className="text-[13px]">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="h-[32px] text-[13px]">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-[32px] text-[13px]">
                {editId ? 'Simpan Perubahan' : 'Tambah Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Hapus Vendor
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-1">
              Apakah Anda yakin ingin menghapus vendor ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteOpen(false)} className="h-[32px] text-[13px]">
              Batal
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={confirmDelete} disabled={isSubmitting} className="h-[32px] text-[13px]">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
