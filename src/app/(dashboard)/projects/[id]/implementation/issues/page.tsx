'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ShieldAlert, Search, Filter } from 'lucide-react';

export default function ImplementationIssuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const issues = [
    { id: 'ISSUE-01', desc: 'Izin galian tertahan di KM 18 oleh Dinas Bina Marga', location: 'KM 18 Road Segment', severity: 'High', solution: 'Koordinasi ulang dengan PIC Dinas & Pengalihan Jalur Alternative', status: 'Open' },
    { id: 'ISSUE-02', desc: 'Pipa HDPE tersumbat saat blowing microduct', location: 'Segment B-02', severity: 'Medium', solution: 'Penggantian pipa HDPE subduct sepanjang 100 meter', status: 'Resolved' },
  ];

  const filteredIssues = issues.filter((iss) => {
    const matchesSearch =
      iss.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.solution.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'ALL' || iss.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Issue &amp; Risk Control</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Construction Obstacle &amp; Severity Tracking (PRD Module 5)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Active Construction Issues Log
            </CardTitle>
            <CardDescription className="text-xs">Search issue description, location and severity</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search issue ID, description, location..."
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
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Proposed Solution</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No matching construction issues found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((iss) => (
                  <TableRow key={iss.id}>
                    <TableCell className="font-mono text-xs font-bold">{iss.id}</TableCell>
                    <TableCell className="text-xs font-medium">{iss.desc}</TableCell>
                    <TableCell className="text-xs">{iss.location}</TableCell>
                    <TableCell>
                      <Badge variant={iss.severity === 'High' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {iss.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{iss.solution}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={iss.status === 'Open' ? 'outline' : 'default'} className={iss.status === 'Open' ? 'border-amber-400 text-amber-600 bg-amber-50' : ''}>
                        {iss.status}
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
