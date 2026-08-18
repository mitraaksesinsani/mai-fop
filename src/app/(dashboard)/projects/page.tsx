'use client';

import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  MapPin,
  Building,
  FileText,
  CheckCircle2,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Projects strictly following PRD-MAIN Entity 1 (projects) & Customer
  const projects = [
    {
      id: 'PRJ-2026-001',
      code: 'FOPLP-BB-001',
      name: 'Backbone Fiber Jakarta - Bandung',
      customer: 'PT Telkomsel Tbk',
      type: 'Backbone Fiber',
      location: 'DKI Jakarta & Jawa Barat',
      contractNo: 'CTR/TEL/2026/089',
      startDate: '2026-01-15',
      targetDate: '2026-06-30',
      manager: 'Budi Santoso',
      status: 'Implementation',
    },
    {
      id: 'PRJ-2026-002',
      code: 'FOPLP-MT-002',
      name: 'Metro Ring Surabaya East',
      customer: 'PT Indosat Tbk',
      type: 'Metro Fiber',
      location: 'Surabaya, Jawa Timur',
      contractNo: 'CTR/ISAT/2026/042',
      startDate: '2026-02-01',
      targetDate: '2026-05-15',
      manager: 'Siti Rahma',
      status: 'Survey',
    },
    {
      id: 'PRJ-2026-003',
      code: 'FOPLP-FTTX-003',
      name: 'FTTx Access Cluster Medan Center',
      customer: 'PT XL Axiata Tbk',
      type: 'FTTx',
      location: 'Medan, Sumatera Utara',
      contractNo: 'CTR/XL/2026/104',
      startDate: '2026-03-10',
      targetDate: '2026-07-20',
      manager: 'Ahmad Hidayat',
      status: 'DRM',
    },
    {
      id: 'PRJ-2026-004',
      code: 'FOPLP-ENT-004',
      name: 'Enterprise Link Bank Mandiri HQ',
      customer: 'Bank Mandiri',
      type: 'Enterprise Fiber',
      location: 'Jakarta Selatan',
      contractNo: 'CTR/BM/2026/012',
      startDate: '2026-02-15',
      targetDate: '2026-04-10',
      manager: 'Dewi Lestari',
      status: 'Commissioning',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Master Control</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, manage and control Fiber Optic project lifecycles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/projects/classification">
            <Button variant="outline" className="gap-2 text-xs">
              View Classifications
            </Button>
          </Link>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={
              <Button className="gap-2 text-xs shadow-none">
                <Plus className="w-4 h-4" />
                Create New Project
              </Button>
            } />
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Fiber Optic Project</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Project Code</Label>
                  <Input placeholder="e.g. FOPLP-BB-005" />
                </div>
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input placeholder="e.g. Backbone Fiber Semarang - Solo" />
                </div>
                <div className="space-y-2">
                  <Label>Customer / Client</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telkomsel">PT Telkomsel Tbk</SelectItem>
                      <SelectItem value="indosat">PT Indosat Tbk</SelectItem>
                      <SelectItem value="xl">PT XL Axiata Tbk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Project Classification</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backbone">Backbone Fiber</SelectItem>
                      <SelectItem value="metro">Metro Fiber</SelectItem>
                      <SelectItem value="fttx">FTTx Access</SelectItem>
                      <SelectItem value="enterprise">Enterprise Fiber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Location</Label>
                  <Input placeholder="e.g. Jawa Tengah" />
                </div>
                <div className="space-y-2">
                  <Label>Contract Number</Label>
                  <Input placeholder="e.g. CTR/2026/099" />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Target Completion Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Project Manager (PIC)</Label>
                  <Input placeholder="e.g. Budi Santoso" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsModalOpen(false)}>Save & Start Lifecycle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects Table & Filters */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Active Project Master List</CardTitle>
            <CardDescription className="text-xs">Single source of truth for all project lifecycles</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search project code or name..." 
                className="pl-8 text-xs"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Code & Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contract No</TableHead>
                <TableHead>Project Manager</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead className="text-right">Lifecycle Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>{p.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{p.code} ({p.id})</div>
                  </TableCell>
                  <TableCell className="text-xs">{p.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-semibold">{p.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{p.location}</TableCell>
                  <TableCell className="text-xs font-mono">{p.contractNo}</TableCell>
                  <TableCell className="text-xs">{p.manager}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {p.startDate} &rarr; {p.targetDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
