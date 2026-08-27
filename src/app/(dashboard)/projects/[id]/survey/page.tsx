'use client';

import { useState } from 'react';
import { MapPin, AlertTriangle, ArrowRight, FileCheck, CheckCircle2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SurveyManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');

  const deviations = [
    { segment: 'SEG-01 (Jakarta-Bekasi)', planDistance: '15.0 KM', actualDistance: '16.2 KM', planCost: 'Rp 500 M', actualCost: 'Rp 540 M', reasonCode: 'CH01', reason: 'Existing Infrastructure Obstacle' },
    { segment: 'SEG-02 (Bekasi-Cikarang)', planDistance: '12.5 KM', actualDistance: '14.0 KM', planCost: 'Rp 450 M', actualCost: 'Rp 520 M', reasonCode: 'CH02', reason: 'Permit Limitation on National Road' },
    { segment: 'SEG-03 (Cikarang-Bandung)', planDistance: '17.5 KM', actualDistance: '18.0 KM', planCost: 'Rp 600 M', actualCost: 'Rp 610 M', reasonCode: 'CH03', reason: 'Road Condition & Bridge Crossing' },
  ];

  const filteredDeviations = deviations.filter((dev) => {
    const matchesSearch =
      dev.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.reasonCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReason =
      reasonFilter === 'ALL' || dev.reasonCode === reasonFilter;

    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Survey Management &amp; Validation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Field Validation, Route Difference Tracking &amp; Reason Code Mapping (PRD Module 3)
          </p>
        </div>
      </div>

      {/* Route Difference Tracking */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Field Validation: Planning vs Actual Comparison
            </CardTitle>
            <CardDescription className="text-xs">PRJ-2026-001 Field Survey Deviations</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search segment, reason, code..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={reasonFilter} onValueChange={(val) => val && setReasonFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Reason Code" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Codes</SelectItem>
                <SelectItem value="CH01">CH01 (Infrastructure)</SelectItem>
                <SelectItem value="CH02">CH02 (Permit Issue)</SelectItem>
                <SelectItem value="CH03">CH03 (Road Condition)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Segment</TableHead>
                <TableHead>Planned Distance</TableHead>
                <TableHead>Actual Distance</TableHead>
                <TableHead>Planned Cost</TableHead>
                <TableHead>Actual Survey Cost</TableHead>
                <TableHead>Reason Code</TableHead>
                <TableHead>Change Reason Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeviations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching survey deviations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeviations.map((dev) => (
                  <TableRow key={dev.segment}>
                    <TableCell className="font-medium text-xs">{dev.segment}</TableCell>
                    <TableCell className="text-xs">{dev.planDistance}</TableCell>
                    <TableCell className="text-xs font-bold text-amber-600">{dev.actualDistance}</TableCell>
                    <TableCell className="text-xs">{dev.planCost}</TableCell>
                    <TableCell className="text-xs font-bold text-destructive">{dev.actualCost}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] bg-amber-500/10 text-amber-600 border-amber-300">
                        {dev.reasonCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{dev.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Reason Codes Legend */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Master Change Reason Codes (PRD Module 3 Section 9)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH01</span>: Existing Infrastructure</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH02</span>: Permit Issue</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH03</span>: Road Condition</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH04</span>: Cost Optimization</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH05</span>: Customer Request</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH06</span>: Safety Requirement</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH07</span>: Environmental Condition</div>
            <div className="p-2 border rounded bg-card"><span className="font-mono font-bold text-primary">CH08</span>: Technical Limitation</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
