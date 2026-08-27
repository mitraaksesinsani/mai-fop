'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileCheck, Map, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function SurveyKMLPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [versionFilter, setVersionFilter] = useState('ALL');

  const kmlHistory = [
    { id: 'KML-001', fileName: 'JKT_BDG_Survey_V0.1.kml', project: 'PRJ-2026-001', uploader: 'Budi (Field Survey)', version: 'V0.1', date: '2026-01-20', status: 'Approved' },
    { id: 'KML-002', fileName: 'SBY_Metro_Ring_East.kml', project: 'PRJ-2026-002', uploader: 'Siti (GIS Tech)', version: 'V0.2', date: '2026-02-05', status: 'Pending Review' },
    { id: 'KML-003', fileName: 'Medan_FTTx_Access_Final.kml', project: 'PRJ-2026-003', uploader: 'Ahmad (Field PM)', version: 'V1.0', date: '2026-03-01', status: 'Approved' },
  ];

  const filteredHistory = kmlHistory.filter((k) => {
    const matchesSearch =
      k.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.uploader.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVersion =
      versionFilter === 'ALL' || k.version === versionFilter;

    return matchesSearch && matchesVersion;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Survey KML / Route Verification</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Google Earth KML/KMZ upload &amp; metadata versioning (PRD Module 3 Section 12)
          </p>
        </div>
        <Link href="/gis">
          <Button className="gap-2 text-xs shadow-none cursor-pointer">
            <Map className="w-4 h-4" /> Open GIS Map Comparison
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Survey KML File Upload &amp; History</CardTitle>
            <CardDescription className="text-xs">Search uploaded KML tracks by filename, project or uploader</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search KML file, project ID..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={versionFilter} onValueChange={(val) => val && setVersionFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Versions</SelectItem>
                <SelectItem value="V0.1">V0.1 (Initial)</SelectItem>
                <SelectItem value="V0.2">V0.2 (Survey)</SelectItem>
                <SelectItem value="V1.0">V1.0 (Final)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border/80 bg-muted/20 rounded-lg p-6 text-center space-y-2">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Drag &amp; drop KML/KMZ file or click to upload</p>
            <p className="text-xs text-muted-foreground">Supported format: .kml, .kmz (Max 25MB)</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Project Reference</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching KML files found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-mono text-xs font-bold">{k.id}</TableCell>
                    <TableCell className="text-xs font-semibold text-primary">{k.fileName}</TableCell>
                    <TableCell className="text-xs font-mono">{k.project}</TableCell>
                    <TableCell className="text-xs">{k.uploader}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-mono">{k.version}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{k.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={k.status === 'Approved' ? 'default' : 'secondary'} className="text-[10px]">
                        {k.status}
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
