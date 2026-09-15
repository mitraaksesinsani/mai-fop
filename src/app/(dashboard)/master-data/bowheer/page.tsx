'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Briefcase,
  Radio,
  Building,
  Landmark,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useBowheer, Bowheer, BowheerCategory } from '@/context/BowheerContext';
import { toast } from 'sonner';

const CATEGORIES: BowheerCategory[] = [
  'Telekomunikasi',
  'BUMN / Pemerintahan',
  'Perbankan / Finansial',
  'Enterprise / Swasta',
  'Lainnya',
];

export default function BowheerMasterPage() {
  const { bowheers, addBowheer, updateBowheer, deleteBowheer } = useBowheer();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBowheer, setEditingBowheer] = useState<Bowheer | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Bowheer | null>(null);

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

  // KPI Metrics
  const stats = useMemo(() => {
    const total = bowheers.length;
    const active = bowheers.filter((b) => b.status === 'ACTIVE').length;
    const telco = bowheers.filter((b) => b.category === 'Telekomunikasi').length;
    const enterprise = bowheers.filter((b) => b.category !== 'Telekomunikasi').length;
    return { total, active, telco, enterprise };
  }, [bowheers]);

  // Filtered List
  const filteredBowheers = useMemo(() => {
    return bowheers.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.alias && b.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.contactPerson && b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [bowheers, searchTerm, categoryFilter, statusFilter]);

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
      toast.success(`Bowheer ${deleteCandidate.name} berhasil dihapus.`);
      setDeleteCandidate(null);
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
    <div className="space-y-6 animate-fade-in pb-12 text-[12px]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Master Data Bowheer (Klien)
              </h1>
              <p className="text-muted-foreground text-[12px] mt-0.5">
                Daftar pemilik proyek / klien telekomunikasi dan enterprise yang digunakan sebagai pilihan Customer / Client di proyek
              </p>
            </div>
          </div>
        </div>

        <Button onClick={openCreateModal} className="gap-2 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" />
          Tambah Bowheer
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-none bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Bowheer</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.total}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-none bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status Aktif</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {stats.active}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-none bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Telekomunikasi</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {stats.telco}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50">
              <Radio className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-none bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">BUMN & Enterprise</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                {stats.enterprise}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50">
              <Landmark className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Controls */}
      <Card className="border border-border/60 shadow-none bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari kode, nama, atau PIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="w-44">
                    <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || '')}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">Semua Kategori</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-36">
                    <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || '')}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">Semua Status</SelectItem>
                    <SelectItem value="ACTIVE" className="text-xs">Aktif</SelectItem>
                    <SelectItem value="INACTIVE" className="text-xs">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border border-border/60 shadow-none bg-card overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Daftar Bowheer / Klien</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Menampilkan {filteredBowheers.length} dari total {bowheers.length} bowheer terdaftar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="w-24 pl-5">Kode</TableHead>
                <TableHead className="min-w-[220px]">Nama Perusahaan / Klien</TableHead>
                <TableHead className="w-40">Kategori</TableHead>
                <TableHead className="min-w-[180px]">Kontak PIC</TableHead>
                <TableHead className="min-w-[200px]">Alamat</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="w-24 text-right pr-5">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBowheers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-muted-foreground text-xs">
                    Tidak ada data Bowheer yang cocok dengan kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBowheers.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30 transition-colors text-xs">
                    {/* Kode */}
                    <TableCell className="pl-5 font-bold">
                      <span className="px-2 py-0.5 rounded bg-muted border font-mono text-[11px] tracking-wider text-foreground">
                        {b.code}
                      </span>
                    </TableCell>

                    {/* Nama & Alias */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{b.name}</span>
                        {b.alias && (
                          <span className="text-[11px] text-muted-foreground">
                            Alias: {b.alias}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Kategori */}
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] font-normal px-2 py-0.5 ${getCategoryBadgeClass(b.category)}`}>
                        {b.category}
                      </Badge>
                    </TableCell>

                    {/* Kontak PIC */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{b.contactPerson || '-'}</span>
                        {b.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                        {b.email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{b.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Alamat */}
                    <TableCell>
                      <div className="flex items-start gap-1 text-[11px] text-muted-foreground max-w-[240px]">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{b.address || '-'}</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium px-2 py-0.5 ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {b.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(b)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Edit Bowheer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCandidate(b)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Hapus Bowheer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Tambah / Edit Bowheer */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingBowheer ? 'Edit Data Bowheer' : 'Tambah Bowheer Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi informasi klien / bowheer yang akan dijadikan referensi Customer pada proyek.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Kode Bowheer */}
              <div className="space-y-1.5">
                <Label htmlFor="bwhCode" className="text-xs">
                  Kode Bowheer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bwhCode"
                  placeholder="Contoh: TSEL, ISAT, EXCL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="font-mono text-xs uppercase"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <Label htmlFor="bwhCategory" className="text-xs">
                  Kategori Industri <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                    onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger id="bwhCategory" className="text-xs">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nama Resmi Perusahaan */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhName" className="text-xs">
                  Nama Resmi Perusahaan (PT / Instansi) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bwhName"
                  placeholder="Contoh: PT Telkomsel Tbk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              {/* Nama Singkatan / Alias */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhAlias" className="text-xs">
                  Nama Populer / Singkatan (Opsional)
                </Label>
                <Input
                  id="bwhAlias"
                  placeholder="Contoh: Telkomsel, IOH, Moratelindo"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* PIC Contact Person */}
              <div className="space-y-1.5">
                <Label htmlFor="bwhPic" className="text-xs">
                  Contact Person (PIC Bowheer)
                </Label>
                <Input
                  id="bwhPic"
                  placeholder="Nama PIC Klien"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Telepon */}
              <div className="space-y-1.5">
                <Label htmlFor="bwhPhone" className="text-xs">
                  No. Telepon / HP
                </Label>
                <Input
                  id="bwhPhone"
                  placeholder="Contoh: 021-5240123 / 0812xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhEmail" className="text-xs">
                  Email Klien / Procurement
                </Label>
                <Input
                  id="bwhEmail"
                  type="email"
                  placeholder="Contoh: procurement@client.co.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Alamat */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhAddress" className="text-xs">
                  Alamat Kantor
                </Label>
                <Textarea
                  id="bwhAddress"
                  placeholder="Gedung / Jalan / Kota"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="bwhStatus" className="text-xs">
                  Status Bowheer
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="bwhStatus" className="text-xs">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs">Aktif (Tampil di Opsi Pilihan Proyek)</SelectItem>
                    <SelectItem value="INACTIVE" className="text-xs">Non-Aktif (Diarsipkan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button type="submit" className="text-xs cursor-pointer">
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
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Konfirmasi Hapus Bowheer
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Apakah Anda yakin ingin menghapus Bowheer <span className="font-semibold text-foreground">"{deleteCandidate?.name}"</span> ({deleteCandidate?.code})?
              Data yang dihapus tidak akan muncul lagi di daftar pilihan Customer proyek baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              className="text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="text-xs cursor-pointer"
            >
              Ya, Hapus Bowheer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
