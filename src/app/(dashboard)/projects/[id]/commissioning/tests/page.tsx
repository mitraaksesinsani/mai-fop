'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, CheckCircle2, XCircle, FileText, Search, Filter } from 'lucide-react';

export default function CommissioningTestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');

  const otdrResults = [
    { testId: 'OTDR-001', fiberId: 'Core 01 (SM)', direction: 'A -> B', distance: '45.12 KM', totalLoss: '12.4 dB', eventLoss: '0.05 dB', result: 'PASS' },
    { testId: 'OTDR-002', fiberId: 'Core 02 (SM)', direction: 'A -> B', distance: '45.10 KM', totalLoss: '12.6 dB', eventLoss: '0.04 dB', result: 'PASS' },
    { testId: 'OTDR-003', fiberId: 'Core 03 (SM)', direction: 'A -> B', distance: '45.15 KM', totalLoss: '18.2 dB', eventLoss: '2.10 dB (Splice High Loss)', result: 'FAIL' },
  ];

  const powerResults = [
    { fiberId: 'Core 01', txPower: '+3.0 dBm', rxPower: '-9.5 dBm', loss: '12.5 dB', margin: '6.5 dB', result: 'PASS' },
    { fiberId: 'Core 02', txPower: '+3.0 dBm', rxPower: '-9.6 dBm', loss: '12.6 dB', margin: '6.4 dB', result: 'PASS' },
  ];

  const filteredOtdr = otdrResults.filter((r) => {
    const matchesSearch =
      r.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fiberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.eventLoss.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult =
      resultFilter === 'ALL' || r.result === resultFilter;

    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">OTDR &amp; Power Meter Test Results</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Fiber Quality Measurement &amp; Continuity Validation (PRD Module 6 Section 9-10)
          </p>
        </div>
      </div>

      {/* OTDR Table */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              OTDR Trace Measurement Results (PRJ-2026-001)
            </CardTitle>
            <CardDescription className="text-xs">Search OTDR trace test ID or fiber core</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search test ID, core..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={resultFilter} onValueChange={(val) => val && setResultFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Results</SelectItem>
                <SelectItem value="PASS">PASS Only</SelectItem>
                <SelectItem value="FAIL">FAIL Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test ID</TableHead>
                <TableHead>Fiber Core ID</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Measured Distance</TableHead>
                <TableHead>Total Loss (dB)</TableHead>
                <TableHead>Event Loss</TableHead>
                <TableHead className="text-right">Test Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOtdr.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    No matching OTDR results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOtdr.map((r) => (
                  <TableRow key={r.testId}>
                    <TableCell className="font-mono text-xs font-bold">{r.testId}</TableCell>
                    <TableCell className="text-xs font-medium">{r.fiberId}</TableCell>
                    <TableCell className="text-xs">{r.direction}</TableCell>
                    <TableCell className="text-xs font-mono">{r.distance}</TableCell>
                    <TableCell className="text-xs font-bold">{r.totalLoss}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.eventLoss}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={r.result === 'PASS' ? 'default' : 'destructive'} className={r.result === 'PASS' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}>
                        {r.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Optical Power Table */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Optical Power Measurement (OPM)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fiber Core</TableHead>
                <TableHead>TX Power</TableHead>
                <TableHead>RX Power</TableHead>
                <TableHead>Total Loss</TableHead>
                <TableHead>Optical Margin</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {powerResults.map((p) => (
                <TableRow key={p.fiberId}>
                  <TableCell className="font-medium text-xs">{p.fiberId}</TableCell>
                  <TableCell className="text-xs">{p.txPower}</TableCell>
                  <TableCell className="text-xs">{p.rxPower}</TableCell>
                  <TableCell className="text-xs font-bold">{p.loss}</TableCell>
                  <TableCell className="text-xs text-emerald-600 font-bold">{p.margin}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">
                      {p.result}
                    </Badge>
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
