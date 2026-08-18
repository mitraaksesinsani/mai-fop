'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileEdit, Search, Filter } from 'lucide-react';

export default function ChangeRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const crs = [
    { crNo: 'CR-2026-001', prj: 'PRJ-2026-001', desc: 'Penambahan panjang kabel 3.5 KM akibat rute konstruksi jalan', reason: 'Kondisi Lapangan / Izin', costImpact: '+Rp 180.000.000', marginImpact: '-1.4%', status: 'Approved' },
    { crNo: 'CR-2026-002', prj: 'PRJ-2026-002', desc: 'Perubahan metode pemasangan dari Galian ke Aerial', reason: 'Hambatan Izin Nasional', costImpact: '+Rp 90.000.000', marginImpact: '-0.8%', status: 'Under Review' },
  ];

  const filteredCRs = crs.filter((c) => {
    const matchesSearch =
      c.crNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.prj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'approved' && c.status === 'Approved') ||
      (statusFilter === 'review' && c.status.toLowerCase().includes('review'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Change Request (CR) Impact Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Post-DRM Change Request Management &amp; Profit Impact Tracking (PRD Module 4 Section 23 &amp; Module 15 Entity 15)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-primary" />
              Change Request Register
            </CardTitle>
            <CardDescription className="text-xs">Search change request number, description or reason</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search CR No, project, desc..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CR Number</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Change Description</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Cost Impact</TableHead>
                <TableHead>Margin Impact</TableHead>
                <TableHead className="text-right">Approval Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching change requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCRs.map((c) => (
                  <TableRow key={c.crNo}>
                    <TableCell className="font-mono text-xs font-bold">{c.crNo}</TableCell>
                    <TableCell className="text-xs font-mono">{c.prj}</TableCell>
                    <TableCell className="text-xs font-medium">{c.desc}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.reason}</TableCell>
                    <TableCell className="text-xs font-bold text-destructive">{c.costImpact}</TableCell>
                    <TableCell className="text-xs font-bold text-amber-600">{c.marginImpact}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={c.status === 'Approved' ? 'default' : 'secondary'} className={c.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}>
                        {c.status}
                      </Badge>
                    </TableCell>
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
