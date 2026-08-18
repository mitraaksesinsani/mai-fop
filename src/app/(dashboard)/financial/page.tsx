'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CircleDollarSign, TrendingUp } from 'lucide-react';

export default function FinancialControlPage() {
  const financialSummary = [
    { project: 'PRJ-2026-001 (Jakarta-Bandung)', contractVal: 'Rp 18.400.000.000', estCost: 'Rp 13.468.800.000', actCost: 'Rp 13.468.800.000', profit: 'Rp 4.931.200.000', margin: '26.8%', status: 'Yellow Alert' },
    { project: 'PRJ-2026-002 (Surabaya East)', contractVal: 'Rp 4.100.000.000', estCost: 'Rp 3.100.000.000', actCost: 'Rp 3.100.000.000', profit: 'Rp 1.000.000.000', margin: '24.4%', status: 'Yellow Alert' },
    { project: 'PRJ-2026-003 (Medan Center)', contractVal: 'Rp 2.100.000.000', estCost: 'Rp 1.800.000.000', actCost: 'Rp 1.800.000.000', profit: 'Rp 300.000.000', margin: '14.2%', status: 'Red Alert' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial & Margin Control</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise Profitability, Revenue & Cost Monitoring (PRD Module 2 Section 14-15)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0 bg-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-primary" />
            Active Project Financial Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Reference</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Estimated Cost</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Calculated Profit</TableHead>
                <TableHead>Margin %</TableHead>
                <TableHead className="text-right">Financial Alert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialSummary.map((f) => (
                <TableRow key={f.project}>
                  <TableCell className="font-medium text-xs">{f.project}</TableCell>
                  <TableCell className="text-xs font-semibold">{f.contractVal}</TableCell>
                  <TableCell className="text-xs">{f.estCost}</TableCell>
                  <TableCell className="text-xs">{f.actCost}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600">{f.profit}</TableCell>
                  <TableCell className="text-xs font-bold">{f.margin}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={f.status.includes('Red') ? 'destructive' : 'secondary'} className={f.status.includes('Yellow') ? 'bg-amber-500/10 text-amber-600 border-amber-300' : ''}>
                      {f.status}
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
