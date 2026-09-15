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

export const MASTER_ALAT_KERJA_DATA = [
  { id: '1', code: 'AL-001', name: 'Manual (Tenaga Manusia)', category: 'Manual' },
  { id: '2', code: 'AL-002', name: 'Excavator (Beko)', category: 'Alat Berat' },
  { id: '3', code: 'AL-003', name: 'Splicer', category: 'Alat Khusus' },
  { id: '4', code: 'AL-004', name: 'OTDR', category: 'Alat Ukur' },
  { id: '5', code: 'AL-005', name: 'Genset', category: 'Pendukung' },
];

const KATEGORI_ALAT = ['Manual', 'Alat Berat', 'Alat Khusus', 'Alat Ukur', 'Pendukung'];

export default function AlatKerjaPage() {
  const [data, setData] = useState(MASTER_ALAT_KERJA_DATA);
  const [search, setSearch] = useState('');
  
  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: ''
  });

  const filteredData = data.filter(item => 
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditId(null);
    setFormData({ code: '', name: '', category: '' });
    setIsOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditId(item.id);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setData(prev => prev.map(item => item.id === editId ? { ...formData, id: editId } : item));
      toast.success('Alat kerja berhasil diubah');
    } else {
      setData(prev => [...prev, { ...formData, id: String(Date.now()) }]);
      toast.success('Alat kerja berhasil ditambahkan');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alat kerja ini?')) {
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Alat kerja berhasil dihapus');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data Alat Kerja</h1>
          <p className="text-gray-500">Kelola daftar alat kerja yang digunakan pada implementasi proyek.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Tambah Alat Kerja
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Cari alat kerja..." 
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
              <TableHead className="font-semibold text-gray-700">Kode Alat</TableHead>
              <TableHead className="font-semibold text-gray-700">Nama Alat Kerja</TableHead>
              <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
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
                <TableCell colSpan={4} className="text-center h-24 text-gray-500">
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
            <DialogTitle>{editId ? 'Edit Alat Kerja' : 'Tambah Alat Kerja'}</DialogTitle>
            <DialogDescription>
              Isi detail alat kerja.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label>Kode Alat</Label>
              <Input 
                required 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Contoh: AL-001" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Nama Alat Kerja</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Excavator (Beko)" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val || ""})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_ALAT.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
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
