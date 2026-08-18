'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Search, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const logs = [
    { id: 'LOG-001', user: 'Admin FOPLP', module: 'DRM Baseline', action: 'LOCKED', oldVal: 'V0.3 Draft', newVal: 'V1.0 Locked', timestamp: '2026-02-10 14:00:12' },
    { id: 'LOG-002', user: 'Project Manager', module: 'BOQ Management', action: 'UPDATE', oldVal: 'Cable 40 KM', newVal: 'Cable 45 KM', timestamp: '2026-02-08 11:20:05' },
    { id: 'LOG-003', user: 'Field Engineer', module: 'KML Spatial', action: 'UPLOAD', oldVal: 'None', newVal: 'SBY_Metro_V1.kml', timestamp: '2026-02-01 09:15:30' },
  ];

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.newVal.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === 'ALL' || l.action.toUpperCase() === actionFilter.toUpperCase();

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Trail &amp; Traceability Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            System Activity Log (PRD Module 15 Entity 23)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              System Audit Trail Logs
            </CardTitle>
            <CardDescription className="text-xs">Search operator actions, value changes and timestamps</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search audit ID, user, module..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={(val) => val && setActionFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="LOCKED">LOCKED</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="UPLOAD">UPLOAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit ID</TableHead>
                <TableHead>User Operator</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Previous Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs font-bold">{l.id}</TableCell>
                    <TableCell className="text-xs font-medium">{l.user}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{l.module}</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{l.action}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground line-through">{l.oldVal}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">{l.newVal}</TableCell>
                    <TableCell className="text-right text-[11px] text-muted-foreground font-mono">{l.timestamp}</TableCell>
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
