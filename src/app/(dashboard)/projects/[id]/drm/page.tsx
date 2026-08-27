'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCheck2, CheckCircle2, Lock, AlertTriangle, Search, Filter } from 'lucide-react';

export default function DRMPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const drms = [
    { id: 'DRM-2026-001', prj: 'PRJ-2026-001 (Jakarta-Bandung)', date: '2026-02-10', location: 'Jakarta HQ Meeting Room 3', decision: 'Approved', boqStatus: 'Locked V1.0', marginStatus: '31.2% (Green)' },
    { id: 'DRM-2026-002', prj: 'PRJ-2026-002 (Surabaya East)', date: '2026-02-18', location: 'Surabaya Regional Office', decision: 'Approved With Note', boqStatus: 'Locked V1.0', marginStatus: '24.5% (Yellow)' },
    { id: 'DRM-2026-003', prj: 'PRJ-2026-003 (Medan Center)', date: '2026-03-01', location: 'Online Teams', decision: 'Revision Required', boqStatus: 'Pending Lock', marginStatus: '14.2% (Red)' },
  ];

  const filteredDRMs = drms.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.prj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.boqStatus.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDecision =
      decisionFilter === 'ALL' || d.decision.toLowerCase().includes(decisionFilter.toLowerCase());

    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Design Review Meeting (DRM) Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Final Design Review, Commercial Review &amp; Decision Approval (PRD Module 4)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              DRM Meeting Records &amp; Decisions
            </CardTitle>
            <CardDescription className="text-xs">Search DRM records and filter decision outcome</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search DRM ID, project, location..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={decisionFilter} onValueChange={(val) => val && setDecisionFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Decisions</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="note">With Note</SelectItem>
                <SelectItem value="revision">Revision Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DRM ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Meeting Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>BOQ Baseline</TableHead>
                <TableHead>Margin Review</TableHead>
                <TableHead className="text-right">DRM Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDRMs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching DRM records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDRMs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs font-bold">{d.id}</TableCell>
                    <TableCell className="text-xs font-medium">{d.prj}</TableCell>
                    <TableCell className="text-xs">{d.date}</TableCell>
                    <TableCell className="text-xs">{d.location}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-mono">{d.boqStatus}</Badge></TableCell>
                    <TableCell className="text-xs font-semibold">{d.marginStatus}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={d.decision === 'Approved' ? 'default' : d.decision === 'Approved With Note' ? 'secondary' : 'destructive'}>
                        {d.decision}
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
