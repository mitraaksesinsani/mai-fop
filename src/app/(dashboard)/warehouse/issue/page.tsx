'use client';

import { useEffect, useState } from 'react';
import { PackageMinus, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProject } from '@/context/ProjectContext';

export default function MaterialIssuePage() {
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [issuedItems, setIssuedItems] = useState<Record<string, number>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whRes, matRes] = await Promise.all([
          api.get('/api/warehouse'),
          api.get('/api/materials')
        ]);
        setWarehouses(whRes.data?.data || []);
        setMaterials(matRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    fetchData();
  }, []);

  const handleQtyChange = (materialId: string, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) && val !== '') return;
    
    setIssuedItems(prev => ({
      ...prev,
      [materialId]: isNaN(num) ? 0 : num
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || selectedProjectId === 'all' || !selectedWarehouseId) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        projectId: selectedProjectId,
        warehouseId: selectedWarehouseId,
        items: Object.entries(issuedItems)
          .filter(([_, qty]) => qty > 0)
          .map(([materialId, issuedQty]) => ({ materialId, issuedQty }))
      };
      
      await api.post('/api/warehouse/issue', payload);
      setSuccess(true);
      setIssuedItems({});
    } catch (error) {
      console.error('Failed to issue materials:', error);
      alert('Failed to process material issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Material Issue (Pengeluaran Barang)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pengeluaran material dari gudang langsung dialokasikan untuk Project ID aktif.
        </p>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">Material berhasil dikeluarkan dan dicatat pada Project ID aktif!</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Target Proyek & Gudang</CardTitle>
              <CardDescription>Pilih Project ID dan Gudang asal material</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projSelect">Target Project ID</Label>
                <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val || 'PRJ-2026-001')}>
                  <SelectTrigger id="projSelect">
                    <SelectValue placeholder="Pilih Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.id} - {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whSelect">Gudang Asal</Label>
                <Select value={selectedWarehouseId} onValueChange={(val) => setSelectedWarehouseId(val || '')}>
                  <SelectTrigger id="whSelect">
                    <SelectValue placeholder="Pilih Gudang Asal" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className={!selectedWarehouseId ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle>Item Material yang Dikeluarkan</CardTitle>
              <CardDescription>Masukkan jumlah kuantitas material yang dikeluarkan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode & Nama Material</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="w-32">Qty Keluar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((mat) => (
                      <TableRow key={mat.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{mat.materialName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{mat.materialCode}</div>
                        </TableCell>
                        <TableCell className="text-sm">{mat.category}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-8 w-24 text-right"
                            value={issuedItems[mat.id] ?? 0}
                            onChange={(e) => handleQtyChange(mat.id, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PackageMinus className="w-4 h-4" />
                        Proses Material Issue
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
