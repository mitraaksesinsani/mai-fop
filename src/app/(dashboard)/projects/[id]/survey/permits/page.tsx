'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, FileText, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

export default function SurveyPermitsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL');

  const permits = [
    { id: 'PERMIT-001', areaType: 'Nasional', authority: 'Dinas PUPR Nasional', location: 'Jalan Nasional KM 12 - 28', status: 'Approved', doc: 'SK-PUPR-2026-902.pdf' },
    { id: 'PERMIT-002', areaType: 'Provinsi', authority: 'Dinas Perhubungan Prov. Jabar', location: 'Jalan Provinsi Bekasi', status: 'Review', doc: 'DOC-REQ-882.pdf' },
    { id: 'PERMIT-003', areaType: 'Private Area', authority: 'Pengelola Kawasan Industri MM2100', location: 'Kawasan MM2100 Block B', status: 'Approved', doc: 'AGR-MM2100-2026.pdf' },
  ];

  const filteredPermits = permits.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea =
      areaFilter === 'ALL' || p.areaType.toLowerCase().includes(areaFilter.toLowerCase());

    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Road &amp; Area Permit Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mandatory Permit Tracking across Road Classifications &amp; Authorities (PRD Module 3 Section 13-15)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Active Permits Register (PRJ-2026-001)</CardTitle>
            <CardDescription className="text-xs">Search permit document, location and authority</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search permit ID, authority, doc..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={areaFilter} onValueChange={(val) => val && setAreaFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Area Type" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Area Types</SelectItem>
                <SelectItem value="nasional">Nasional</SelectItem>
                <SelectItem value="provinsi">Provinsi</SelectItem>
                <SelectItem value="private">Private Area</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permit ID</TableHead>
                <TableHead>Area Classification</TableHead>
                <TableHead>Authority Name</TableHead>
                <TableHead>Location &amp; Segment</TableHead>
                <TableHead>Attached Document</TableHead>
                <TableHead className="text-right">Permit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No matching permits found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPermits.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold">{p.id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.areaType}</Badge></TableCell>
                    <TableCell className="text-xs font-medium">{p.authority}</TableCell>
                    <TableCell className="text-xs">{p.location}</TableCell>
                    <TableCell className="text-xs font-mono text-primary flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {p.doc}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.status === 'Approved' ? 'default' : 'secondary'} className={p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}>
                        {p.status}
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
