'use client';

import { useEffect, useState, useMemo } from 'react';
import { Package, Plus, Search, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  getMaterialsAction,
  addMaterialAction,
  updateMaterialAction,
  deleteMaterialAction,
  batchAddMaterialsAction,
} from '@/app/actions/masterData';
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
import { ExcelImportExport } from '@/components/ExcelImportExport';
import { toast } from 'sonner';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  exportToExcel,
  downloadExcelTemplate,
  parseImportFile,
  ColumnDefinition,
} from '@/lib/masterDataExportImport';

const MATERIAL_GROUPS = [
  { value: 'CABLE', label: 'Cable' },
  { value: 'OSP', label: 'OSP' },
  { value: 'ACTIVE_DEVICE', label: 'Active Device' },
  { value: 'PASSIVE_DEVICE', label: 'Passive Device' },
  { value: 'ACCESSORY', label: 'Accessory' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'CONSUMABLE', label: 'Consumable' },
  { value: 'OTHER', label: 'Other' },
];

const MATERIAL_UOMS = ['Meter', 'Roll', 'Pcs', 'Unit', 'Set', 'Box', 'Kg', 'Liter', 'Lot'];

const EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: 'materialCode', label: 'Kode Material', required: true },
  { key: 'materialName', label: 'Nama Material', required: true },
  { key: 'category', label: 'Kategori / Group', required: true },
  { key: 'unit', label: 'Satuan (UOM)', required: true },
  { key: 'specification', label: 'Spesifikasi / Deskripsi' },
];

