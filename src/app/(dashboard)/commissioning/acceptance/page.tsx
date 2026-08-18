'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCheck, Download, CheckCircle2, Search, Filter } from 'lucide-react';

export default function CommissioningAcceptancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const bautRecords = [
    { id: 'BAUT-2026-089', prj: 'PRJ-2026-001 (Jakarta - Bandung)', customer: 'PT Telkomsel Tbk', date: '2026-03-25', status: 'Ready for Sign-off' },
    { id: 'BAUT-2026-042', prj: 'PRJ-2026-002 (Surabaya Metro Ring)', customer: 'PT Indosat Tbk', date: '2026-03-10', status: 'Signed & Approved' },
    { id: 'BAUT-2026-012', prj: 'PRJ-2026-004 (Bank Mandiri HQ)', customer: 'Bank Mandiri', date: '2026-03-01', status: 'Signed & Approved' },
  ];

  const filteredBaut = bautRecords.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.prj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ready' && b.status.toLowerCase().includes('ready')) ||
      (statusFilter === 'signed' && b.status.toLowerCase().includes('signed'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">BA Acceptance (BA Uji Terima - BAUT)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Customer Acceptance Certificate &amp; Sign-off Management (PRD Module 6 Section 16)
          </p>
        </div>
        <Button className="gap-2 text-xs shadow-none cursor-pointer">
          <Download className="w-4 h-4" /> Download Official BAUT PDF
        </Button>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              BAUT Certificates &amp; Acceptance Register
            </CardTitle>
            <CardDescription className="text-xs">Search BAUT number, project or customer client name</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search BAUT ID, project, customer..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ready">Ready for Sign-off</SelectItem>
                <SelectItem value="signed">Signed &amp; Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BAUT Certificate ID</TableHead>
                <TableHead>Project Reference</TableHead>
                <TableHead>Customer Client</TableHead>
                <TableHead>Sign Date</TableHead>
                <TableHead className="text-right">Acceptance Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBaut.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                    No matching BAUT acceptance records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBaut.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-bold">{b.id}</TableCell>
                    <TableCell className="text-xs font-medium">{b.prj}</TableCell>
                    <TableCell className="text-xs font-semibold">{b.customer}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={b.status.includes('Signed') ? 'default' : 'secondary'} className={b.status.includes('Signed') ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}>
                        {b.status}
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
