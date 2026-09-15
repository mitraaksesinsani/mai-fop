'use client';

import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export const MASTER_DESIGNATOR_DATA = [
  { id: '1', code: 'AC-OF-SM-ADSS-24D', description: 'Penarikan Kabel Fiber Optik ADSS 24 Core', type: 'Kabel', unit: 'Meter' },
  { id: '2', code: 'AC-OF-SM-DUCT-48D', description: 'Gelar Kabel Duct HDPE 48 Core', type: 'Kabel', unit: 'Meter' },
  { id: '3', code: 'PU-S7.0-140', description: 'Pendirian Tiang Besi 7 Meter 140 daN', type: 'Aksesoris', unit: 'batang' },
  { id: '4', code: 'PU-S9.0-200', description: 'Pendirian Tiang Besi 9 Meter 200 daN', type: 'Aksesoris', unit: 'batang' },
  { id: '5', code: 'GL-OPEN-TRENCH-1M', description: 'Galian Tanah Manual Kedalaman 1 Meter', type: 'Galian', unit: 'Meter' },
  { id: '6', code: 'MH-PRECAST-TYPE-B', description: 'Pemasangan Precast Manhole Type B', type: 'Manhole', unit: 'unit' },
  { id: '7', code: 'JT-CLOSURE-24C', description: 'Pemasangan Joint Closure 24 Core', type: 'Jointing', unit: 'pcs' },
  { id: '8', code: 'TM-ODC-144C', description: 'Terminasi ODC 144 Core', type: 'Terminasi', unit: 'core' },
];

const JENIS_PEKERJAAN = ['Kabel', 'Jointing', 'Manhole', 'Galian', 'Terminasi', 'Aksesoris'];
const SATUAN = ['Meter', 'pcs', 'core', 'set', 'unit', 'node', 'track', 'm3', 'titik', 'lumpsum', 'batang'];

export default function DesignatorPage() {
  const [data, setData] = useState(MASTER_DESIGNATOR_DATA);
  const [search, setSearch] = useState('');
  
  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: '',
    unit: ''
  });

  const filteredData = data.filter(item => 
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

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
      unit: item.unit
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setData(prev => prev.map(item => item.id === editId ? { ...formData, id: editId } : item));
      toast.success('Designator berhasil diubah');
    } else {
      setData(prev => [...prev, { ...formData, id: String(Date.now()) }]);
      toast.success('Designator berhasil ditambahkan');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus designator ini?')) {
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Designator berhasil dihapus');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data Designator</h1>
          <p className="text-gray-500">Kelola daftar item pekerjaan fisik, deskripsi, jenis, dan satuannya.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Tambah Designator
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Cari designator..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Designator</TableHead>
              <TableHead className="font-semibold text-gray-700">Deskripsi Pekerjaan</TableHead>
              <TableHead className="font-semibold text-gray-700">Jenis Pekerjaan</TableHead>
              <TableHead className="font-semibold text-gray-700">Satuan</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Designator' : 'Tambah Designator Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail pekerjaan fisik. Form ini akan digunakan di halaman DRM Plan dan Progress.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label>Kode Designator</Label>
              <Input 
                required 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Contoh: AC-OF-SM-ADSS-24D" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi Pekerjaan</Label>
              <Input 
                required 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Penarikan Kabel..." 
              />
            </div>
            <div className="grid gap-2">
              <Label>Jenis Pekerjaan</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val || ""})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_PEKERJAAN.map(j => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Satuan</Label>
              <Select value={formData.unit} onValueChange={(val) => setFormData({...formData, unit: val || ""})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Satuan" />
                </SelectTrigger>
                <SelectContent>
                  {SATUAN.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit">{editId ? 'Simpan Perubahan' : 'Tambah'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
