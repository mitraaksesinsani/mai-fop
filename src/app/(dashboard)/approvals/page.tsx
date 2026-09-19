'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, CheckCircle2, Clock, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { toast } from 'sonner';

interface ApprovalItem {
  id: string;
  projectId: string;
  module: string;
  project: string;
  requestor: string;
  target: string;
  date: string;
  status: string;
}

export default function ApprovalsPage() {
  const { projects, updateProject } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvedIds, setApprovedIds] = useState<Record<string, boolean>>({});

  const approvals: ApprovalItem[] = useMemo(() => {
    return projects.flatMap((p) => {
      const items: ApprovalItem[] = [];
      const isApproved = approvedIds[p.id];
      if (p.status === 'Planning' || isApproved) {
        items.push({
          id: `APP-${p.id.slice(0, 6).toUpperCase()}-DRM`,
          projectId: p.id,
          module: 'DRM Final Baseline',
          project: `${p.contractNo || p.id} (${p.name})`,
          requestor: p.manager || 'Project Manager',
          target: 'Commercial Director',
          date: p.startDate || new Date().toISOString().split('T')[0],
          status: isApproved ? 'Approved' : 'Pending Approval',
        });
      }
      return items;
    });
  }, [projects, approvedIds]);

  const handleApprove = (item: ApprovalItem) => {
    setApprovedIds((prev) => ({ ...prev, [item.projectId]: true }));
    updateProject(item.projectId, { status: 'Implementation' });
    toast.success(`Milestone untuk proyek ${item.project} berhasil disetujui!`);
  };

  const filteredApprovals = approvals.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.requestor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && a.status.toLowerCase().includes('pending')) ||
      (statusFilter === 'APPROVED' && a.status.toLowerCase().includes('approved'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Multi-level Approval Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Governance &amp; Decision Authorization Center (PRD Module 12)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Pending Action Queue
            </CardTitle>
            <CardDescription className="text-xs">Filter and authorize project milestone approvals</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search approval ID, project, requestor..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending Only</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Approval ID</TableHead>
                <TableHead>Module Scope</TableHead>
                <TableHead>Project Reference</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Target Approver</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching approvals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApprovals.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs font-bold">{a.id}</TableCell>
                    <TableCell className="text-xs font-medium">{a.module}</TableCell>
                    <TableCell className="text-xs ">{a.project}</TableCell>
                    <TableCell className="text-xs">{a.requestor}</TableCell>
                    <TableCell className="text-xs font-bold text-primary">{a.target}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.date}</TableCell>
                    <TableCell className="text-right">
                      {a.status === 'Approved' ? (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          Approved
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(a)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve Milestone
                        </Button>
                      )}
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
