'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBowheer, Bowheer, BowheerCategory, INITIAL_BOWHEERS } from '@/context/BowheerContext';
import { toast } from 'sonner';
import { ExcelImportExport } from '@/components/ExcelImportExport';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  exportToExcel,
  downloadExcelTemplate,
  parseImportFile,
  ColumnDefinition,
} from '@/lib/masterDataExportImport';
import { batchAddBowheersAction } from '@/app/actions/masterData';

const CATEGORIES: BowheerCategory[] = [
  'Telekomunikasi',
  'BUMN / Pemerintahan',
  'Perbankan / Finansial',
  'Enterprise / Swasta',
  'Lainnya',
];

const EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: 'code', label: 'Kode Bowheer', required: true },
  { key: 'name', label: 'Nama Perusahaan', required: true },
  { key: 'alias', label: 'Alias/Singkatan' },
  { key: 'category', label: 'Kategori Industri', required: true },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'phone', label: 'Telepon' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Alamat' },
  { key: 'status', label: 'Status (ACTIVE/INACTIVE)' },
];

export default function BowheerMasterPage() {
  const { bowheers, addBowheer, updateBowheer, deleteBowheer, deleteBowheers, refreshBowheers, isLoading } = useBowheer();

  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('code-asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBowheer, setEditingBowheer] = useState<Bowheer | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Bowheer | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    alias: '',
    category: 'Telekomunikasi' as BowheerCategory,
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });


  // Filtered & Sorted List
  const filteredAndSortedBowheers = useMemo(() => {
    let result = bowheers.filter((b) => {
      const matchSearch =
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.alias && b.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.contactPerson && b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a: any, b: any) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [bowheers, searchTerm, categoryFilter, statusFilter, sortBy]);

  // Paginated List
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBowheers.slice(start, start + pageSize);
  }, [filteredAndSortedBowheers, currentPage, pageSize]);

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

  // Sort Handlers
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

  // Modal Handlers
  const openCreateModal = () => {
    setEditingBowheer(null);
    setFormData({
      code: '',
      name: '',
      alias: '',
      category: 'Telekomunikasi',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bowheer: Bowheer) => {
    setEditingBowheer(bowheer);
    setFormData({
      code: bowheer.code,
      name: bowheer.name,
      alias: bowheer.alias || '',
      category: bowheer.category,
      contactPerson: bowheer.contactPerson || '',
      email: bowheer.email || '',
      phone: bowheer.phone || '',
      address: bowheer.address || '',
      status: bowheer.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Kode Bowheer wajib diisi');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Nama Perusahaan / Bowheer wajib diisi');
      return;
    }

    if (editingBowheer) {
      updateBowheer(editingBowheer.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        alias: formData.alias.trim() || undefined,
        category: formData.category,
        contactPerson: formData.contactPerson.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        status: formData.status,
      });
      toast.success(`Data Bowheer ${formData.name} berhasil diperbarui.`);
    } else {
      addBowheer({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        alias: formData.alias.trim() || undefined,
        category: formData.category,
        contactPerson: formData.contactPerson.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        status: formData.status,
      });
      toast.success(`Bowheer ${formData.name} berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteCandidate) {
      deleteBowheer(deleteCandidate.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteCandidate.id);
        return next;
      });
      toast.success(`Bowheer ${deleteCandidate.name} berhasil dihapus.`);
      setDeleteCandidate(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      await deleteBowheers(idsToDelete);
      setSelectedIds(new Set());
      toast.success(`${idsToDelete.length} Bowheer berhasil dihapus.`);
      setIsBulkDeleteOpen(false);
    } catch (err: any) {
      toast.error('Gagal menghapus data terpilih: ' + (err?.message || 'Error'));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Excel Handlers
  const handleExport = async () => {
    exportToExcel(filteredAndSortedBowheers, 'Master_Data_Bowheer', EXCEL_COLUMNS);
    toast.success('File Excel berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Bowheer', INITIAL_BOWHEERS.slice(0, 3));
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
          code: String(row.code || '').trim().toUpperCase(),
          name: String(row.name || '').trim(),
          alias: row.alias ? String(row.alias).trim() : '',
          category: (row.category || 'Telekomunikasi') as BowheerCategory,
          contactPerson: row.contactPerson ? String(row.contactPerson).trim() : '',
          phone: row.phone ? String(row.phone).trim() : '',
          email: row.email ? String(row.email).trim() : '',
          address: row.address ? String(row.address).trim() : '',
          status: (row.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
        }))
        .filter((r) => r.code && r.name);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Kode dan Nama Perusahaan.');
        return;
      }

      const res = await batchAddBowheersAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} Bowheer.`);
        await refreshBowheers();
      } else {
        toast.error(res.error || 'Gagal mengimpor data');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses file');
    }
  };

  const getCategoryBadgeClass = (category: BowheerCategory) => {
    switch (category) {
      case 'Telekomunikasi':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'BUMN / Pemerintahan':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case 'Perbankan / Finansial':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'Enterprise / Swasta':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Master Data Bowheer (Klien)
          </h1>
          <p className="text-muted-foreground text-[12px] mt-0.5">
            Daftar pemilik proyek / klien telekomunikasi dan enterprise yang digunakan sebagai pilihan Customer di proyek.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={isLoading}
          />
        </div>
      </div>


      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-4.5 top-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari kode, nama, atau PIC..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-[32px] my-[6px] mx-[8px] text-[13px] bg-background"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val || 'ALL');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px] bg-background">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Kategori</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-[13px]">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val || 'ALL');
                setCurrentPage(1);
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

          <Button onClick={openCreateModal} size="sm" className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px]">
            <Plus className="w-4 h-4" />
            Tambah Bowheer
          </Button>

          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px] bg-red-600 hover:bg-red-700 text-white animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              Hapus ({selectedIds.size})
            </Button>
          )}
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
              <SelectItem value="name-asc" className="text-[13px]">Nama Perusahaan (A-Z)</SelectItem>
              <SelectItem value="name-desc" className="text-[13px]">Nama Perusahaan (Z-A)</SelectItem>
              <SelectItem value="category-asc" className="text-[13px]">Kategori (A-Z)</SelectItem>
              <SelectItem value="category-desc" className="text-[13px]">Kategori (Z-A)</SelectItem>
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
              {selectedIds.size} Bowheer dipilih
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
              Hapus {selectedIds.size} Bowheer Terpilih
            </Button>
          </div>
        </div>
      )}

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
                className="w-24 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('code')}
              >
                Kode {renderSortIcon('code')}
              </TableHead>
              <TableHead
                className="min-w-[200px] cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('name')}
              >
                Nama Perusahaan / Klien {renderSortIcon('name')}
              </TableHead>
              <TableHead
                className="w-40 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('category')}
              >
                Kategori {renderSortIcon('category')}
              </TableHead>
              <TableHead className="min-w-[180px] text-[13px] font-semibold">Kontak PIC</TableHead>
              <TableHead className="min-w-[200px] text-[13px] font-semibold">Alamat</TableHead>
              <TableHead className="w-24 text-center text-[13px] font-semibold">Status</TableHead>
              <TableHead className="w-24 text-right pr-4 text-[13px] font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-[13px] text-muted-foreground">
                  Memuat data Bowheer...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-[13px]">
                  Tidak ada data Bowheer yang cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((b) => {
                const isSelected = selectedIds.has(b.id);
                return (
                  <TableRow
                    key={b.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/30 transition-colors text-[13px]"
                  >
                    <TableCell className="px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(b.id)}
                        aria-label={`Pilih ${b.code}`}
                      />
                    </TableCell>
                    <TableCell className="font-bold">
                      <span className="px-2.5 py-1 rounded bg-muted border font-mono text-[13px] tracking-wider text-foreground">
                        {b.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-[13px]">{b.name}</span>
                        {b.alias && (
                          <span className="text-[13px] text-muted-foreground">
                            Alias: {b.alias}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[13px] font-normal px-2.5 py-0.5 ${getCategoryBadgeClass(b.category)}`}>
                        {b.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground text-[13px]">{b.contactPerson || '-'}</span>
                        {b.phone && (
                          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                        {b.email && (
                          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[160px]">{b.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 text-[13px] text-muted-foreground max-w-[240px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{b.address || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[13px] font-medium px-2.5 py-0.5 ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {b.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(b)}
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-foreground"
                          title="Edit Bowheer"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCandidate(b)}
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-destructive"
                          title="Hapus Bowheer"
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
        totalItems={filteredAndSortedBowheers.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedCount={selectedIds.size}
      />

      {/* Modal Tambah / Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">
              {editingBowheer ? 'Edit Data Bowheer' : 'Tambah Bowheer Baru'}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Lengkapi informasi klien / bowheer yang akan dijadikan referensi Customer pada proyek.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bwhCode" className="text-[13px]">
                  Kode Bowheer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bwhCode"
                  placeholder="Contoh: TSEL, ISAT, EXCL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="font-mono text-[13px] uppercase h-[32px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bwhCategory" className="text-[13px]">
                  Kategori Industri <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger id="bwhCategory" className="text-[13px] h-[32px]">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-[13px]">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhName" className="text-[13px]">
                  Nama Resmi Perusahaan (PT / Instansi) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bwhName"
                  placeholder="Contoh: PT Telkomsel Tbk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-[13px] h-[32px]"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhAlias" className="text-[13px]">
                  Nama Populer / Singkatan (Opsional)
                </Label>
                <Input
                  id="bwhAlias"
                  placeholder="Contoh: Telkomsel, IOH, Moratelindo"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="text-[13px] h-[32px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bwhPic" className="text-[13px]">
                  Contact Person (PIC Bowheer)
                </Label>
                <Input
                  id="bwhPic"
                  placeholder="Nama PIC Klien"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="text-[13px] h-[32px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bwhPhone" className="text-[13px]">
                  No. Telepon / HP
                </Label>
                <Input
                  id="bwhPhone"
                  placeholder="Contoh: 021-5240123 / 0812xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-[13px] h-[32px]"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhEmail" className="text-[13px]">
                  Email Klien / Procurement
                </Label>
                <Input
                  id="bwhEmail"
                  type="email"
                  placeholder="Contoh: procurement@client.co.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-[13px] h-[32px]"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhAddress" className="text-[13px]">
                  Alamat Kantor
                </Label>
                <Textarea
                  id="bwhAddress"
                  placeholder="Gedung / Jalan / Kota"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="text-[13px] resize-none"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhStatus" className="text-[13px]">
                  Status Bowheer
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="bwhStatus" className="text-[13px] h-[32px]">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-[13px]">Aktif (Tampil di Opsi Pilihan Proyek)</SelectItem>
                    <SelectItem value="INACTIVE" className="text-[13px]">Non-Aktif (Diarsipkan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-[32px] text-[13px]"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="h-[32px] text-[13px]">
                {editingBowheer ? 'Simpan Perubahan' : 'Tambah Bowheer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Konfirmasi Hapus */}
      <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] text-destructive flex items-center gap-2 font-semibold">
              <Trash2 className="w-4 h-4" />
              Konfirmasi Hapus Bowheer
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-2">
              Apakah Anda yakin ingin menghapus Bowheer <span className="font-semibold text-foreground">"{deleteCandidate?.name}"</span> ({deleteCandidate?.code})?
              Data yang dihapus tidak akan muncul lagi di daftar pilihan Customer proyek baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
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
              Ya, Hapus Bowheer
            </Button>
          </DialogFooter>
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
              Apakah Anda yakin ingin menghapus <span className="font-semibold text-foreground">{selectedIds.size} Bowheer terpilih</span>?
              Data yang dihapus tidak dapat dipulihkan dan tidak akan muncul lagi di daftar pilihan Customer proyek baru.
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