const SAMPLE_MATERIALS = [
  { materialCode: 'CBL-FO-48', materialName: 'Kabel Fiber Optic 48 Core ADSS', category: 'CABLE', unit: 'Meter', specification: 'Single Mode G.652D' },
  { materialCode: 'CLOS-ODC-144', materialName: 'Optical Distribution Cabinet 144 Core', category: 'OSP', unit: 'Unit', specification: 'Outdoor IP65' },
  { materialCode: 'TIE-NYLON-200', materialName: 'Cable Tie Nylon 200mm', category: 'ACCESSORY', unit: 'Pcs', specification: 'Black UV Resistant' },
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterUom, setFilterUom] = useState('ALL');
  const [sortBy, setSortBy] = useState('materialCode-asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    group: 'CABLE',
    uom: 'Meter',
    description: '',
  });

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await getMaterialsAction();
      if (res.success && res.data) {
        setMaterials(res.data);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data material');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Filtered and Sorted Materials
  const filteredAndSortedMaterials = useMemo(() => {
    let result = materials.filter((item) => {
      const matchSearch =
        item.materialCode?.toLowerCase().includes(search.toLowerCase()) ||
        item.materialName?.toLowerCase().includes(search.toLowerCase()) ||
        item.specification?.toLowerCase().includes(search.toLowerCase());

      const matchGroup = filterGroup === 'ALL' || item.category === filterGroup;
      const matchUom = filterUom === 'ALL' || item.unit === filterUom;

      return matchSearch && matchGroup && matchUom;
    });

    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true });
      return order === 'asc' ? comp : -comp;
    });

    return result;
  }, [materials, search, filterGroup, filterUom, sortBy]);

  // Paginated List
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedMaterials.slice(start, start + pageSize);
  }, [filteredAndSortedMaterials, page, pageSize]);

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

  // Sort Header
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
    setFormData({ code: '', name: '', group: 'CABLE', uom: 'Meter', description: '' });
    setIsOpen(true);
  };

  const openEditDialog = (material: any) => {
    setEditId(material.id);
    setFormData({
      code: material.materialCode,
      name: material.materialName,
      group: material.category || 'CABLE',
      uom: material.unit || 'Meter',
      description: material.specification || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Kode dan Nama Material wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editId) {
        await updateMaterialAction(editId, {
          materialCode: formData.code,
          materialName: formData.name,
          category: formData.group,
          specification: formData.description,
          unit: formData.uom,
          minimumStock: 0,
          isActive: true,
        });
        toast.success('Material berhasil diperbarui');
      } else {
        await addMaterialAction({
          materialCode: formData.code,
          materialName: formData.name,
          category: formData.group,
          specification: formData.description,
          unit: formData.uom,
          minimumStock: 0,
          isActive: true,
        });
        toast.success('Material berhasil ditambahkan');
      }
      setIsOpen(false);
      await fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Gagal menyimpan material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deleteMaterialAction(deleteId);
      toast.success('Material berhasil dihapus');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      setDeleteOpen(false);
      await fetchMaterials();
    } catch (error) {
      console.error('Failed to delete material', error);
      toast.error('Gagal menghapus material');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel Handlers
  const handleExport = async () => {
    exportToExcel(filteredAndSortedMaterials, 'Master_Data_Material', EXCEL_COLUMNS);
    toast.success('File Excel berhasil diunduh');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(EXCEL_COLUMNS, 'Template_Master_Material', SAMPLE_MATERIALS);
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
          materialCode: String(row.materialCode || '').trim(),
          materialName: String(row.materialName || '').trim(),
          category: String(row.category || 'OTHER').trim(),
          unit: String(row.unit || 'Pcs').trim(),
          specification: String(row.specification || '').trim(),
          minimumStock: 0,
          isActive: true,
        }))
        .filter((r) => r.materialCode && r.materialName);

      if (validRows.length === 0) {
        toast.error('Tidak ada data valid dengan Kode dan Nama Material.');
        return;
      }

      const res = await batchAddMaterialsAction(validRows);
      if (res.success) {
        toast.success(`Berhasil mengimpor ${res.count} material.`);
        await fetchMaterials();
      } else {
        toast.error(res.error || 'Gagal mengimpor material');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Master Data Material</h1>
          <p className="text-[13px] text-muted-foreground">Katalog data material, perangkat jaringan, dan satuan unit (UOM).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            isLoading={loading}
          />
          <Button onClick={openCreateDialog} size="sm" className="h-[32px] my-[6px] mx-[8px] gap-1.5 text-[13px]">
            <Plus className="w-4 h-4" /> Tambah Material
          </Button>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-4.5 top-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kode atau nama material..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-[32px] my-[6px] mx-[8px] text-[13px] bg-background"
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={filterGroup}
              onValueChange={(val) => {
                setFilterGroup(val || 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px] bg-background">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Kategori</SelectItem>
                {MATERIAL_GROUPS.map((g) => (
                  <SelectItem key={g.value} value={g.value} className="text-[13px]">
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={filterUom}
              onValueChange={(val) => {
                setFilterUom(val || 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-[32px] my-[6px] mx-[8px] text-[13px] bg-background">
                <SelectValue placeholder="Semua UOM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua UOM</SelectItem>
                {MATERIAL_UOMS.map((u) => (
                  <SelectItem key={u} value={u} className="text-[13px]">
                    {u}
                  </SelectItem>
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
              setSortBy(val || 'materialCode-asc');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-[32px] my-[6px] mx-[8px] w-48 text-[13px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="materialCode-asc" className="text-[13px]">ID/Kode (A-Z)</SelectItem>
              <SelectItem value="materialCode-desc" className="text-[13px]">ID/Kode (Z-A)</SelectItem>
              <SelectItem value="materialName-asc" className="text-[13px]">Nama (A-Z)</SelectItem>
              <SelectItem value="materialName-desc" className="text-[13px]">Nama (Z-A)</SelectItem>
              <SelectItem value="category-asc" className="text-[13px]">Kategori (A-Z)</SelectItem>
              <SelectItem value="category-desc" className="text-[13px]">Kategori (Z-A)</SelectItem>
              <SelectItem value="unit-asc" className="text-[13px]">Satuan (A-Z)</SelectItem>
              <SelectItem value="unit-desc" className="text-[13px]">Satuan (Z-A)</SelectItem>
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
                className="w-36 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('materialCode')}
              >
                Kode Material {renderSortIcon('materialCode')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('materialName')}
              >
                Nama Material {renderSortIcon('materialName')}
              </TableHead>
              <TableHead
                className="w-36 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('category')}
              >
                Kategori {renderSortIcon('category')}
              </TableHead>
              <TableHead
                className="w-28 cursor-pointer select-none text-[13px] font-semibold"
                onClick={() => handleSortToggle('unit')}
              >
                Satuan {renderSortIcon('unit')}
              </TableHead>
              <TableHead className="text-[13px] font-semibold">Spesifikasi</TableHead>
              <TableHead className="w-24 text-right pr-4 text-[13px] font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-[13px] text-muted-foreground">
                  Memuat data material...
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((material) => {
                const isSelected = selectedIds.has(material.id);
                return (
                  <TableRow
                    key={material.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/30 transition-colors text-[13px]"
                  >
                    <TableCell className="px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(material.id)}
                        aria-label={`Pilih ${material.materialCode}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium text-[13px] text-primary">
                      {material.materialCode}
                    </TableCell>
                    <TableCell className="font-medium text-[13px]">{material.materialName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[13px] font-normal bg-muted text-muted-foreground px-2.5 py-0.5">
                        {material.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[13px]">{material.unit}</TableCell>
                    <TableCell className="text-muted-foreground text-[13px] max-w-[200px] truncate">
                      {material.specification || '-'}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(material)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeleteId(material.id);
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
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-[13px]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Tidak ada data material yang cocok dengan filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        totalItems={filteredAndSortedMaterials.length}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        selectedCount={selectedIds.size}
      />

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">{editId ? 'Edit Material' : 'Tambah Material'}</DialogTitle>
            <DialogDescription className="text-[13px]">
              {editId ? 'Perbarui informasi material katalog.' : 'Tambahkan item material baru ke katalog master.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[13px]">Kode Material</Label>
                <Input
                  id="code"
                  placeholder="Contoh: CBL-FO-48"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="h-[32px] text-[13px] font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uom" className="text-[13px]">Satuan (UOM)</Label>
                <Select
                  value={formData.uom}
                  onValueChange={(val) => setFormData({ ...formData, uom: val || '' })}
                >
                  <SelectTrigger id="uom" className="h-[32px] text-[13px]">
                    <SelectValue placeholder="Pilih UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_UOMS.map((u) => (
                      <SelectItem key={u} value={u} className="text-[13px]">
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[13px]">Nama Material</Label>
              <Input
                id="name"
                placeholder="Contoh: Kabel Fiber Optik 48 Core ADSS"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-[32px] text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group" className="text-[13px]">Kategori / Group</Label>
              <Select
                value={formData.group}
                onValueChange={(val) => setFormData({ ...formData, group: val || '' })}
              >
                <SelectTrigger id="group" className="h-[32px] text-[13px]">
                  <SelectValue placeholder="Pilih Group" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_GROUPS.map((g) => (
                    <SelectItem key={g.value} value={g.value} className="text-[13px]">
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[13px]">Deskripsi / Spesifikasi</Label>
              <Input
                id="description"
                placeholder="Spesifikasi teknis (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-[32px] text-[13px]"
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-[32px] text-[13px]">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-[32px] text-[13px]">
                {editId ? 'Simpan Perubahan' : 'Tambah Material'}
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
              Hapus Material
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-1">
              Apakah Anda yakin ingin menghapus material ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
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
