'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HardHat, Activity, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

export default function ImplementationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const activities = [
    { type: '1. Galian & Soil Trenching', segment: 'SEG-01 (15 KM)', progress: 100, status: 'Completed', contractor: 'PT Karya Konstruksi', dates: '2026-02-15 -> 2026-03-01' },
    { type: '2. Tarik Kabel (Subduct Pulling)', segment: 'SEG-01 (15 KM)', progress: 85, status: 'On Going Progress (OGP)', contractor: 'PT Karya Konstruksi', dates: '2026-03-02 -> 2026-03-20' },
    { type: '3. Jembatan (Bridge Crossing HDD)', segment: 'SEG-02 (1.5 KM)', progress: 60, status: 'On Going Progress (OGP)', contractor: 'PT Mandiri Teknik', dates: '2026-03-10 -> 2026-03-25' },
    { type: '4. Splicing (Penyambungan Core)', segment: 'Closure C-01 & C-02', progress: 40, status: 'On Going Progress (OGP)', contractor: 'PT Optik Nusantara', dates: '2026-03-15 -> 2026-03-30' },
    { type: '5. Terminasi Site ODF', segment: 'POP Jakarta & Bandung', progress: 20, status: 'Preparation', contractor: 'PT Optik Nusantara', dates: '2026-03-25 -> 2026-04-05' },
    { type: '6. Measurement (OTDR/Power)', segment: 'All Segments', progress: 0, status: 'Preparation', contractor: 'QA/QC Team', dates: '2026-04-05 -> 2026-04-15' },
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.contractor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'completed' && act.status === 'Completed') ||
      (statusFilter === 'ogp' && act.status.includes('OGP')) ||
      (statusFilter === 'preparation' && act.status === 'Preparation');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Implementation &amp; Construction Progress</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Work Breakdown Structure (WBS) &amp; Construction Tracking (PRD Module 5 Section 6-7)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" />
              Construction Sub-Activities (PRJ-2026-001)
            </CardTitle>
            <CardDescription className="text-xs">Search WBS activity, contractor and filter status</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sub-activity, contractor..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="ogp">In Progress (OGP)</SelectItem>
                <SelectItem value="preparation">Preparation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sub Activity Type</TableHead>
                <TableHead>Target Segment</TableHead>
                <TableHead>Contractor Pelaksana</TableHead>
                <TableHead>Timeline Date</TableHead>
                <TableHead>Progress %</TableHead>
                <TableHead className="text-right">Execution Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No matching construction activities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((act) => (
                  <TableRow key={act.type}>
                    <TableCell className="font-medium text-xs">{act.type}</TableCell>
                    <TableCell className="text-xs">{act.segment}</TableCell>
                    <TableCell className="text-xs">{act.contractor}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{act.dates}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${act.progress}%` }} />
                        </div>
                        <span className="font-bold">{act.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={act.status === 'Completed' ? 'default' : act.status.includes('OGP') ? 'secondary' : 'outline'}>
                        {act.status}
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
