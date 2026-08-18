'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search, Filter } from 'lucide-react';

export default function ItemsSettingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const items = [
    { id: 'ITM-001', code: 'CBL-FO-96C', name: 'Fiber Optic Cable 96 Core G.652D', category: 'CABLES', uom: 'METER', price: 'Rp 25.000' },
    { id: 'ITM-002', code: 'CBL-FO-48C', name: 'Fiber Optic Cable 48 Core Armored', category: 'CABLES', uom: 'METER', price: 'Rp 18.500' },
    { id: 'ITM-003', code: 'ODC-288C', name: 'Optical Distribution Cabinet 288C', category: 'ENCLOSURES', uom: 'UNIT', price: 'Rp 4.500.000' },
    { id: 'ITM-004', code: 'SPL-1X8', name: 'PLC Splitter 1:8 SC/UPC', category: 'SPLITTERS', uom: 'PCS', price: 'Rp 120.000' },
  ];

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || i.category.toUpperCase() === categoryFilter.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Master Item &amp; Material Catalog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Global Material Standards &amp; Unit Pricing (PRD Module 15 Entity 3)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Master Item Catalog
            </CardTitle>
            <CardDescription className="text-xs">Search material specifications and category standards</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search item code, name, specs..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(val) => val && setCategoryFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="CABLES">Cables</SelectItem>
                <SelectItem value="ENCLOSURES">Enclosures</SelectItem>
                <SelectItem value="SPLITTERS">Splitters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Item Code</TableHead>
                <TableHead>Item Name &amp; Spec</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead className="text-right">Standard Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No matching items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs font-bold">{i.id}</TableCell>
                    <TableCell className="text-xs font-mono">{i.code}</TableCell>
                    <TableCell className="text-xs font-semibold">{i.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{i.category}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{i.uom}</TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-emerald-600">{i.price}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
