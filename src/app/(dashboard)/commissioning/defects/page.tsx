'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function CommissioningDefectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const punchList = [
    { id: 'PUNCH-01', desc: 'Splicing loss pada Core 03 melebihi batas 0.1 dB', location: 'Closure C-02', severity: 'Major', pic: 'Dedi (Splicer)', dueDate: '2026-03-28', status: 'In Correction' },
    { id: 'PUNCH-02', desc: 'Labeling ODF di POP Bandung belum tertempel rapi', location: 'POP Bandung Rack B', severity: 'Minor', pic: 'Budi (Supervisor)', dueDate: '2026-03-29', status: 'Closed' },
  ];

  const filteredPunch = punchList.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'ALL' || p.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Defect &amp; Punch List Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Defect Tracking (Minor, Major, Critical) &amp; Acceptance Clearance Workflow (PRD Module 6 Section 12-13)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Active Punch List Items</CardTitle>
            <CardDescription className="text-xs">Search punch list defect findings and severity level</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search punch ID, finding, PIC..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={(val) => val && setSeverityFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Severity</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Punch ID</TableHead>
                <TableHead>Finding Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Severity Category</TableHead>
                <TableHead>Assigned PIC</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPunch.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching defect items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPunch.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold">{p.id}</TableCell>
                    <TableCell className="text-xs font-medium">{p.desc}</TableCell>
                    <TableCell className="text-xs">{p.location}</TableCell>
                    <TableCell>
                      <Badge variant={p.severity === 'Major' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {p.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{p.pic}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.status === 'Closed' ? 'default' : 'outline'} className={p.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}>
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
