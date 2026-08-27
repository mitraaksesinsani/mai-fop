'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, AlertTriangle, ShieldCheck, Search, Filter } from 'lucide-react';

export default function ClosingAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const assets = [
    { id: 'AST-CAB-001', type: 'Cable Asset', spec: '48 Core SM Armored', loc: 'Segment A-B (45 KM)', warranty: '24 Months (Exp: 2028-03-25)', vendor: 'PT Corning Indonesia' },
    { id: 'AST-CLS-001', type: 'Closure Asset', spec: 'Dome IP68 48 Core', loc: 'Closure #01 Bekasi', warranty: '12 Months (Exp: 2027-03-25)', vendor: 'PT Fiber Solution' },
    { id: 'AST-ODF-001', type: 'ODF Asset', spec: 'Rack Mount 48 Port SC/UPC', loc: 'POP Bandung Site', warranty: '12 Months (Exp: 2027-03-25)', vendor: 'PT Fiber Solution' },
  ];

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.spec.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vendor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' || a.type.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fiber Asset Inventory &amp; Warranty</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Recorded Asset Database, Handover &amp; Warranty Monitoring (PRD Module 7 Section 8-10)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Project Transferred Assets (PRJ-2026-001)
            </CardTitle>
            <CardDescription className="text-xs">Search asset ID, specification, location and vendor</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search asset ID, spec, vendor..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Asset Types</SelectItem>
                <SelectItem value="cable">Cable Asset</SelectItem>
                <SelectItem value="closure">Closure Asset</SelectItem>
                <SelectItem value="odf">ODF Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Technical Specification</TableHead>
                <TableHead>Installation Location</TableHead>
                <TableHead>Vendor Supplier</TableHead>
                <TableHead className="text-right">Warranty Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No matching transferred assets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs font-bold">{a.id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{a.type}</Badge></TableCell>
                    <TableCell className="text-xs font-medium">{a.spec}</TableCell>
                    <TableCell className="text-xs">{a.loc}</TableCell>
                    <TableCell className="text-xs">{a.vendor}</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-emerald-600">{a.warranty}</TableCell>
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
