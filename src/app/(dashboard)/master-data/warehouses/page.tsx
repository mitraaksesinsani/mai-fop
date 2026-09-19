'use client';

import { useEffect, useState, useMemo } from 'react';
import { Warehouse, Search, Plus, Pencil, Trash2, MapPin, Upload, Image as ImageIcon, X, ExternalLink, Map, Globe, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  getWarehousesAction,
  addWarehouseAction,
  updateWarehouseAction,
  deleteWarehouseAction,
  batchDeleteWarehousesAction,
  batchAddWarehousesAction,
} from '@/app/actions/masterData';
import StatusBadge from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  { key: 'code', label: 'Kode Gudang', required: true },
  { key: 'name', label: 'Nama Gudang', required: true },
  { key: 'location', label: 'Lokasi / Alamat', required: true },
  { key: 'type', label: 'Tipe (MAIN/SITE/TRANSIT)' },
  { key: 'capacity', label: 'Kapasitas (CBM)' },
  { key: 'coordinates', label: 'Koordinat (Lat, Long)' },
  { key: 'status', label: 'Status (ACTIVE/INACTIVE/MAINTENANCE)' },
];

const SAMPLE_WAREHOUSES = [
  { code: 'WH-JKT-01', name: 'Gudang Utama Jakarta', location: 'Jl. Rawa Gelam IV No. 8, Kawasan Industri Pulogadung', type: 'MAIN', capacity: 5000, coordinates: '-6.1982, 106.9124', status: 'ACTIVE' },
  { code: 'WH-BDG-01', name: 'Hub Transit Bandung', location: 'Jl. Soekarno Hatta No. 450, Bandung', type: 'TRANSIT', capacity: 1500, coordinates: '-6.9421, 107.6321', status: 'ACTIVE' },
];

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    coordinates: '',
    evidence: '',
    type: 'MAIN',
    capacity: '',
    status: 'ACTIVE',
  });

  const [isUploading, setIsUploading] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await getWarehousesAction();
      if (res.success && res.data) {
        setWarehouses(res.data);
      } else {
        setWarehouses([]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat data gudang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Filtered and Sorted Warehouses
  const filteredAndSortedWarehouses = useMemo(() => {
    let result = warehouses.filter((w) => {
      const matchSearch =
        w.code?.toLowerCase().includes(search.toLowerCase()) ||
        w.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.location?.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === 'ALL' || w.type === filterType;
      const matchStatus = filterStatus === 'ALL' || w.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [warehouses, search, filterType, filterStatus, sortBy]);

  // Paginated List
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedWarehouses.slice(start, start + pageSize);
  }, [filteredAndSortedWarehouses, page, pageSize]);

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
    setFormData({ code: '', name: '', location: '', coordinates: '', evidence: '', type: 'MAIN', capacity: '', status: 'ACTIVE' });
    setIsOpen(true);
  };

  const openEditDialog = (w: any) => {
    setEditId(w.id);
    setFormData({
      code: w.code,
      name: w.name,
      location: w.location || '',
      coordinates: w.coordinates || '',
      evidence: w.evidence || '',
      type: w.type || 'MAIN',
      capacity: w.capacity ? w.capacity.toString() : '',
      status: w.status || 'ACTIVE',
    });
    setIsOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });
      const data = await response.json();
      if (response.ok && data.url) {
        setFormData({ ...formData, evidence: data.url });
      } else {
        toast.error(data.message || 'Gagal mengunggah foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Kode dan Nama Gudang wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editId) {
        await updateWarehouseAction(editId, {
          code: formData.code,
          name: formData.name,
          location: formData.location,
          type: formData.type,
          capacity: parseInt(formData.capacity) || 0,
          status: formData.status,
        });
        toast.success('Gudang berhasil diperbarui');
      } else {
        await addWarehouseAction({
          code: formData.code,
          name: formData.name,
          location: formData.location,
          type: formData.type,
          capacity: parseInt(formData.capacity) || 0,
          status: formData.status,
        });
        toast.success('Gudang berhasil ditambahkan');
      }
      setIsOpen(false);
      await fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast.error('Gagal menyimpan gudang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deleteWarehouseAction(deleteId);
      toast.success('Gudang berhasil dihapus');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      setDeleteOpen(false);
      await fetchWarehouses();
    } catch (error) {
      console.error('Failed to delete warehouse', error);
      toast.error('Gagal menghapus gudang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    try {
      const res = await batchDeleteWarehousesAction(idsToDelete);
      if (res.success) {
        toast.success(`${idsToDelete.length} Gudang berhasil dihapus`);
        setSelectedIds(new Set());
        setIsBulkDeleteOpen(false);
        await fetchWarehouses();
      } else {
        toast.error(res.error || 'Gagal menghapus gudang terpilih');
      }
    } catch (error) {
      console.error('Failed to bulk delete warehouses', error);
      toast.error('Gagal menghapus gudang terpilih');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Excel Handlers
  const handleExport = async () => {
    exportToExcel(filteredAndSortedWarehouses, 'Master_Data_Gudang', EXCEL_COLUMNS);
    toast.success('File Excel berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Gudang', SAMPLE_WAREHOUSES);
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
          location: String(row.location || '').trim(),
          type: String(row.type || 'MAIN').trim(),
          capacity: parseInt(String(row.capacity || 0)) || 0,
          coordinates: String(row.coordinates || '').trim(),
          status: String(row.status || 'ACTIVE').trim(),
        }))
        .filter((r) => r.code && r.name);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Kode dan Nama Gudang.');
        return;
      }

      const res = await batchAddWarehousesAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} gudang.`);
        await fetchWarehouses();
      } else {
        toast.error(res.error || 'Gagal mengimpor gudang');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Master Data Gudang</h1>
          <p className="text-[13px] text-muted-foreground">Kelola daftar lokasi penyimpanan logistik, hub, dan kapasitas gudang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={loading}
          />
          <Button onClick={openCreateDialog} size="sm" className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px]">
            <Plus className="w-4 h-4" /> Tambah Gudang
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px] bg-red-600 hover:bg-red-700 text-white animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" /> Hapus ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-4.5 top-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kode, nama, atau lokasi..."
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
              value={filterType}
              onValueChange={(val) => {
                setFilterType(val || 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px] bg-background">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Tipe</SelectItem>
                <SelectItem value="MAIN" className="text-[13px]">Main Hub</SelectItem>
                <SelectItem value="SITE" className="text-[13px]">Site Storage</SelectItem>
                <SelectItem value="TRANSIT" className="text-[13px]">Transit Point</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="MAINTENANCE" className="text-[13px]">Maintenance</SelectItem>
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
              <SelectItem value="type-asc" className="text-[13px]">Tipe (A-Z)</SelectItem>
              <SelectItem value="type-desc" className="text-[13px]">Tipe (Z-A)</SelectItem>
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
              {selectedIds.size} Gudang dipilih
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
              Hapus {selectedIds.size} Gudang Terpilih
            </Button>
          </div>
        </div>
      )}

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
                Kode Gudang {renderSortIcon('code')}
              </TableHead>
              <TableHead
                className="min-w-[180px] cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('name')}
              >
                Nama Gudang {renderSortIcon('name')}
              </TableHead>
              <TableHead className="min-w-[200px] text-[13px] font-semibold">Lokasi / Alamat</TableHead>
              <TableHead className="w-36 text-[13px] font-semibold">Koordinat</TableHead>
              <TableHead className="w-24 text-[13px] font-semibold">Foto</TableHead>
              <TableHead
                className="w-28 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('type')}
              >
                Tipe {renderSortIcon('type')}
              </TableHead>
              <TableHead className="w-28 text-center text-[13px] font-semibold">Status</TableHead>
              <TableHead className="w-24 text-right pr-4 text-[13px] font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-28 text-center text-[13px] text-muted-foreground">
                  Memuat data gudang...
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((w) => {
                const isSelected = selectedIds.has(w.id);
                return (
                  <TableRow
                    key={w.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/30 transition-colors text-[13px]"
                  >
                    <TableCell className="px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(w.id)}
                        aria-label={`Pilih ${w.code}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium text-[13px] text-primary">
                      {w.code}
                    </TableCell>
                    <TableCell className="font-medium text-[13px]">{w.name}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground max-w-[250px] truncate">{w.location || '-'}</TableCell>
                    <TableCell className="text-[13px]">
                      {w.coordinates ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center gap-1 text-[13px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded w-fit hover:bg-muted/70 transition-colors cursor-pointer outline-none">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[100px]">{w.coordinates}</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.coordinates)}`, '_blank')}
                              className="text-[13px] cursor-pointer"
                            >
                              <Map className="w-4 h-4 mr-1.5" /> Buka Google Maps
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`https://earth.google.com/web/search/${encodeURIComponent(w.coordinates)}`, '_blank')}
                              className="text-[13px] cursor-pointer"
                            >
                              <Globe className="w-4 h-4 mr-1.5" /> Buka Google Earth
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-muted-foreground opacity-40">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {w.evidence ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(w.evidence)}
                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <img src={w.evidence} alt="Evidence" className="w-8 h-8 object-cover rounded border" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground opacity-40">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[13px] font-medium">
                        {w.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={w.status} />
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(w)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeleteId(w.id);
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
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground text-[13px]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Tidak ada data gudang yang cocok dengan filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        totalItems={filteredAndSortedWarehouses.length}
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
              <DialogTitle className="text-[16px] font-semibold">{editId ? 'Edit Gudang' : 'Tambah Gudang Baru'}</DialogTitle>
              <DialogDescription className="text-[13px]">
                {editId ? 'Perbarui informasi lokasi dan kapasitas gudang.' : 'Daftarkan titik gudang logistik baru.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="code" className="text-[13px]">Kode Gudang *</Label>
                  <Input
                    id="code"
                    placeholder="Contoh: WH-JKT-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="h-[32px] text-[13px] font-mono"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-[13px]">Nama Gudang *</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Jakarta Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-[32px] text-[13px]"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="location" className="text-[13px]">Lokasi / Alamat</Label>
                <Input
                  id="location"
                  placeholder="Jl. Raya No. 123..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-[32px] text-[13px]"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="coordinates" className="text-[13px]">Koordinat (Latitude, Longitude)</Label>
                <Input
                  id="coordinates"
                  placeholder="-6.2234, 106.8463"
                  value={formData.coordinates}
                  onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                  className="h-[32px] text-[13px] font-mono"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[13px]">Foto Gudang (Opsional)</Label>
                <div className="flex flex-col gap-2">
                  {!formData.evidence && (
                    <Button variant="outline" size="sm" type="button" className="relative overflow-hidden cursor-pointer w-fit h-[32px] text-[13px]">
                      {isUploading ? (
                        <>Mengunggah...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-1.5" /> Pilih Foto</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </Button>
                  )}
                  {formData.evidence && (
                    <div className="flex items-center justify-between p-2 border rounded-lg bg-card w-full shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={formData.evidence} alt="Preview" className="w-10 h-10 object-cover rounded border" />
                        <span className="text-[13px] truncate max-w-[200px] text-muted-foreground">{formData.evidence.split('/').pop()}</span>
                      </div>
                      <Button variant="ghost" size="icon" type="button" onClick={() => setFormData({ ...formData, evidence: '' })} className="h-[32px] w-[32px] text-muted-foreground">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="type" className="text-[13px]">Tipe Gudang</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val || '' })}>
                    <SelectTrigger className="h-[32px] text-[13px]">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN" className="text-[13px]">Main Hub</SelectItem>
                      <SelectItem value="SITE" className="text-[13px]">Site Storage</SelectItem>
                      <SelectItem value="TRANSIT" className="text-[13px]">Transit Point</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="capacity" className="text-[13px]">Kapasitas (CBM)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Contoh: 5000"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="h-[32px] text-[13px]"
                  />
                </div>
              </div>
              {editId && (
                <div className="grid gap-1.5">
                  <Label htmlFor="status" className="text-[13px]">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val || '' })}>
                    <SelectTrigger className="h-[32px] text-[13px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE" className="text-[13px]">Aktif</SelectItem>
                      <SelectItem value="INACTIVE" className="text-[13px]">Non-Aktif</SelectItem>
                      <SelectItem value="MAINTENANCE" className="text-[13px]">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="h-[32px] text-[13px]">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-[32px] text-[13px]">
                {editId ? 'Simpan Perubahan' : 'Tambah Gudang'}
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
              Hapus Gudang
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-1">
              Apakah Anda yakin ingin menghapus gudang ini? Tindakan ini tidak dapat dibatalkan.
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


      {/* Evidence Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2 text-xs font-medium">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Foto Gudang
            </div>
            {previewImage && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex items-center gap-1.5"
                onClick={() => window.open(previewImage, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
              </Button>
            )}
          </div>
          <div className="bg-muted/40 p-4 flex items-center justify-center min-h-[250px]">
            {previewImage && (
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[70vh] rounded-md shadow-xs border bg-background" />
            )}
          </div>
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
              Apakah Anda yakin ingin menghapus <span className="font-semibold text-foreground">{selectedIds.size} Gudang terpilih</span>?
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
              onClick={confirmBulkDelete}
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
