'use client';

import { useState } from 'react';
import { FileSpreadsheet, Plus, Download, History, CheckCircle2, Lock, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BOQManagementPage() {
  const [selectedVersion, setSelectedVersion] = useState('V0.2');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const boqItems = [
    { no: '1.1', category: 'Material', name: 'Fiber Optic Cable 48 Core Single Mode', spec: 'Armored Underground Outdoor', unit: 'Meter', qty: 45000, remark: 'Main Route' },
    { no: '1.2', category: 'Material', name: 'HDPE Subduct 32/26 mm', spec: 'High Density Polyethylene', unit: 'Meter', qty: 45000, remark: 'Underground Duct' },
    { no: '1.3', category: 'Material', name: 'Fiber Splice Closure 48 Core', spec: 'Dome Type IP68 Outdoor', unit: 'Unit', qty: 18, remark: 'Jointing Nodes' },
    { no: '2.1', category: 'Civil Work', name: 'Galian Soil Trenching & Backfill', spec: 'Depth 1.2M, Width 0.4M', unit: 'Meter', qty: 20000, remark: 'Direct Buried' },
    { no: '2.2', category: 'Civil Work', name: 'Boring HDD & Subduct Blowing', spec: 'Road Crossing HDD', unit: 'Meter', qty: 1500, remark: 'Crossing Segment' },
    { no: '3.1', category: 'Service', name: 'Cable Pulling & Subduct Installation', spec: 'Standard Pulling Work', unit: 'Meter', qty: 45000, remark: 'Installation' },
    { no: '3.2', category: 'Service', name: 'Fiber Fusion Splicing & Testing', spec: 'Core-to-Core Alignment', unit: 'Joint', qty: 432, remark: 'Splicing' },
  ];

  const filteredItems = boqItems.filter((item) => {
    const matchesSearch =
      item.no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remark.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || item.category.toUpperCase() === categoryFilter.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">BOQ Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bill of Quantities Structure &amp; Versioning (Indicative to Final BOQ)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedVersion} onValueChange={(val) => val && setSelectedVersion(val)}>
            <SelectTrigger className="w-36 text-xs shadow-none"><SelectValue placeholder="Version" /></SelectTrigger>
            <SelectContent className="shadow-none border-border">
              <SelectItem value="V0.1">BOQ V0.1 (Initial)</SelectItem>
              <SelectItem value="V0.2">BOQ V0.2 (Engineering)</SelectItem>
              <SelectItem value="V0.3">BOQ V0.3 (Survey Update)</SelectItem>
              <SelectItem value="V1.0">BOQ V1.0 (DRM Final Locked)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 text-xs shadow-none cursor-pointer">
            <Download className="w-4 h-4" /> Export BOQ Excel
          </Button>
          <Button className="gap-2 text-xs shadow-none cursor-pointer">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* BOQ Summary Header Card */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Active BOQ Header: PRJ-2026-001 (Jakarta - Bandung)</CardTitle>
            <CardDescription className="text-xs">Version Status: <Badge variant="secondary" className="ml-1 font-mono">{selectedVersion}</Badge></CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search BOQ item, spec, segment..."
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
                <SelectItem value="MATERIAL">Material</SelectItem>
                <SelectItem value="CIVIL WORK">Civil Work</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Item No</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Technical Specification</TableHead>
                <TableHead className="w-24">Unit</TableHead>
                <TableHead className="w-28 text-right">Quantity</TableHead>
                <TableHead>Remark / Segment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching BOQ items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.no}>
                    <TableCell className="font-mono text-xs">{item.no}</TableCell>
                    <TableCell>
                      <Badge variant={item.category === 'Material' ? 'default' : item.category === 'Civil Work' ? 'secondary' : 'outline'} className="text-[10px]">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-xs">{item.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.spec}</TableCell>
                    <TableCell className="text-xs">{item.unit}</TableCell>
                    <TableCell className="text-xs text-right font-bold">{item.qty.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.remark}</TableCell>
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
