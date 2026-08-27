'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Camera, MapPin, Calendar, CheckCircle2, User, Search, Filter } from 'lucide-react';

export default function ImplementationEvidencePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [qaFilter, setQaFilter] = useState('ALL');

  const evidences = [
    { id: 'EVI-001', activity: 'Galian Soil Trenching', file: 'IMG_Galian_Depth_1.2m.jpg', gps: '-6.2088, 106.8456', timestamp: '2026-02-18 10:14:22', uploader: 'Ahmad (Contractor)', status: 'Approved' },
    { id: 'EVI-002', activity: 'Tarik Kabel Subduct', file: 'IMG_Cable_Drum_001.jpg', gps: '-6.2140, 106.8520', timestamp: '2026-03-04 14:22:10', uploader: 'Budi (Supervisor)', status: 'Approved' },
    { id: 'EVI-003', activity: 'Splicing Core Closure C-01', file: 'IMG_Splice_Core_Result.jpg', gps: '-6.2300, 106.8900', timestamp: '2026-03-16 09:45:00', uploader: 'Dedi (Technician)', status: 'Under QA Review' },
  ];

  const filteredEvidences = evidences.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.uploader.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQa =
      qaFilter === 'ALL' ||
      (qaFilter === 'approved' && e.status === 'Approved') ||
      (qaFilter === 'review' && e.status.toLowerCase().includes('review'));

    return matchesSearch && matchesQa;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Evidence Vault</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Geotagged &amp; Timestamped Photo/Video Digital Bukti Pekerjaan (PRD Module 5 Section 8-9)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Uploaded Construction Evidence
            </CardTitle>
            <CardDescription className="text-xs">Search evidence photos, linked activity or uploader</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search evidence ID, file, activity..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={qaFilter} onValueChange={(val) => val && setQaFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="QA Status" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="review">Under QA Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evidence ID</TableHead>
                <TableHead>Linked Activity</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>GPS Coordinate</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead className="text-right">QA Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvidences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching construction evidence found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvidences.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-bold">{e.id}</TableCell>
                    <TableCell className="text-xs font-medium">{e.activity}</TableCell>
                    <TableCell className="text-xs font-mono text-primary">{e.file}</TableCell>
                    <TableCell className="text-xs font-mono">{e.gps}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{e.timestamp}</TableCell>
                    <TableCell className="text-xs">{e.uploader}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={e.status === 'Approved' ? 'default' : 'secondary'} className={e.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}>
                        {e.status}
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
