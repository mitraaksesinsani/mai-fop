'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, GitBranch, ArrowRight, Search, Filter } from 'lucide-react';

export default function RoutePlanningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const segments = [
    { id: 'SEG-01', start: 'POP Jakarta Pusat', end: 'Closure C-01 (Bekasi)', distance: '15.0 KM', cable: '48 Core SM Armored', method: 'Underground Duct', status: 'Planned' },
    { id: 'SEG-02', start: 'Closure C-01 (Bekasi)', end: 'Closure C-02 (Cikarang)', distance: '12.5 KM', cable: '48 Core SM Armored', method: 'Underground Direct Buried', status: 'Planned' },
    { id: 'SEG-03', start: 'Closure C-02 (Cikarang)', end: 'POP Bandung City', distance: '17.5 KM', cable: '48 Core SM Aerial', method: 'Aerial Pole Attachment', status: 'Planned' },
  ];

  const fiberAllocations = [
    { core: '01 - 12', usage: 'Main Backbone Traffic (Customer A)', status: 'Active Used', color: 'bg-blue-500' },
    { core: '13 - 24', usage: 'Secondary Access Traffic (Customer B)', status: 'Active Used', color: 'bg-indigo-500' },
    { core: '25 - 36', usage: 'Enterprise Branch Redundancy', status: 'Reserved', color: 'bg-amber-500' },
    { core: '37 - 48', usage: 'Spare Cores for Future Expansion', status: 'Available Spare', color: 'bg-slate-400' },
  ];

  const filteredSegments = segments.filter((seg) => {
    const matchesSearch =
      seg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.start.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.end.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.cable.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod =
      methodFilter === 'ALL' || seg.method.toLowerCase().includes(methodFilter.toLowerCase());

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Route &amp; Fiber Allocation (Catuan)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            End-to-End Route Segments and Core Allocation Mapping (PRD Module 2 Section 9 &amp; 11)
          </p>
        </div>
      </div>

      {/* Route Segments Table */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Defined Route Segments (PRJ-2026-001)
            </CardTitle>
            <CardDescription className="text-xs">Search route start/end points and filter installation methods</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search segment ID, POP, cable type..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={methodFilter} onValueChange={(val) => val && setMethodFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="duct">Duct</SelectItem>
                <SelectItem value="buried">Direct Buried</SelectItem>
                <SelectItem value="aerial">Aerial Pole</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment ID</TableHead>
                <TableHead>Start Point</TableHead>
                <TableHead></TableHead>
                <TableHead>End Point</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Cable Type</TableHead>
                <TableHead>Installation Method</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-xs text-muted-foreground">
                    No matching route segments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSegments.map((seg) => (
                  <TableRow key={seg.id}>
                    <TableCell className="font-mono text-xs font-bold">{seg.id}</TableCell>
                    <TableCell className="text-xs font-medium">{seg.start}</TableCell>
                    <TableCell><ArrowRight className="w-3.5 h-3.5 text-muted-foreground" /></TableCell>
                    <TableCell className="text-xs font-medium">{seg.end}</TableCell>
                    <TableCell className="text-xs font-bold">{seg.distance}</TableCell>
                    <TableCell className="text-xs">{seg.cable}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{seg.method}</Badge></TableCell>
                    <TableCell className="text-right"><Badge variant="secondary" className="text-[10px]">{seg.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* End-to-End Fiber Allocation (Catuan) */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            End-to-End Fiber Core Allocation (48 Core SM)
          </CardTitle>
          <CardDescription className="text-xs">Catuan mapping from Origin POP to Destination Endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fiberAllocations.map((alloc) => (
              <div key={alloc.core} className="p-4 rounded-lg border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Core Range</span>
                  <Badge variant="outline" className="text-[10px]">{alloc.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${alloc.color}`} />
                  <span className="text-sm font-bold">Cores {alloc.core}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alloc.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
